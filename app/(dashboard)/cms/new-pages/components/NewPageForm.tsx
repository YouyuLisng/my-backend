'use client';

import React, { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NewPageSchema, NewPageFormValues } from '@/schemas/newPage';
import { updateNewPage, createNewPage } from '../actions/newPage';
import { useRouter } from 'next/navigation';

// UI 與區塊組件
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from "sonner" // ✅ 改用 Sonner
import PageBaseInfo from './PageBaseInfo';
import ProductSectionManager from './ProductSectionManager';
import PageSeoSettings from './PageSeoSettings';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function NewPageForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const isEditMode = !!initialData?.id;

    // React Hook Form 初始化
    const form = useForm<NewPageFormValues>({
        resolver: zodResolver(NewPageSchema),
        defaultValues: initialData || {
            title: '', 
            slug: '', 
            mode: 'GRUP', 
            enabled: false, 
            mainImage: '',
            mobileImage: '',
            content: '',
            products: [],
            seo: { title: '', description: '', keywords: [], ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
            tracking: { gaEvent: 'ga-click', gaEventName: '', gaCategory: '', gaLabel: '' }
        },
    });

    // 成功提交邏輯
    const onSubmit = async (values: NewPageFormValues) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                
                Object.entries(values).forEach(([key, value]) => {
                    if (value === null || value === undefined) return;
                    if (typeof value === 'object') {
                        formData.append(key, JSON.stringify(value));
                    } else if (typeof value === 'boolean') {
                        formData.append(key, value ? 'on' : 'off');
                    } else {
                        formData.append(key, String(value));
                    }
                });

                const result = isEditMode 
                    ? await updateNewPage(initialData.id, formData) 
                    : await createNewPage(formData);

                if (result.success) {
                    // ✅ Sonner 語法：第一個參數是標題字串
                    toast.success(isEditMode ? '更新成功' : '建立成功', {
                        description: result.message 
                    });
                    router.push('/cms/new-pages');
                    router.refresh();
                } else {
                    // ✅ Sonner 語法：失敗使用 toast.error
                    toast.error('儲存失敗', {
                        description: result.message 
                    });
                }
            } catch (error) {
                toast.error('系統錯誤', {
                    description: '無法連接伺服器' 
                });
            }
        });
    };

    // ✅ 必填提示：提交失敗時觸發此函式
    const onInvalid = (errors: any) => {
        console.warn("表單驗證未通過:", errors);
        
        const errorFields = Object.keys(errors);
        
        // ✅ Sonner 語法
        toast.error('請檢查必填欄位', {
            description: `尚有 ${errorFields.length} 個項目未正確填寫，請檢查標記紅色的部分。`,
        });
    };

    return (
        <Form {...form}>
            <div className="flex flex-col min-h-screen bg-white animate-in fade-in duration-500">
                {/* 🎯 頁首導覽 */}
                <div className="sticky top-0 z-50 bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                            {isEditMode ? '編輯活動內容' : '建立新活動頁面'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild className="rounded-xl px-6 h-11 border-slate-200 font-bold hover:bg-slate-50 transition-colors">
                            <Link href="/cms/new-pages">取消返回</Link>
                        </Button>
                        <Button 
                            onClick={form.handleSubmit(onSubmit, onInvalid)} 
                            disabled={isPending}
                            className="rounded-xl px-8 h-11 bg-[#1a1a1a] hover:bg-black text-white font-bold transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            {isPending ? '處理中...' : '儲存變更'}
                        </Button>
                    </div>
                </div>

                <main className="p-8 max-w-[1400px] mx-auto w-full pb-20">
                    {/* 頂部錯誤快速提示面板 */}
                    {Object.keys(form.formState.errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in zoom-in-95">
                            <AlertCircle size={20} />
                            <p className="text-sm font-bold">頁面包含未填寫的必填資訊，請檢查下方各分頁的紅色錯誤訊息。</p>
                        </div>
                    )}

                    <Tabs defaultValue="base" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-slate-100/50 p-1 rounded-xl">
                            <TabsTrigger value="base" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                1. 基本資訊 {form.formState.errors.title || form.formState.errors.slug ? '●' : ''}
                            </TabsTrigger>
                            <TabsTrigger value="products" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">2. 產品配置</TabsTrigger>
                            <TabsTrigger value="seo" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">3. SEO 與 追蹤</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-6">
                            <TabsContent value="base" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <PageBaseInfo form={form} />
                            </TabsContent>
                            <TabsContent value="products" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <ProductSectionManager form={form} />
                            </TabsContent>
                            <TabsContent value="seo" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <PageSeoSettings form={form} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </main>
            </div>
        </Form>
    );
}