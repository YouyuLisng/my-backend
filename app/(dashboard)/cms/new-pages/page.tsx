'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Globe, 
    Lock,
    ExternalLink,
    MoreHorizontal,
    LayoutGrid,
    CalendarDays
} from 'lucide-react';
import { getNewPages, deleteNewPage } from './actions/newPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewPagesListPage() {
    const { toast } = useToast();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // 載入資料
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getNewPages();
            if (res.success) {
                setPages(res.data || []);
            } else {
                toast({ variant: 'destructive', title: '載入失敗', description: res.message });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 處理刪除頁面
    const handleDelete = async (id: string) => {
        if (!confirm('確定要刪除此活動頁嗎？此動作無法復原。')) return;
        
        const res = await deleteNewPage(id);
        if (res.success) {
            toast({ title: '刪除成功', description: '該頁面已從系統中移除' });
            loadData();
        } else {
            toast({ variant: 'destructive', title: '刪除失敗', description: res.message });
        }
    };

    // 綜合過濾邏輯：支援 標題、Slug 與 產品編號 搜尋
    const filteredPages = pages.filter(p => {
        const term = search.toLowerCase();
        return (
            p.title?.toLowerCase().includes(term) || 
            p.slug?.toLowerCase().includes(term) ||
            p.products?.some((group: any) => 
                group.productIds?.some((id: string) => id.toLowerCase().includes(term))
            )
        );
    });

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* 頁首：標題與功能按鈕 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-8">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                        <LayoutGrid className="text-blue-600 size-8" />
                        活動頁面管理
                    </h1>
                    <p className="text-slate-500 font-medium italic">
                        精準控管全站行銷活動、產品分組配置與 SEO 追蹤
                    </p>
                </div>
                <Button asChild>
                    <Link href="/cms/new-pages/create">
                        建立新活動頁
                    </Link>
                </Button>
            </div>

            {/* 工具列：搜尋與狀態統計 */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                <div className="relative flex-1 max-w-lg group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                        placeholder="搜尋頁面標題、路徑或產品編號..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 bg-white border-slate-200 focus:ring-4 focus:ring-blue-50 transition-all rounded-xl h-12 text-base font-medium"
                    />
                </div>
                <div className="flex items-center gap-3 px-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">顯示結果</p>
                        <p className="text-lg font-black text-slate-700 leading-tight">{filteredPages.length}</p>
                    </div>
                </div>
            </div>

            {/* 資料列表 */}
            <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px] h-14 pl-8 w-[45%]">活動頁面 / URL</TableHead>
                            <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px]">模式</TableHead>
                            <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px]">發佈狀態</TableHead>
                            <TableHead className="font-black text-slate-500 uppercase tracking-wider text-[11px]">更新於</TableHead>
                            <TableHead className="text-right font-black text-slate-500 uppercase tracking-wider text-[11px] pr-8">管理</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-slate-50">
                                    <TableCell colSpan={5} className="p-4"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredPages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-24 text-slate-300 italic font-medium">
                                    <Search className="size-12 mx-auto mb-4 opacity-10" />
                                    目前沒有符合條件的活動頁面
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPages.map((page) => (
                                <TableRow key={page.id} className="hover:bg-blue-50/20 transition-colors group border-slate-50">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                                                {page.title}
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-mono flex items-center tracking-tighter">
                                                <ExternalLink size={10} className="mr-1 text-slate-300" /> 
                                                /pages/{page.slug}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-bold px-3 py-1 rounded-lg ${
                                            page.mode === 'GRUP' 
                                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {page.mode === 'GRUP' ? '團型' : '團體'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {page.enabled ? (
                                            <div className="flex items-center text-emerald-600 font-black text-xs uppercase">
                                                <div className="size-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                                                已發佈
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-slate-300 font-bold text-xs uppercase">
                                                <div className="size-2 bg-slate-200 rounded-full mr-2" />
                                                草稿
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-xs font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarDays size={12} className="text-slate-300" />
                                            {new Date(page.updatedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                                                    <MoreHorizontal className="size-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-2xl border-slate-100">
                                                <DropdownMenuItem asChild className="rounded-xl py-2.5 focus:bg-blue-50 focus:text-blue-600 cursor-pointer font-bold">
                                                    <Link href={`/cms/new-pages/${page.id}`}>
                                                        <Edit className="mr-3 size-4" /> 編輯頁面配置
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="rounded-xl py-2.5 text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer font-bold"
                                                    onClick={() => handleDelete(page.id)}
                                                >
                                                    <Trash2 className="mr-3 size-4" /> 刪除此活動頁
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}