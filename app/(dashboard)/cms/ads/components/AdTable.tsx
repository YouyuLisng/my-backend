'use client';

import * as React from 'react';
import Image from 'next/image';
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
    Plus,
    ExternalLink,
    ChevronDown,
} from 'lucide-react';
import { Ad } from '@prisma/client';

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
import { toast } from "sonner" // ✅ 確認使用 sonner

// Server Actions
import { deleteAd, toggleAdStatus, reorderAds } from '../actions/ad';

// Components
import AdFormDialog from './AdFormDialog';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// --- 1. 定義可拖曳的 Row 元件 ---
const DraggableRow = ({ row }: { row: Row<Ad> }) => {
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
interface AdActionsCellProps {
    ad: Ad;
    onDeleteClick: (id: string) => void;
}

const AdActionsCell = ({ ad, onDeleteClick }: AdActionsCellProps) => {
    const [showEditDialog, setShowEditDialog] = React.useState(false);

    return (
        <>
            <AdFormDialog
                initialData={ad}
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
                        onClick={() => onDeleteClick(ad.id)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> 刪除
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

// --- 3. 主組件 ---
interface AdTableProps {
    data: Ad[];
}

export function AdTable({ data: initialData }: AdTableProps) {
    const [data, setData] = React.useState(initialData);
    const { show, hide } = useLoadingStore();

    // 刪除確認對話框狀態
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    // Table States
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    // SSR Hydration ID
    const dndContextId = React.useId();

    // Sync with Server Data
    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // ✅ 新增：處理網址顯示邏輯
    const getDisplayUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const baseUrl = 'https://www.dtsgroup.com.tw';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    // --- Actions: 切換狀態 ---
    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        // 1. Optimistic Update
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isActive: !currentStatus } : item
            )
        );

        show();

        try {
            const result = await toggleAdStatus(id, currentStatus);

            if (!result.success) {
                // ✅ 改用 Sonner 語法
                toast.error('更新失敗', {
                    description: result.error,
                });
                // Revert
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id
                            ? { ...item, isActive: currentStatus }
                            : item
                    )
                );
            } else {
                toast.success('狀態已更新');
            }
        } catch (error) {
            console.error(error);
            // Revert
            setData((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, isActive: currentStatus } : item
                )
            );
            toast.error('發生錯誤');
        } finally {
            hide();
        }
    };

    // --- Step 1: 點擊刪除按鈕 ---
    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    // --- Step 2: 執行刪除 ---
    const confirmDelete = async () => {
        if (!deleteId) return;

        setDeleteDialogOpen(false);
        show();

        try {
            const result = await deleteAd(deleteId);
            if (result.success) {
                toast.success('刪除成功');
                setData((prev) => prev.filter((item) => item.id !== deleteId));
            } else {
                toast.error('刪除失敗');
            }
        } catch (error) {
            console.error(error);
            toast.error('發生錯誤');
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
                    const idList = newData.map((item) => item.id);
                    const result = await reorderAds(idList);

                    if (!result.success) {
                        toast.error('排序更新失敗');
                        setData(initialData);
                    }
                } catch (error) {
                    console.error(error);
                    setData(initialData);
                    toast.error('發生錯誤');
                } finally {
                    hide();
                }
            }
        }
    };

    // --- Columns 定義 ---
    const columns = React.useMemo<ColumnDef<Ad>[]>(
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
                accessorKey: 'sortOrder',
                header: '排序',
                size: 60,
                cell: ({ row }) => (
                    <span className="text-muted-foreground font-mono text-base">
                        #{row.getValue('sortOrder')}
                    </span>
                ),
            },
            {
                accessorKey: 'image',
                header: '圖片',
                size: 120,
                cell: ({ row }) => (
                    <div className="relative h-16 w-28 overflow-hidden rounded-md border bg-muted">
                        <Image
                            src={row.getValue('image')}
                            alt={row.original.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100px, 150px"
                        />
                    </div>
                ),
            },
            {
                accessorKey: 'title',
                header: '標題',
                size: 200,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {row.getValue('title')}
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: 'href',
                header: '連結',
                cell: ({ row }) => {
                    const rawUrl = row.getValue('href') as string | null;
                    if (!rawUrl)
                        return (
                            <span className="text-muted-foreground text-xs">
                                -
                            </span>
                        );
                    
                    const displayUrl = getDisplayUrl(rawUrl);

                    return (
                        <a
                            href={displayUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline max-w-[200px]"
                            title={displayUrl}
                        >
                            <span className="truncate">{displayUrl}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                    );
                },
            },
            {
                accessorKey: 'isActive',
                header: '狀態',
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
                    <AdActionsCell
                        ad={row.original}
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
                                        {column.id === 'image'
                                            ? '圖片'
                                            : column.id === 'title'
                                            ? '標題'
                                            : column.id === 'href'
                                            ? '連結'
                                            : column.id === 'isActive'
                                            ? '狀態'
                                            : column.id === 'sortOrder'
                                            ? '排序'
                                            : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <AdFormDialog
                    trigger={
                        <Button>
                            新增廣告
                        </Button>
                    }
                />
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

            {/* 刪除確認對話框 */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="確定要刪除此廣告嗎？"
                description="刪除後將無法復原，請確認是否繼續。"
                confirmText="確認刪除"
                cancelText="取消"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    );
}