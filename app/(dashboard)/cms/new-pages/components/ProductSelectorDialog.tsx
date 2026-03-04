'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { fetchProductList } from '@/services/productService';

export default function ProductSelectorDialog({
    mode,
    onConfirm,
    open,
    onOpenChange,
    selectedIds = [],
    refCode = '', // 接收從外部傳入的編號
}: any) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open) {
            setTempSelected([...selectedIds]);
            // 如果是 GRUP 模式，且有傳入 refCode，自動執行一次加載
            if (mode === 'GRUP' && refCode) {
                loadProducts(refCode);
            } else {
                setProducts([]);
            }
        }
    }, [open, selectedIds, mode, refCode]);

    const loadProducts = async (forcedRefCode?: string) => {
        setLoading(true);
        try {
            // ✅ 核心邏輯：如果是 GRUP 模式，強制查詢該團型代碼 (qmgrupcd)
            // 如果不是，則使用搜尋框的關鍵字查詢 qgrupcd
            const params: any = {};
            
            if (mode === 'GRUP') {
                params.qmgrupcd = forcedRefCode || refCode;
                if (search.trim()) params.qgrupcd = search.trim(); // 可以在團型內二次搜尋
            } else {
                params.qgrupcd = search.trim() || undefined;
            }

            const res = await fetchProductList(params);
            setProducts(res.data || []);
        } catch (err) {
            console.error('載入產品失敗', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (id: string) => {
        setTempSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[850px] h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 bg-white border-b flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-6 rounded-full ${mode === 'GRUP' ? 'bg-orange-500' : 'bg-blue-600'}`} />
                        <DialogTitle className="text-xl font-bold">
                            {mode === 'GRUP' ? `選擇團型日期 (${refCode})` : '勾選活動產品'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-slate-50 border-b flex gap-3 flex-shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder={mode === 'GRUP' ? "在團型內搜尋名稱..." : "輸入關鍵字或編號搜尋..."}
                            value={search}
                            className="pl-10 bg-white border-slate-200 focus:ring-4 focus:ring-blue-50 transition-all"
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                        />
                    </div>
                    <Button onClick={() => loadProducts()} disabled={loading} className="bg-slate-800 hover:bg-slate-900 min-w-[100px]">
                        {loading ? <Loader2 className="animate-spin size-4" /> : '搜尋'}
                    </Button>
                </div>

                {mode === 'GRUP' && !products.length && !loading && !search && (
                    <div className="m-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-700 text-sm">
                        <AlertCircle size={18} />
                        正在顯示團型 「{refCode}」 下的所有可選團體日期。
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full p-6 bg-slate-50/30">
                        <div className="grid grid-cols-1 gap-3 pb-4">
                            {products.length === 0 && !loading && (
                                <div className="text-center py-20">
                                    <p className="text-slate-400 italic">查無符合資料</p>
                                </div>
                            )}
                            {products.map((p: any, index: number) => {
                                // GRUP 模式下，ID 一定是個團編號 (productIds 要存的是這個)
                                const id = p['個團編號'] || p['團體編號'];
                                const isSelected = tempSelected.includes(id);

                                return (
                                    <div
                                        key={`${id}-${index}`} 
                                        onClick={() => toggleSelect(id)}
                                        className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                                            isSelected 
                                            ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                            : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(id)}
                                                className="size-5"
                                            />
                                            <div className="relative size-14 rounded-lg overflow-hidden border bg-slate-100 flex-shrink-0">
                                                {p['主圖'] ? (
                                                    <Image 
                                                        src={`https://travel.dtsgroup.com.tw/${p['主圖']}`}
                                                        alt="product" 
                                                        fill 
                                                        className="object-cover" 
                                                        unoptimized
                                                    />
                                                ) : <div className="flex items-center justify-center h-full"><ImageIcon size={20} className="text-slate-300"/></div>}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{p['個團名稱'] || p['產品名稱']}</p>
                                                <div className="flex gap-2">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500">ID: {id}</span>
                                                    {p['出發日期'] && <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold">出發日期: {p['出發日期']}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-orange-600">${p['直客成人售價']?.toLocaleString()}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="p-6 border-t bg-white gap-3 flex-shrink-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>取消</Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 px-8 font-bold"
                        onClick={() => {
                            onConfirm(tempSelected);
                            onOpenChange(false);
                        }}
                    >
                        確認選取 ({tempSelected.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}