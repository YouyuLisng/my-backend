'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { NewPageFormValues } from '@/schemas/newPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, PackageSearch, ImageIcon, Loader2 } from 'lucide-react';
import ProductSelectorDialog from './ProductSelectorDialog';
import { fetchProductList } from '@/services/productService';

// --- 內部組件：負責根據 ID 顯示詳細資料的卡片 ---
function ProductDetailCard({ id, mode, onRemove }: { id: string, mode: string, onRemove: () => void }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInfo = async () => {
            setLoading(true);
            try {
                // 根據模式傳入對應參數
                const params = {
                    [mode === 'GRUP' ? 'qmgrupcd' : 'qgrupcd']: id,
                };
                const res = await fetchProductList(params);
                if (res.data?.[0]) setData(res.data[0]);
            } catch (err) {
                console.error("抓取產品細節失敗", err);
            } finally {
                setLoading(false);
            }
        };
        loadInfo();
    }, [id, mode]);

    return (
        <div className="group relative flex flex-col bg-white border border-slate-200 p-2 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(20%-12.8px)]">
            {/* 移除按鈕 */}
            <button
                type="button"
                onClick={onRemove}
                className="absolute -top-2 -right-2 bg-white border shadow-sm text-slate-400 hover:text-red-500 rounded-full p-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={14} />
            </button>

            {/* 圖片預覽 - 16:10 比例 */}
            <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border bg-slate-50 flex-shrink-0 mb-2">
                {loading ? (
                    <div className="flex items-center justify-center h-full bg-slate-50">
                        <Loader2 className="size-4 animate-spin text-slate-300" />
                    </div>
                ) : data?.['主圖'] ? (
                    <Image 
                        src={`https://travel.dtsgroup.com.tw/${data['主圖']}`}
                        alt="product" 
                        fill 
                        className="object-cover" 
                        unoptimized
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-200">
                        <ImageIcon size={24} />
                    </div>
                )}
            </div>

            {/* 產品資訊區塊 */}
            <div className="flex flex-col flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 font-mono truncate px-1">
                    {id}
                </span>
                <p className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-[1.3] h-7 px-1">
                    {loading ? '載入中...' : (data?.['產品名稱'] || data?.['個團名稱'] || '未命名行程')}
                </p>
                <p className="text-[13px] font-black text-orange-600 px-1 pt-1">
                    {loading ? '--' : `$${data?.['直客成人售價']?.toLocaleString() || '--'}`}
                </p>
            </div>
        </div>
    );
}

export default function ProductSectionManager({ form }: { form: UseFormReturn<NewPageFormValues> }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'products',
    });

    const mode = form.watch('mode');
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // ✅ 取得當前操作區塊的產品清單，用於傳入 SelectorDialog
    const currentSelectedIds = activeIndex !== null 
        ? form.watch(`products.${activeIndex}.productIds`) 
        : [];

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">活動產品區塊管理</h3>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 font-bold shadow-sm"
                    onClick={() => append({ 
                        type: 'GRUPCD', 
                        refCode: '新分組區塊', 
                        productIds: [], 
                        sortOrder: fields.length 
                    })}
                >
                    <Plus className="mr-2 size-4" /> 新增產品區塊
                </Button>
            </div>

            <div className="space-y-10">
                {fields.map((field, index) => {
                    // ✅ 監聽該 index 下的產品 ID 陣列
                    const productIds = form.watch(`products.${index}.productIds`) || [];

                    return (
                        <Card key={field.id} className="border-slate-200 shadow-sm overflow-hidden group/card bg-white border-l-4 border-l-blue-500">
                            <CardHeader className="bg-slate-50/50 p-4 border-b flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-4 flex-1">
                                    <GripVertical className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500" />
                                    <div className="flex flex-col gap-1 w-full max-w-sm">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">分組標題名稱 (前台顯示)</span>
                                        <Input
                                            {...form.register(`products.${index}.refCode`)}
                                            className="h-9 bg-white border-slate-200 focus:ring-4 focus:ring-blue-50 font-bold text-slate-700"
                                            placeholder="例如：熱門行程推薦"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    type="button"
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" 
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </CardHeader>

                            <CardContent className="p-5">
                                <div className="flex flex-wrap gap-4">
                                    {/* ✅ 渲染產品卡片 */}
                                    {productIds.map((pid: string) => (
                                        <ProductDetailCard 
                                            key={pid} 
                                            id={pid} 
                                            mode={mode} 
                                            onRemove={() => {
                                                const current = form.getValues(`products.${index}.productIds`);
                                                form.setValue(
                                                    `products.${index}.productIds`, 
                                                    current.filter((id) => id !== pid), 
                                                    { shouldDirty: true, shouldValidate: true }
                                                );
                                            }}
                                        />
                                    ))}

                                    {/* 勾選按鈕卡片 */}
                                    <button
                                        type="button"
                                        onClick={() => { 
                                            setActiveIndex(index); 
                                            setSelectorOpen(true); 
                                        }}
                                        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-xl p-4 min-h-[160px] w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-11px)] lg:w-[calc(20%-12.8px)] hover:bg-blue-50/50 hover:border-blue-400 hover:text-blue-600 transition-all group/add text-slate-400"
                                    >
                                        <div className="bg-white p-3 rounded-full shadow-sm group-hover/add:scale-110 transition-transform">
                                            <PackageSearch className="size-6 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-bold mt-1">勾選產品</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <ProductSelectorDialog
                open={selectorOpen}
                onOpenChange={setSelectorOpen}
                mode={mode}
                // ✅ 傳入當前選中的 ID
                selectedIds={currentSelectedIds}
                onConfirm={(newIds: string[]) => {
                    if (activeIndex !== null) {
                        // ✅ 更新 React Hook Form 狀態
                        form.setValue(`products.${activeIndex}.productIds`, newIds, { 
                            shouldDirty: true, 
                            shouldValidate: true 
                        });
                    }
                }}
            />
        </div>
    );
}