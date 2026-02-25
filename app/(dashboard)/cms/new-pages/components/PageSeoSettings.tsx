'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { NewPageFormValues } from '@/schemas/newPage';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import SingleImageUploader from '@/components/Image/SingleImageUploader';
import { Search, BarChart3, Globe, Share2 } from 'lucide-react';

interface Props {
    form: UseFormReturn<NewPageFormValues>;
}

export default function PageSeoSettings({ form }: Props) {
    // 輔助組件：MUI 風格標籤
    const MuiFormItem = ({ label, children, description }: any) => (
        <FormItem className="space-y-1.5 relative">
            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">
                {label}
            </FormLabel>
            <FormControl>{children}</FormControl>
            {description && <FormDescription className="text-[11px] ml-1 text-slate-400 leading-tight">{description}</FormDescription>}
            <FormMessage className="text-[11px] ml-1" />
        </FormItem>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* === 第一區塊：SEO 搜尋引擎優化 === */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                        <Globe size={18} />
                        <h3 className="text-lg font-bold text-slate-800">搜尋引擎優化 (SEO)</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        設定網頁在 Google 搜尋結果中的呈現方式，良好的描述能顯著提升點擊率。
                    </p>
                </div>
                
                <div className="lg:col-span-8 p-8 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-6">
                    <FormField
                        control={form.control}
                        name="seo.title"
                        render={({ field }) => (
                            <MuiFormItem label="SEO 網頁標題" description="建議控制在 30-50 個字元以內，並包含關鍵字。">
                                <Input {...field} value={field.value || ''} className="bg-white border-slate-200 focus:ring-4 focus:ring-blue-50" placeholder="例：2026 日本賞櫻行程推薦 | 大榮旅遊" />
                            </MuiFormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="seo.description"
                        render={({ field }) => (
                            <MuiFormItem label="網頁描述 (Meta Description)" description="搜尋結果下方的簡介，建議 150 字以內。">
                                <Textarea {...field} value={field.value || ''} className="bg-white border-slate-200 focus:ring-4 focus:ring-blue-50 resize-none h-24" placeholder="例：精選 2026 日本櫻花季必訪景點，包含東京、京都、大阪...等熱門行程。" />
                            </MuiFormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="seo.ogTitle"
                            render={({ field }) => (
                                <MuiFormItem label="社群分享標題 (OG Title)" description="連結分享至 FB/Line 時顯示的標題。">
                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="分享標題" />
                                </MuiFormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="seo.ogImage"
                            render={({ field }) => (
                                <MuiFormItem label="社群分享縮圖 (OG Image)">
                                    <div className="mt-1">
                                        <SingleImageUploader value={field.value || ''} onChange={field.onChange} />
                                    </div>
                                </MuiFormItem>
                            )}
                        />
                    </div>
                </div>
            </section>

            <Separator className="bg-slate-100" />

            {/* === 第二區塊：GA / GTM 數據追蹤 === */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
                <div className="lg:col-span-4 space-y-2">
                    <div className="flex items-center gap-2 text-orange-600">
                        <BarChart3 size={18} />
                        <h3 className="text-lg font-bold text-slate-800">數據埋點設定 (Tracking)</h3>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        設定活動頁專屬的 GA4 事件，以便追蹤使用者的進入與互動狀況。
                    </p>
                </div>

                <div className="lg:col-span-8 p-8 rounded-2xl border border-orange-100 bg-orange-50/10 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="tracking.gaEvent"
                            render={({ field }) => (
                                <MuiFormItem label="事件類型 (Event)" description="預設通常為 ga-click">
                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" />
                                </MuiFormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tracking.gaEventName"
                            render={({ field }) => (
                                <MuiFormItem label="事件名稱 (Event Name)">
                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="例：newpage_view" />
                                </MuiFormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tracking.gaCategory"
                            render={({ field }) => (
                                <MuiFormItem label="事件類別 (Category)">
                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="例：Campaign" />
                                </MuiFormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tracking.gaLabel"
                            render={({ field }) => (
                                <MuiFormItem label="事件標籤 (Label)">
                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="例：Spring_Sale_2026" />
                                </MuiFormItem>
                            )}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}