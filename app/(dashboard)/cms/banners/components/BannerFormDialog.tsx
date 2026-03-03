'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form'; 
import { Banner } from '@prisma/client';
import * as z from 'zod';

import { createBanner, updateBanner, type ActionState } from '../actions/banner';
import { BannerCreateSchema } from '@/schemas/banner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from "sonner" 
import SingleImageUploader from '@/components/Image/SingleImageUploader';
import { cn } from '@/lib/utils';

interface Props {
    initialData?: Banner | null;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function BannerFormDialog({
    initialData,
    trigger,
    title,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = setControlledOpen ?? setInternalOpen;
    const [isPending, startTransition] = useTransition();

    const isEdit = !!initialData?.id;
    const dialogTitle = title || (isEdit ? '編輯輪播' : '新增輪播');

    const form = useForm({
        resolver: zodResolver(BannerCreateSchema),
        defaultValues: {
            title: '',
            subtitle: '',
            linkText: '',
            linkUrl: '',
            imageUrl: '',
            order: 0,
            isActive: true,
            gaEvent: 'ga-click',
            gaEventName: '',
            gaCategory: '',
            gaLabel: '',
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: initialData?.title ?? '',
                subtitle: initialData?.subtitle ?? '',
                linkText: initialData?.linkText ?? '',
                linkUrl: initialData?.linkUrl ?? '',
                imageUrl: initialData?.imageUrl ?? '',
                order: initialData?.order ?? 0,
                isActive: initialData?.isActive ?? true,
                gaEvent: initialData?.gaEvent ?? 'ga-click',
                gaEventName: initialData?.gaEventName ?? '',
                gaCategory: initialData?.gaCategory ?? '',
                gaLabel: initialData?.gaLabel ?? '',
            });
        }
    }, [isOpen, initialData, form]);

    const onSubmit = (values: z.infer<typeof BannerCreateSchema>) => {
        startTransition(async () => {
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (typeof value === 'boolean') {
                            if (value) formData.append(key, 'on'); 
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });

                let result: ActionState;
                if (isEdit && initialData?.id) {
                    formData.append('id', initialData.id);
                    result = await updateBanner(initialData.id, formData);
                } else {
                    result = await createBanner(null, formData);
                }

                if (result.success) {
                    
                    toast.success('操作成功', { description: result.message });
                    setIsOpen(false);
                } else {
                    
                    toast.error('操作失敗', { description: result.message });
                }
            } catch (err) {
                toast.error('發生錯誤', { description: '請稍後再試' });
            }
        });
    };

    // 模擬 MUI Outlined Input 樣式的封裝組件
    const MuiFormItem = ({ label, children, required, description }: any) => (
        <FormItem className="space-y-1 relative">
            <FormLabel className={cn(
                "text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1",
                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}>
                {label}
            </FormLabel>
            <FormControl>
                {children}
            </FormControl>
            {description && <FormDescription className="text-[11px] ml-1">{description}</FormDescription>}
            <FormMessage className="text-[11px] ml-1" />
        </FormItem>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent 
                className="w-[95vw] sm:max-w-[850px] max-h-[90vh] flex flex-col p-0 gap-0 border-none shadow-2xl rounded-xl overflow-hidden"
                onInteractOutside={(e) => e.preventDefault()}
            >
                {/* Header: MUI 風格頁首 */}
                <DialogHeader className="p-8 pb-6 bg-white">
                    <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">
                        {dialogTitle}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        請填寫下方表單以完成輪播圖設定
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 px-8">
                    <Form {...form}>
                        <form id="banner-form" onSubmit={form.handleSubmit(onSubmit)} className="pb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                {/* 左側：基本資訊 */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                                        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-widest">基本資訊</h3>
                                    </div>
                                    
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <MuiFormItem label="標題" required>
                                                <Input {...field} className="border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-slate-50/30" placeholder="例：夏季精選優惠" disabled={isPending} />
                                            </MuiFormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="linkUrl"
                                        render={({ field }) => (
                                            <MuiFormItem label="連結網址">
                                                <Input {...field} value={field.value || ''} className="border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/30" placeholder="https://..." disabled={isPending} />
                                            </MuiFormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 after:content-['*'] after:ml-0.5 after:text-red-500">圖片上傳</FormLabel>
                                                <FormControl>
                                                    <div className="mt-1 p-2 border-2 border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                        <SingleImageUploader value={field.value} onChange={field.onChange} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:shadow-md transition-shadow">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-bold text-slate-700">啟用狀態</FormLabel>
                                                    <FormDescription className="text-xs text-slate-500">控制此輪播是否於前台顯示</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isPending}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* 右側：GA 追蹤 */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1 h-5 bg-orange-500 rounded-full" />
                                        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-widest">追蹤資訊 (GA)</h3>
                                    </div>
                                    <div className="grid gap-5 p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
                                        <FormField
                                            control={form.control}
                                            name="gaEvent"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件類型" description="通常填寫 ga-click">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gaEventName"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件名稱">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="例如：home_banner_click" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gaCategory"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件類別">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="例如：Banner" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gaLabel"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件標籤">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200" placeholder="例如：夏季促銷" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>
                {/* Footer: MUI 按鈕風格 */}
                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsOpen(false)} 
                        disabled={isPending}
                        className="font-bold text-slate-500 hover:bg-slate-200 transition-colors uppercase tracking-tight"
                    >
                        取消
                    </Button>
                    <Button 
                        type="submit" 
                        form="banner-form" 
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-200 rounded-lg transition-all active:scale-95 uppercase tracking-wide"
                    >
                        {isPending ? '處理中...' : (isEdit ? '儲存變更' : '建立輪播')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}