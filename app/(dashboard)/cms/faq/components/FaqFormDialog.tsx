'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form'; 
import { Faq } from '@prisma/client';
import * as z from 'zod';
import { createFaq, updateFaq, type ActionState } from '../actions/faq';
import { FaqSchema } from '@/schemas/faq';
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
import { toast } from "sonner" // ✅ 已改用 sonner
import TinyEditor from '@/components/TinyEditor';

interface Props {
    initialData?: Faq | null;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function FaqFormDialog({
    initialData,
    trigger,
    title,
    open: controlledOpen,
    onOpenChange: setControlledOpen
}: Props) {
    // ❌ 移除 const { toast } = useToast(); 
    
    // 內部狀態管理
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = setControlledOpen ?? setInternalOpen;

    const [isPending, startTransition] = useTransition();

    const isEdit = !!initialData?.id;
    const dialogTitle = title || (isEdit ? '編輯 FAQ' : '新增 FAQ');

    const form = useForm({
        resolver: zodResolver(FaqSchema),
        defaultValues: {
            question: '',
            answer: '',
            order: 0,
            isActive: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                question: initialData?.question ?? '',
                answer: initialData?.answer ?? '',
                order: initialData?.order ?? 0,
                isActive: initialData?.isActive ?? true,
            });
        }
    }, [isOpen, initialData, form]);

    const onSubmit = (values: z.infer<typeof FaqSchema>) => {
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
                    result = await updateFaq(initialData.id, formData);
                } else {
                    result = await createFaq(null, formData);
                }
                if (result.success) {
                    // ✅ 改用 Sonner 語法
                    toast.success('操作成功', { description: result.message });
                    setIsOpen(false);
                } else {
                    // ✅ 改用 Sonner 語法
                    toast.error('操作失敗', { 
                        description: result.message || '請檢查欄位' 
                    });
                    
                    if (result.errors) {
                        console.error('Validation Errors:', result.errors);
                    }
                }
            } catch (err) {
                console.error(err);
                // ✅ 改用 Sonner 語法
                toast.error('發生錯誤', { description: '請稍後再試' });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent 
                className="w-[95vw] sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 gap-0"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>請填寫常見問題與回答，帶 * 為必填。</DialogDescription>
                </DialogHeader>
                
                <ScrollArea className="flex-1 p-6 pt-4">
                    <Form {...form}>
                        <form id="faq-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="question"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                            問題標題
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="例：集合地點在哪呢？" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="answer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                            回答內容
                                        </FormLabel>
                                        <FormControl>
                                            <TinyEditor 
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-xs text-muted-foreground">
                                            可使用編輯器進行排版 (自動轉換為 HTML)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* 啟用狀態 */}
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-gray-50/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">啟用狀態</FormLabel>
                                            <FormDescription>關閉後將不會在前台顯示。</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>
                <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>取消</Button>
                    <Button type="submit" form="faq-form" disabled={isPending}>
                        {isPending ? '儲存中...' : (isEdit ? '儲存變更' : '立即新增')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}