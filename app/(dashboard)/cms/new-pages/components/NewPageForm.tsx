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
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner"
import PageBaseInfo from './PageBaseInfo';
import ProductSectionManager from './ProductSectionManager';
import PageSeoSettings from './PageSeoSettings';
import Link from 'next/link';
import { AlertCircle, ShieldCheck, UserCog, Package } from 'lucide-react';

// 定義角色枚舉（與 Prisma 保持一致）
type Role = 'DEV' | 'PLANNING' | 'PRODUCT';

interface NewPageFormProps {
    initialData?: any;
    userRole?: Role; // 傳入當前使用者角色
}

export default function NewPageForm({ initialData, userRole = 'PLANNING' }: NewPageFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const isEditMode = !!initialData?.id;

    // --- 權限判斷邏輯 ---
    const isDev = userRole === 'DEV';
    const isPlanning = userRole === 'PLANNING';
    const isProduct = userRole === 'PRODUCT';

    // 只有 DEV 和 PLANNING 可以修改基本資訊與 SEO
    const canEditMainContent = isDev || isPlanning;
    // 所有角色都可以編輯產品（這是產品部的核心職責）
    const canEditProducts = true; 
    // 是否隱藏 SEO 頁籤 (產品部不需看見)
    const showSeoTab = isDev || isPlanning;

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

                // 💡 可以在這裡額外附加角色資訊到後端，或是由後端 Session 檢查
                const result = isEditMode 
                    ? await updateNewPage(initialData.id, formData) 
                    : await createNewPage(formData);

                if (result.success) {
                    toast.success(isEditMode ? '更新成功' : '建立成功', {
                        description: result.message 
                    });
                    router.push('/cms/new-pages');
                    router.refresh();
                } else {
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

    const onInvalid = (errors: any) => {
        console.warn("表單驗證未通過:", errors);
        const errorFields = Object.keys(errors);
        toast.error('請檢查必填欄位', {
            description: `尚有 ${errorFields.length} 個項目未正確填寫。`,
        });
    };

    return (
        <Form {...form}>
            <div className="flex flex-col min-h-screen bg-white animate-in fade-in duration-500">
                {/* 🎯 頁首導覽 */}
                <div className="sticky top-0 z-50 bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                            {isEditMode ? '編輯活動內容' : '建立新活動頁面'}
                            
                            {/* 顯示目前權限標籤 */}
                            {isProduct && <Badge variant="secondary" className="ml-2 bg-amber-50 text-amber-600 border-amber-200 gap-1"><Package size={12}/> 產品部權限</Badge>}
                            {isPlanning && <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-600 border-blue-200 gap-1"><UserCog size={12}/> 企劃部權限</Badge>}
                            {isDev && <Badge variant="secondary" className="ml-2 bg-purple-50 text-purple-600 border-purple-200 gap-1"><ShieldCheck size={12}/> 開發者權限</Badge>}
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
                    {/* 權限提示面板：僅針對產品部顯示 */}
                    {isProduct && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
                            <AlertCircle size={20} />
                            <p className="text-sm font-bold">您目前以產品部權限登入，僅能修改「產品配置」區塊，基本資訊僅供檢視。</p>
                        </div>
                    )}

                    <Tabs defaultValue={isProduct ? "products" : "base"} className="w-full">
                        <TabsList className={`grid w-full mb-8 h-12 bg-slate-100/50 p-1 rounded-xl ${showSeoTab ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            <TabsTrigger value="base" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                1. 基本資訊 {form.formState.errors.title || form.formState.errors.slug ? '●' : ''}
                            </TabsTrigger>
                            <TabsTrigger value="products" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                2. 產品配置
                            </TabsTrigger>
                            {showSeoTab && (
                                <TabsTrigger value="seo" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    3. SEO 與 追蹤
                                </TabsTrigger>
                            )}
                        </TabsList>
                        
                        <div className="mt-6">
                            <TabsContent value="base" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* 💡 傳入 readOnly 屬性給 PageBaseInfo */}
                                <PageBaseInfo form={form} readOnly={!canEditMainContent} />
                            </TabsContent>
                            
                            <TabsContent value="products" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* 💡 產品部可以直接操作，不需要 readOnly */}
                                <ProductSectionManager form={form} />
                            </TabsContent>
                            
                            {showSeoTab && (
                                <TabsContent value="seo" className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <PageSeoSettings form={form} />
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </main>
            </div>
        </Form>
    );
}