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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SingleImageUploader from '@/components/Image/SingleImageUploader';
import dynamic from 'next/dynamic';

// ✅ 解決 Hydration Error：禁用 SSR
const TinyEditor = dynamic(() => import('@/components/TinyEditor'), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
});

interface Props {
    form: UseFormReturn<NewPageFormValues>;
}

export default function PageBaseInfo({ form }: Props) {
    // 輔助組件：MUI 風格標籤與外框封裝
    const MuiFormItem = ({ label, children, required, description }: any) => (
        <FormItem className="space-y-1.5 relative">
            <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-1">
                {label} 
                {/* ✅ 必填標記：顯示紅色星號 */}
                {required && <span className="text-red-500 text-sm font-black">*</span>}
            </FormLabel>
            <FormControl>{children}</FormControl>
            {description && <FormDescription className="text-[11px] ml-1 text-slate-400">{description}</FormDescription>}
            {/* ✅ 錯誤訊息顯示區 */}
            <FormMessage className="text-[11px] ml-1 font-bold text-red-500" />
        </FormItem>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* 第一區塊：核心路徑設定 */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-4 space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">頁面核心設定</h3>
                    <p className="text-sm text-slate-500 font-medium">定義活動頁的標題、網址路徑與運作模式。</p>
                </div>
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field, fieldState }) => (
                            <MuiFormItem label="活動頁標題" required>
                                <Input 
                                    {...field} 
                                    className={`bg-white border-slate-200 focus:ring-4 transition-all font-medium ${
                                        fieldState.error ? 'border-red-500 focus:ring-red-50' : 'focus:ring-blue-50 focus:border-blue-500'
                                    }`}
                                    placeholder="例如：2026 春季賞櫻盛典"
                                />
                            </MuiFormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field, fieldState }) => (
                            <MuiFormItem label="網址路徑 (Slug)" required>
                                <Input 
                                    {...field} 
                                    className={`bg-white border-slate-200 focus:ring-4 transition-all font-mono ${
                                        fieldState.error ? 'border-red-500 focus:ring-red-50' : 'focus:ring-blue-50 focus:border-blue-500'
                                    }`}
                                    placeholder="spring-sale-2026"
                                />
                            </MuiFormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                            <MuiFormItem label="產品選取模式" required description="影響產品部可勾選的資料層級">
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-6 mt-2 ml-1"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="GRUP" id="mode-grup" className="text-blue-600 border-slate-300" />
                                        <Label htmlFor="mode-grup" className="font-bold text-slate-700 cursor-pointer text-sm">團型 (系列行程)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="GGRP" id="mode-ggrp" className="text-blue-600 border-slate-300" />
                                        <Label htmlFor="mode-ggrp" className="font-bold text-slate-700 cursor-pointer text-sm">團體 (指定日期)</Label>
                                    </div>
                                </RadioGroup>
                            </MuiFormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="enabled"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-white shadow-sm self-end">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-sm font-bold text-slate-700">正式發佈</FormLabel>
                                    <FormDescription className="text-[10px] font-medium text-slate-400">控制前台頁面是否對外公開</FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </section>

            {/* 第二區塊：視覺排版 (主圖與手機圖) */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-4 space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">視覺影像設定</h3>
                    <p className="text-sm text-slate-500 font-medium">上傳桌機版與手機版 Banner。</p>
                </div>
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="mainImage"
                        render={({ field }) => (
                            <MuiFormItem label="桌機版主圖" required description="建議寬度 1920px 以上">
                                <SingleImageUploader 
                                    value={field.value || ''} 
                                    onChange={field.onChange} 
                                />
                            </MuiFormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="mobileImage"
                        render={({ field }) => (
                            <MuiFormItem label="手機版主圖" required description="建議寬度 750px">
                                <SingleImageUploader 
                                    value={field.value || ''} 
                                    onChange={field.onChange} 
                                />
                            </MuiFormItem>
                        )}
                    />
                </div>
            </section>

            {/* 第三區塊：詳細活動說明 */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                    <h3 className="text-lg font-bold text-slate-800">詳細活動說明</h3>
                    <span className="text-red-500 font-black">*</span>
                </div>
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormControl>
                                <div className={`rounded-xl border overflow-hidden shadow-sm bg-white min-h-[400px] transition-colors ${
                                    fieldState.error ? 'border-red-500 ring-1 ring-red-50' : 'border-slate-200'
                                }`}>
                                    <TinyEditor 
                                        value={field.value || ''} 
                                        onChange={field.onChange} 
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-[11px] font-bold text-red-500 ml-1 mt-1" />
                        </FormItem>
                    )}
                />
            </section>
        </div>
    );
}