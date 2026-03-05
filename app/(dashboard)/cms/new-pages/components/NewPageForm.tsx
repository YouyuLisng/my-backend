'use client';

import React, { useState, useCallback, useTransition } from 'react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Save, ChevronLeft, Loader2, Settings, Package, SearchCheck, ShieldAlert, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';

// 導入 Shadcn UI 的 Tabs 組件
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 匯入子組件
import PageBasicSettings from './PageBasicSettings';
import ProductSelection from './ProductSelection';
import MarketingMeta from './MarketingMeta';

// 匯入 Server Actions
import { createNewPage, updateNewPage } from '../actions/newPage'; 

interface NewPageFormProps {
    initialData?: any;
    userRole: Role; 
}

export default function NewPageForm({ initialData, userRole }: NewPageFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 初始化表單狀態
    const [formData, setFormData] = useState({
        id: initialData?.id || null,
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        mode: initialData?.mode || 'GRUPCD', 
        mainImage: initialData?.mainImage || '',
        mobileImage: initialData?.mobileImage || '',
        content: initialData?.content || '',
        enabled: initialData?.enabled ?? false,
        products: initialData?.products || [],
        seo: initialData?.seo || { title: '', description: '' },
        tracking: initialData?.tracking || { gaId: '' },
    });

    const updateField = useCallback((path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split('.');
            if (keys.length === 1) return { ...prev, [path]: value };
            return {
                ...prev,
                [keys[0]]: { ...prev[keys[0] as keyof typeof prev] as object, [keys[1]]: value }
            };
        });
    }, []);

    const handleProductUpdate = (refCode: string, tourId: string, isChecked: boolean) => {
        setFormData(prev => {
            let newProducts = [...prev.products];
            const itemIndex = newProducts.findIndex(p => p.refCode === refCode);

            if (isChecked) {
                if (itemIndex > -1) {
                    const updatedIds = [...new Set([...newProducts[itemIndex].productIds, tourId])];
                    newProducts[itemIndex] = { ...newProducts[itemIndex], productIds: updatedIds };
                } else {
                    newProducts.push({
                        type: prev.mode,
                        refCode: refCode,
                        productIds: [tourId],
                        sortOrder: newProducts.length
                    });
                }
            } else {
                if (itemIndex > -1) {
                    const updatedIds = newProducts[itemIndex].productIds.filter((id: string) => id !== tourId);
                    if (updatedIds.length === 0) {
                        newProducts.splice(itemIndex, 1);
                    } else {
                        newProducts[itemIndex] = { ...newProducts[itemIndex], productIds: updatedIds };
                    }
                }
            }
            return { ...prev, products: newProducts };
        });
    };

    // 使用 Server Action 進行儲存
    const handleActionSubmit = async () => {
        const isCreating = !formData.id;

        // 產品部權限檢查：禁止建立新頁面
        if (isCreating && userRole === Role.PRODUCT) {
            return toast.error("權限不足", { description: "產品部無法建立新頁面。" });
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('slug', formData.slug);
        data.append('mode', formData.mode);
        data.append('enabled', formData.enabled ? 'on' : 'off');
        data.append('mainImage', formData.mainImage);
        data.append('mobileImage', formData.mobileImage);
        data.append('content', formData.content);
        data.append('seo', JSON.stringify(formData.seo));
        data.append('tracking', JSON.stringify(formData.tracking));
        data.append('products', JSON.stringify(formData.products));

        startTransition(async () => {
            const result = isCreating 
                ? await createNewPage(data) 
                : await updateNewPage(formData.id!, data);

            if (result.success) {
                toast.success(result.message);
                router.push('/cms/new-pages');
                router.refresh();
            } else {
                toast.error(result.message);
                // 💡 修正：展開 Zod 的詳細錯誤，這樣您就能看到是不是 mode 欄位在噴錯
                if (result.errors) {
                    Object.entries(result.errors).forEach(([field, messages]) => {
                        console.error(`驗證失敗 [${field}]:`, messages);
                        toast.error(`${field}: ${messages[0]}`); 
                    });
                }
            }
        });
    };

    // 權限判斷：產品部只能使用產品挑選 Tab
    const isProductUser = userRole === Role.PRODUCT;

    return (
        <div className="max-w-[1400px] mx-auto py-8 px-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            {formData.id ? '編輯行銷頁面' : '建立行銷頁面'}
                        </h1>
                        <p className="text-sm text-slate-400 font-medium tracking-tight flex items-center gap-2">
                            {isProductUser ? (
                                <><Lock size={14} className="text-amber-500" /> 產品管理模式：僅限調整產品勾選</>
                            ) : (
                                <><Settings size={14} className="text-blue-500" /> 企劃編輯模式：全功能開放</>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => router.back()}>取消</Button>
                    <Button 
                        onClick={handleActionSubmit} 
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-md shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        {isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                        {isProductUser ? '儲存產品清單' : '儲存並發佈'}
                    </Button>
                </div>
            </div>

            {/* Tabs 主要內容區 */}
            <Tabs defaultValue={isProductUser ? "products" : "settings"} className="w-full space-y-6">
                <TabsList className="bg-slate-100/80 h-14 w-full md:w-fit grid grid-cols-3 gap-2 border">
                    <TabsTrigger 
                        value="settings" 
                        disabled={isProductUser}
                        className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                    >
                        <Settings size={18} className="mr-2" /> 1. 基本設定 {isProductUser && <Lock size={12} className="ml-2" />}
                    </TabsTrigger>
                    <TabsTrigger value="products" className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600">
                        <Package size={18} className="mr-2" /> 2. 產品挑選
                    </TabsTrigger>
                    <TabsTrigger 
                        value="marketing" 
                        disabled={isProductUser}
                        className="font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                    >
                        <SearchCheck size={18} className="mr-2" /> 3. SEO / 追蹤 {isProductUser && <Lock size={12} className="ml-2" />}
                    </TabsTrigger>
                </TabsList>

                {/* --- Tab 1: 基本設定 --- */}
                <TabsContent value="settings" className="mt-0 focus-visible:ring-0">
                    <PageBasicSettings data={formData} onChange={updateField} />
                </TabsContent>

                {/* --- Tab 2: 產品挑選 (全角色可用) --- */}
                <TabsContent value="products" className="mt-0 focus-visible:ring-0">
                    <ProductSelection 
                        mode={formData.mode} 
                        products={formData.products} 
                        onUpdate={handleProductUpdate} 
                    />
                </TabsContent>

                {/* --- Tab 3: SEO 與 追蹤 --- */}
                <TabsContent value="marketing" className="mt-0 focus-visible:ring-0">
                    <MarketingMeta data={formData} onChange={updateField} />
                </TabsContent>
            </Tabs>
            
            <div className="flex justify-center pt-10 pb-20">
                <p className="text-xs text-slate-400 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border italic">
                    <ShieldAlert size={12} /> 當前角色權限：{userRole}
                </p>
            </div>
        </div>
    );
}