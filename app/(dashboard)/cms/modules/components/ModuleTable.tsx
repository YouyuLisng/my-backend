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
} from '@tanstack/react-table';
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronDown,
    Image as ImageIcon,
    Eye, 
} from 'lucide-react';
import { Module } from '@prisma/client'; 

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
import { toast } from "sonner" 

import {
    deleteModule,
    toggleModuleStatus,
} from '../actions/module';

import ModuleFormDialog from './ModuleFormDialog'; 
import { useLoadingStore } from '@/stores/useLoadingStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';

// --- 1. Action Cell 組件 ---
interface ModuleActionsCellProps {
    module: Module;
    onDeleteClick: (id: string) => void; 
}

const ModuleActionsCell = ({ module, onDeleteClick }: ModuleActionsCellProps) => {
    const [showEditDialog, setShowEditDialog] = React.useState(false);

    return (
        <>
            <ModuleFormDialog
                initialData={module}
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
                    <DropdownMenuItem asChild>
                        <Link href={`/cms/modules/${module.id}/cards`} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> 查看卡片列表
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> 編輯
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => onDeleteClick(module.id)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> 刪除
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};

// --- 2. 主組件 ---
interface ModuleDataTableProps {
    data: Module[];
}

export function ModuleDataTable({ data: initialData }: ModuleDataTableProps) {
    const [data, setData] = React.useState(initialData);
    
    const { show, hide } = useLoadingStore();

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

    React.useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setData((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, isActive: !currentStatus } : item
            )
        );

        show();

        try {
            const result = await toggleModuleStatus(id, currentStatus);

            if (!result.success) {
                
                toast.error('更新失敗', {
                    description: result.error,
                });
                setData((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, isActive: currentStatus } : item
                    )
                );
            } else {
                
                toast.success('狀態已更新');
            }
        } catch (error) {
            console.error(error);
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

    const handleDeleteClick = (id: string) => {
        setDeleteId(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setDeleteDialogOpen(false);
        show();

        try {
            const result = await deleteModule(deleteId);
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

    const columns = React.useMemo<ColumnDef<Module>[]>(
        () => [
            {
                accessorKey: 'icon',
                header: '圖片',
                size: 100,
                cell: ({ row }) => {
                    const imgUrl = row.getValue('icon') as string;
                    return (
                        <div className="relative h-16 w-24 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                            {imgUrl ? (
                                <img
                                    src={imgUrl}
                                    alt={row.original.title}
                                    className="w-full h-full object-contain p-1"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'title',
                header: '模組標題',
                size: 200,
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-base">
                            {row.getValue('title')}
                        </span>
                        {row.original.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {row.original.description}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'description',
                header: '描述',
                cell: ({ row }) => {
                    const desc = row.getValue('description') as string | null;
                    return desc ? (
                        <span className="text-sm text-muted-foreground block max-w-[300px] truncate">
                            {desc}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">-</span>
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
                    <ModuleActionsCell
                        module={row.original}
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
            <div className="flex items-center gap-2">
                <Input
                    placeholder="搜尋標題..."
                    value={
                        (table.getColumn('title')?.getFilterValue() as string) ?? ''
                    }
                    onChange={(event) =>
                        table.getColumn('title')?.setFilterValue(event.target.value)
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
                                        {column.id === 'icon' ? '圖示' : 
                                         column.id === 'title' ? '標題' : 
                                         column.id === 'description' ? '描述' :
                                         column.id === 'isActive' ? '狀態' : column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <ModuleFormDialog
                    trigger={
                        <Button>
                            新增模組
                        </Button>
                    }
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{
                                            width:
                                                header.column.getSize() !== 150
                                                    ? header.column.getSize()
                                                    : undefined,
                                        }}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
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
                    </TableBody>
                </Table>
            </div>

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
                title="確定要刪除此模組嗎？"
                description="這將會永久刪除該模組及其關聯資料，此動作無法復原。"
                confirmText="確認刪除"
                cancelText="取消"
                variant="destructive"
                onConfirm={confirmDelete}
            />
        </div>
    );
}