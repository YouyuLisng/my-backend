'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Module } from '@prisma/client';
import * as z from 'zod';

// Server Actions
import { createModule, updateModule, type ActionState } from '../actions/module';

// Schema
import { ModuleSchema } from '@/schemas/module';

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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from "sonner" 
import SingleImageUploader from '@/components/Image/SingleImageUploader';
import { cn } from '@/lib/utils';

interface Props {
    initialData?: Module | null;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function ModuleFormDialog({
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
    const dialogTitle = title || (isEdit ? '編輯模組設定' : '新增功能模組');

    const form = useForm({
        resolver: zodResolver(ModuleSchema),
        defaultValues: {
            title: '',
            icon: '',      
            description: '', 
            isActive: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: initialData?.title ?? '',
                icon: initialData?.icon ?? '',
                description: initialData?.description ?? '',
                isActive: initialData?.isActive ?? true,
            });
        }
    }, [isOpen, initialData, form]);

    const onSubmit = (values: z.infer<typeof ModuleSchema>) => {
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
                    result = await updateModule(initialData.id, formData);
                } else {
                    result = await createModule(null, formData);
                }

                if (result.success) {
                    toast.success('操作成功', { description: result.message });
                    setIsOpen(false);
                } else {
                    toast.error('操作失敗', { 
                        description: result.message || '請檢查輸入欄位' 
                    });
                }
            } catch (err) {
                toast.error('發生錯誤', { description: '請稍後再試' });
            }
        });
    };

    // MUI 風格封裝元件
    const MuiFormItem = ({ label, children, required, description }: any) => (
        <FormItem className="space-y-1.5 relative">
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
                className="w-[95vw] sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 border-none shadow-2xl rounded-xl overflow-hidden"
                onInteractOutside={(e) => e.preventDefault()} 
            >
                {/* Header: MUI 風格頁首 */}
                <DialogHeader className="p-8 pb-4 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">
                            {dialogTitle}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500 font-medium pl-4 tracking-tight">
                        請填寫模組的展示標題與描述，設定完成後點擊儲存。
                    </DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 px-8 py-6">
                    <Form {...form}>
                        <form id="module-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-4">
                            
                            {/* 基本資訊組 */}
                            <div className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <MuiFormItem label="模組標題" required>
                                            <Input 
                                                {...field} 
                                                className="border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/30 font-medium" 
                                                placeholder="例：日本跟團熱門行程" 
                                                disabled={isPending} 
                                            />
                                        </MuiFormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <MuiFormItem label="模組描述 (選填)">
                                            <Textarea 
                                                {...field} 
                                                value={field.value || ''} 
                                                className="border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all bg-slate-50/30 resize-none min-h-[100px]" 
                                                placeholder="請輸入關於此模組的詳細說明..." 
                                                disabled={isPending} 
                                            />
                                        </MuiFormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="icon"
                                    render={({ field }) => (
                                        <MuiFormItem label="模組圖示 (Icon)" description="建議使用 SVG 或背景透明的 PNG 格式">
                                            <div className="mt-2">
                                                <SingleImageUploader 
                                                    value={field.value || ''} 
                                                    onChange={field.onChange} 
                                                />
                                            </div>
                                        </MuiFormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-5 bg-white hover:shadow-sm transition-all">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-sm font-bold text-slate-700">啟用顯示</FormLabel>
                                                <FormDescription className="text-xs text-slate-500 tracking-tight">
                                                    關閉後，此模組及其內容將在首頁隱藏。
                                                </FormDescription>
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
                        </form>
                    </Form>
                </ScrollArea>
                
                {/* Footer: MUI 按鈕風格 */}
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
                        form="module-form" 
                        disabled={isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 shadow-lg shadow-blue-200 rounded-lg transition-all active:scale-95 uppercase tracking-wide"
                    >
                        {isPending ? '處理中...' : (isEdit ? '儲存更新' : '確認新增')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}