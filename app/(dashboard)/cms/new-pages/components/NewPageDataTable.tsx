'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
    Image as ImageIcon,
    Lock,
} from 'lucide-react';
import { NewPage } from '@prisma/client';

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
import { toast } from "sonner";
import {
    deleteNewPage,
    toggleNewPageStatus,
} from '../actions/newPage';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// 定義角色權限
type Role = 'DEV' | 'PLANNING' | 'PRODUCT';

// --- 1. 定義可拖曳的 Row 元件 ---
const DraggableRow = ({ row, canDrag }: { row: Row<NewPage>; canDrag: boolean }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: row.original.id,
        disabled: !canDrag, // ✅ 如果是產品部則禁用拖曳排序
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
                                {...(canDrag ? attributes : {})}
                                {...(canDrag ? listeners : {})}
                                className={`${canDrag ? 'cursor-grab hover:text-primary' : 'cursor-not-allowed opacity-20'} flex justify-center items-center w-8 h-8 rounded-md hover:bg-accent`}
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
interface PageActionsCellProps {
    page: NewPage;
    onDeleteClick: (id: string) => void;
    isProduct: boolean;
}

const PageActionsCell = ({
    page,
    onDeleteClick,
    isProduct,
}: PageActionsCellProps) => {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>操作</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                        <Link href={`/cms/new-pages/${page.id}`}>
                            <Pencil className="mr-2 h-4 w-4" /> 
                            {isProduct ? '配置產品' : '編輯內容'}
                        </Link>
                    </DropdownMenuItem>
                    
                    {/* ✅ 非產品部才顯示刪除選項 */}
                    {!isProduct && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => onDeleteClick(page.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> 刪除
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

// --- 3. 主組件 ---
interface NewPageDataTableProps {
    data: NewPage[];
    userRole?: Role; // ✅ 新增：接收使用者角色
}

export function NewPageDataTable({
    data: initialData,
    userRole = 'PRODUCT', // 預設為最嚴格的產品部權限
}: NewPageDataTableProps) {
    const [data, setData] = React.useState(initialData);
    const { show, hide } = useLoadingStore();

    // 權限判定
    const isProduct = userRole === 'PRODUCT';
    const canManagePage = !isProduct; // 是否能建立、刪除或切換狀態

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});

    const dndContextId = React.useId();

    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const getDisplayUrl = (slug: string) => {
        if (!slug) return '';
        const baseUrl = 'https://www.dtsgroup.com.tw';
        return `${baseUrl}/pages/${slug}`;
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        if (isProduct) return; // 權限攔截

        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, enabled: !currentStatus } : item
            )
        );
        show();
        try {
            const result = await toggleNewPageStatus(id, currentStatus);
            if (!result.success) {
                toast.error('更新失敗', { description: result.message });
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, enabled: currentStatus } : item
                    )
                );
            } else {
                toast.success('狀態已更新');
            }
        } catch (error) {
            setData((prev) =>
                prev.map((item) =>
                    item.id === id ? { ...item, enabled: currentStatus } : item
                )
            );
            toast.error('發生錯誤');
        } finally {
            hide();
        }
    };

    const handleDeleteClick = (id: string) => {
        if (isProduct) return;
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId || isProduct) return;

        setDeleteDialogOpen(false);
        show();

        try {
            const result = await deleteNewPage(deleteId);
            if (result.success) {
                toast.success('刪除成功');
                setData((prev) => prev.filter((item) => item.id !== deleteId));
            } else {
                toast.error('刪除失敗');
            }
        } catch (error) {
            toast.error('發生錯誤');
        } finally {
            hide();
            setDeleteId(null);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        if (isProduct) return;
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = data.findIndex((item) => item.id === active.id);
        const newIndex = data.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newData = arrayMove(data, oldIndex, newIndex);
            setData(newData);
            toast.info("排序已更新");
        }
    };

    const columns = React.useMemo<ColumnDef<NewPage>[]>(
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
                accessorKey: 'mainImage',
                header: '主圖',
                size: 100,
                cell: ({ row }) => {
                    const imgUrl = row.getValue('mainImage') as string;
                    return (
                        <div className="relative h-12 w-20 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                            {imgUrl ? (
                                <Image
                                    src={imgUrl}
                                    alt={row.original.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                    unoptimized // 👈 暫時加入，避免網域未設定錯誤
                                />
                            ) : (
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                        </div>
                    );
                },
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
                accessorKey: 'slug',
                header: '網址路徑',
                cell: ({ row }) => {
                    const slug = row.getValue('slug') as string;
                    const displayUrl = getDisplayUrl(slug);

                    return (
                        <a
                            href={displayUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:underline max-w-[300px]"
                            title={displayUrl}
                        >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">/{slug}</span>
                        </a>
                    );
                },
            },
            {
                accessorKey: 'enabled',
                header: '啟用狀態',
                size: 80,
                cell: ({ row }) => (
                    <Switch
                        checked={row.getValue('enabled') as boolean}
                        disabled={isProduct} // ✅ 產品部不可操作
                        onCheckedChange={() => handleToggleStatus(row.original.id, row.getValue('enabled'))}
                    />
                ),
            },
            {
                id: 'actions',
                size: 60,
                enableHiding: false,
                cell: ({ row }) => (
                    <PageActionsCell
                        page={row.original}
                        onDeleteClick={handleDeleteClick}
                        isProduct={isProduct}
                    />
                ),
            },
        ],
        [isProduct]
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
        state: { sorting, columnFilters, columnVisibility },
        getRowId: (row) => row.id,
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="搜尋標題..."
                    value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            欄位顯示 <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                className="capitalize"
                                checked={column.getIsVisible()}
                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                {column.id === 'mainImage' ? '主圖' :
                                 column.id === 'title' ? '標題' : 
                                 column.id === 'slug' ? '路徑' : 
                                 column.id === 'enabled' ? '狀態' : column.id}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* ✅ 權限控制：只有非產品部可以建立 */}
                {!isProduct ? (
                    <Button asChild>
                        <Link href="/cms/new-pages/create">新增活動頁</Link>
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md text-slate-400 bg-slate-50 text-sm">
                        <Lock size={14} />
                        權限受限
                    </div>
                )}
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <DndContext id={dndContextId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            <SortableContext items={table.getRowModel().rows.map((row) => row.original.id)} strategy={verticalListSortingStrategy}>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <DraggableRow key={row.id} row={row} canDrag={canManagePage} />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">暫無資料</TableCell>
                                    </TableRow>
                                )}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>
            </div>

            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">總共 {table.getFilteredRowModel().rows.length} 筆資料</div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>上一頁</Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>下一頁</Button>
                </div>
            </div>
            
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="確定要刪除此活動頁嗎？"
                description="刪除後將無法復原，請確認是否繼續。"
                confirmText="確認刪除"
                cancelText="取消"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    );
}