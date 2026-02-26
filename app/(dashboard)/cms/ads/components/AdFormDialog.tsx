'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form'; 
import { Ad } from '@prisma/client';
import * as z from 'zod';

// Server Actions
import { createAd, updateAd, type ActionState } from '../actions/ad';

// Schema
import { AdSchema } from '@/schemas/ad';

// UI Components
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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Props {
    initialData?: Ad | null;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function AdFormDialog({
    initialData,
    trigger,
    title,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: Props) {
    // ❌ 移除 const { toast } = useToast(); 
    
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = setControlledOpen ?? setInternalOpen;

    const [isPending, startTransition] = useTransition();

    const isEdit = !!initialData?.id;
    const dialogTitle = title || (isEdit ? '編輯廣告' : '新增廣告');

    const form = useForm({
        resolver: zodResolver(AdSchema),
        defaultValues: {
            title: '',
            href: '',
            image: '',
            sortOrder: 0,
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
                href: initialData?.href ?? '',
                image: initialData?.image ?? '',
                sortOrder: initialData?.sortOrder ?? 0,
                isActive: initialData?.isActive ?? true,
                gaEvent: initialData?.gaEvent ?? 'ga-click',
                gaEventName: initialData?.gaEventName ?? '',
                gaCategory: initialData?.gaCategory ?? '',
                gaLabel: initialData?.gaLabel ?? '',
            });
        }
    }, [isOpen, initialData, form]);

    const onSubmit = (values: z.infer<typeof AdSchema>) => {
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
                    result = await updateAd(initialData.id, formData);
                } else {
                    result = await createAd(null, formData);
                }

                if (result.success) {
                    
                    toast.success('操作成功', { description: result.message });
                    setIsOpen(false);
                } else {
                    
                    toast.error('操作失敗', { 
                        description: result.message || '請檢查欄位' 
                    });
                }
            } catch (err) {
                console.error(err);
                
                toast.error('發生錯誤', { description: '請稍後再試' });
            }
        });
    };

    // MUI 風格封裝組件
    const MuiFormItem = ({ label, children, required, description }: any) => (
        <FormItem className="space-y-1 relative">
            <FormLabel className={cn(
                "text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 transition-colors",
                required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}>
                {label}
            </FormLabel>
            <FormControl>
                {children}
            </FormControl>
            {description && <FormDescription className="text-[11px] ml-1 text-slate-400">{description}</FormDescription>}
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
                <DialogHeader className="p-8 pb-4 bg-white border-b border-slate-100">
                    <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">{dialogTitle}</DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">填寫廣告相關資訊，完成後點擊儲存變更。</DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 px-8 py-6">
                    <Form {...form}>
                        <form id="ad-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                {/* 左側：基本資訊 */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-5 bg-blue-600 rounded-full" />
                                        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-widest">基本資訊</h3>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <MuiFormItem label="標題" required>
                                                <Input {...field} className="border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/30" placeholder="例：夏季活動推廣" disabled={isPending} />
                                            </MuiFormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={form.control}
                                        name="href"
                                        render={({ field }) => (
                                            <MuiFormItem label="連結網址" required>
                                                <Input {...field} value={field.value || ''} className="border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/30" placeholder="https://..." disabled={isPending} />
                                            </MuiFormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 after:content-['*'] after:ml-0.5 after:text-red-500">廣告圖片</FormLabel>
                                                <FormControl>
                                                    <div className="mt-1">
                                                        <SingleImageUploader 
                                                            value={field.value} 
                                                            onChange={field.onChange}
                                                            label="" 
                                                        />
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
                                            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 bg-white hover:shadow-sm transition-all">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-bold text-slate-700">顯示狀態</FormLabel>
                                                    <FormDescription className="text-xs text-slate-500 tracking-tight">控制此廣告是否於前台露出</FormDescription>
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

                                {/* 右側：追蹤設定 */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1 h-5 bg-orange-500 rounded-full" />
                                        <h3 className="font-bold text-sm text-slate-700 uppercase tracking-widest">數據追蹤 (GA)</h3>
                                    </div>

                                    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="gaEvent"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件類型" description="建議填寫 ga-click">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200 focus:ring-4 focus:ring-blue-50" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gaEventName"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件名稱">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200 focus:ring-4 focus:ring-blue-50" placeholder="ad_banner_click" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gaCategory"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件類別">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200 focus:ring-4 focus:ring-blue-50" placeholder="Advertisement" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gaLabel"
                                            render={({ field }) => (
                                                <MuiFormItem label="事件標籤">
                                                    <Input {...field} value={field.value || ''} className="bg-white border-slate-200 focus:ring-4 focus:ring-blue-50" placeholder="Promo 2024" disabled={isPending} />
                                                </MuiFormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 gap-3">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsOpen(false)} 
                        disabled={isPending}
                        className="font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-tight"
                    >
                        取消
                    </Button>
                    <Button 
                        type="submit" 
                        form="ad-form" 
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 shadow-lg shadow-blue-200 rounded-lg transition-all active:scale-95 uppercase tracking-wide"
                    >
                        {isPending ? '處理中...' : (isEdit ? '儲存變更' : '建立廣告')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}