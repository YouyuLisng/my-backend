'use client';

import * as React from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type Row,
} from '@tanstack/react-table';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    MoreHorizontal,
    GripVertical,
    Pencil,
    Trash2,
    ExternalLink,
    ChevronDown,
} from 'lucide-react';
import { HotKeyword } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
    deleteHotKeyword,
    toggleHotKeywordStatus,
    reorderHotKeywords,
} from '../actions/hotKeyword';
import HotKeywordFormDialog from './HotKeywordFormDialog';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// --- 1. 定義可拖曳的 Row 元件 ---
const DraggableRow = ({ row }: { row: Row<HotKeyword> }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.original.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
        position: 'relative' as const,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            data-state={row.getIsSelected() && 'selected'}
            className={isDragging ? 'bg-muted' : ''}
        >
            {row.getVisibleCells().map((cell) => {
                const isDragColumn = cell.column.id === 'drag-handle';

                return (
                    <TableCell
                        key={cell.id}
                        className={`py-3 ${
                            isDragColumn ? 'w-[1%] whitespace-nowrap px-2' : ''
                        }`}
                    >
                        {isDragColumn ? (
                            <div
                                {...attributes}
                                {...listeners}
                                className="cursor-grab hover:text-primary flex justify-center items-center w-8 h-8 rounded-md hover:bg-accent"
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </div>
                        ) : (
                            flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                            )
                        )}
                    </TableCell>
                );
            })}
        </TableRow>
    );
};

// --- 2. 獨立出 Action Cell 組件 ---
interface KeywordActionsCellProps {
    keyword: HotKeyword;
    onDeleteClick: (id: string) => void;
}

const KeywordActionsCell = ({
    keyword,
    onDeleteClick,
}: KeywordActionsCellProps) => {
    const [showEditDialog, setShowEditDialog] = React.useState(false);

    return (
        <>
            <HotKeywordFormDialog
                initialData={keyword}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> 編輯
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => onDeleteClick(keyword.id)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> 刪除
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

// --- 3. 主組件 ---
interface HotKeywordDataTableProps {
    data: HotKeyword[];
}

export function HotKeywordDataTable({
    data: initialData,
}: HotKeywordDataTableProps) {
    const [data, setData] = React.useState(initialData);
    const { toast } = useToast();
    const { show, hide } = useLoadingStore();

    // 刪除對話框狀態
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    // --- Table States ---
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const dndContextId = React.useId();

    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // ✅ 新增：處理網址顯示邏輯
    const getDisplayUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const baseUrl = 'https://dts-iota.vercel.app';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    // --- Actions: 切換狀態 ---
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isActive: !currentStatus } : item
            )
        );
        show();
        try {
            const result = await toggleHotKeywordStatus(id, currentStatus);
            if (!result.success) {
                toast({
                    variant: 'destructive',
                    title: '更新失敗',
                    description: result.error,
                });
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, isActive: currentStatus }
                            : item
                    )
                );
            } else {
                toast({ title: '狀態已更新' });
            }
        } catch (error) {
            console.error(error);
            setData((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, isActive: currentStatus } : item
                )
            );
            toast({ variant: 'destructive', title: '發生錯誤' });
        } finally {
            hide();
        }
    };

    // --- Actions: 刪除流程 ---
    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setDeleteDialogOpen(false);
        show();

        try {
            const result = await deleteHotKeyword(deleteId);
            if (result.success) {
                toast({ title: '刪除成功' });
                setData((prev) => prev.filter((item) => item.id !== deleteId));
            } else {
                toast({ variant: 'destructive', title: '刪除失敗' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: '發生錯誤' });
        } finally {
            hide();
            setDeleteId(null);
        }
    };

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Actions: 拖曳排序 ---
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(data, oldIndex, newIndex);
            setData(newData);

            if (columnFilters.length === 0) {
                show();
                try {
                    const idList = newData.map((item, index) => ({
                        id: item.id,
                        sortOrder: index,
                    }));
                    const result = await reorderHotKeywords(idList);
                    if (!result.success) {
                        toast({
                            variant: 'destructive',
                            title: '排序更新失敗',
                        });
                        setData(initialData);
                    }
                } catch (error) {
                    console.error(error);
                    setData(initialData);
                    toast({ variant: 'destructive', title: '發生錯誤' });
                } finally {
                    hide();
                }
            }
        }
    };

    // --- Columns 定義 ---
    const columns = React.useMemo<ColumnDef<HotKeyword>[]>(
        () => [
            {
                id: 'drag-handle',
                header: '',
                size: 40,
                maxSize: 40,
                enableHiding: false,
                cell: () => <GripVertical className="h-5 w-5 text-gray-400" />,
            },
            {
                accessorKey: 'order',
                header: '排序',
                size: 60,
                cell: ({ row }) => (
                    <span className="text-muted-foreground font-mono text-base">
                        #{row.getValue('order')}
                    </span>
                ),
            },
            {
                accessorKey: 'title',
                header: '標題',
                size: 250,
                cell: ({ row }) => (
                    <span className="font-medium text-base">
                        {row.getValue('title')}
                    </span>
                ),
            },
            {
                accessorKey: 'linkUrl',
                header: '連結',
                cell: ({ row }) => {
                    const rawUrl = row.getValue('linkUrl') as string | null;
                    if (!rawUrl)
                        return (
                            <span className="text-muted-foreground text-xs">
                                -
                            </span>
                        );
                    
                    // ✅ 使用 getDisplayUrl 取得完整網址
                    const displayUrl = getDisplayUrl(rawUrl);

                    return (
                        <a
                            href={displayUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline max-w-[300px]"
                            title={displayUrl} // 滑鼠移上去顯示完整網址
                        >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{displayUrl}</span>
                        </a>
                    );
                },
            },
            {
                accessorKey: 'isActive',
                header: '啟用狀態',
                size: 80,
                cell: ({ row }) => {
                    const isActive = row.getValue('isActive') as boolean;
                    return (
                        <Switch
                            checked={isActive}
                            onCheckedChange={() =>
                                handleToggleStatus(row.original.id, isActive)
                            }
                        />
                    );
                },
            },
            {
                id: 'actions',
                size: 60,
                enableHiding: false,
                cell: ({ row }) => (
                    <KeywordActionsCell
                        keyword={row.original}
                        onDeleteClick={handleDeleteClick}
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
        getRowId: (row) => row.id,
    });

    return (
        <div className="space-y-4">
            {/* 頂部工具列 */}
            <div className="flex items-center gap-2">
                <Input
                    placeholder="搜尋標題..."
                    value={
                        (table
                            .getColumn('title')
                            ?.getFilterValue() as string) ?? ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('title')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            欄位顯示 <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id === 'title'
                                            ? '標題'
                                            : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <HotKeywordFormDialog trigger={<Button>新增關鍵字</Button>} />
            </div>

            {/* 表格區塊 */}
            <div className="rounded-md border">
                <DndContext
                    id={dndContextId}
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{
                                                width:
                                                    header.column.getSize() !==
                                                    150
                                                        ? header.column.getSize()
                                                        : undefined,
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            <SortableContext
                                items={table
                                    .getRowModel()
                                    .rows.map((row) => row.original.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows?.length ? (
                                    table
                                        .getRowModel()
                                        .rows.map((row) => (
                                            <DraggableRow
                                                key={row.id}
                                                row={row}
                                            />
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            暫無資料
                                        </TableCell>
                                    </TableRow>
                                )}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            {/* 底部：分頁 */}
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    總共 {table.getFilteredRowModel().rows.length} 筆資料
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        上一頁
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        下一頁
                    </Button>
                </div>
            </div>
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="確定要刪除此關鍵字嗎？"
                description="刪除後將無法復原，請確認是否繼續。"
                confirmText="確認刪除"
                cancelText="取消"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    );
}