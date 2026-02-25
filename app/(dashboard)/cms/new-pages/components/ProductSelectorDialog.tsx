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
import { Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { fetchProductList } from '@/services/productService';

export default function ProductSelectorDialog({
    mode,
    onConfirm,
    open,
    onOpenChange,
    selectedIds = [],
}: any) {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [tempSelected, setTempSelected] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open) {
            setTempSelected(selectedIds);
            loadProducts();
        }
    }, [open]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = {
                [mode === 'GRUP' ? 'qmgrupcd' : 'qgrupcd']: search.trim() || undefined,
            };
            const res = await fetchProductList(params);
            
            let rawData = res.data || [];

            if (mode === 'GRUP') {
                const seen = new Set();
                rawData = rawData.filter((item: any) => {
                    const id = item['團型編號'];
                    if (!id || seen.has(id)) return false;
                    seen.add(id);
                    return true;
                });
            }

            setProducts(rawData);
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
            {/* ✅ 修正：h-[90vh] 確保彈窗不會超出螢幕，flex-col 讓內部佈局可控 */}
            <DialogContent className="sm:max-w-[850px] h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 bg-white border-b flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <DialogTitle className="text-xl font-bold">
                            勾選活動產品 ({mode === 'GRUP' ? '團型模式' : '團體模式'})
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 bg-slate-50 border-b flex gap-3 flex-shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <Input
                            placeholder="輸入關鍵字或編號搜尋..."
                            value={search}
                            className="pl-10 bg-white border-slate-200 focus:ring-4 focus:ring-blue-50 transition-all"
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                        />
                    </div>
                    <Button onClick={loadProducts} disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                        {loading ? <Loader2 className="animate-spin size-4" /> : '搜尋'}
                    </Button>
                </div>

                {/* ✅ 修正：flex-1 讓列表區域自動佔滿剩餘空間，確保 ScrollArea 生效 */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full p-6 bg-slate-50/30">
                        <div className="grid grid-cols-1 gap-3 pb-4">
                            {products.map((p: any, index: number) => {
                                const id = mode === 'GRUP' ? p['團型編號'] : p['團體編號'];
                                const isSelected = tempSelected.includes(id);

                                return (
                                    <div
                                        key={index} 
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
                                                className="size-5 data-[state=checked]:bg-blue-600"
                                            />
                                            
                                            <div className="relative size-16 rounded-lg overflow-hidden border bg-slate-100 flex-shrink-0">
                                                {p['主圖'] ? (
                                                    <Image 
                                                        src={`https://travel.dtsgroup.com.tw/${p['主圖']}`}
                                                        alt={p['產品名稱'] || '行程'}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-slate-300">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                                    {p['產品名稱'] || p['個團名稱'] || '未命名行程'}
                                                </p>
                                                <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">編號: {id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-slate-400 font-bold mb-0.5">直客成人價</p>
                                            <p className="text-lg font-black text-orange-600">
                                                ${p['直客成人售價']?.toLocaleString() || '--'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* ✅ 修正：flex-shrink-0 確保 Footer 不會因為內容多而被壓縮消失，固定在最底部 */}
                <DialogFooter className="p-6 border-t bg-white gap-3 flex-shrink-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-bold text-slate-500">
                        取消
                    </Button>
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