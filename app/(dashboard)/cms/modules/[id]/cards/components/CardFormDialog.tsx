'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Card } from '@prisma/client';
import * as z from 'zod';

// 自訂元件
import CreatableMultiSelect from '@/components/CreatableMultiSelect';
import SingleImageUploader from '@/components/Image/SingleImageUploader';
import { Separator } from '@/components/ui/separator';
// Server Actions
import { createCard, updateCard, type ActionState } from '../actions/card';
// Schema
import { CardSchema } from '@/schemas/card';
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
import { toast } from "sonner" 

interface Props {
    initialData?: Card | null;
    moduleId: string;
    moduleTitle?: string;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function CardFormDialog({
    initialData,
    moduleId,
    moduleTitle = '',
    trigger,
    title,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: Props) {
    

    // 內部狀態管理
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const setIsOpen = setControlledOpen ?? setInternalOpen;

    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isEdit = !!initialData?.id;
    const dialogTitle = title || (isEdit ? '編輯卡片' : '新增卡片');

    // --- 條件判斷區 ---
    const isThemeTravel = moduleTitle === '主題旅遊';
    const isClassicTour = moduleTitle === '大榮經典跟團行程';
    const isWorldTravel = moduleTitle === '其他區塊';
    const isKaohsiungTour = moduleTitle === '服務專區';

    const shouldHideFields = isThemeTravel || isWorldTravel || isKaohsiungTour;
    const showDescription = !shouldHideFields;
    const showPrice = !shouldHideFields;
    const showTags = !shouldHideFields && !isClassicTour;

    // 1. 初始化 Form
    const form = useForm({
        resolver: zodResolver(CardSchema),
        defaultValues: {
            title: '',
            description: '',
            image: '',
            href: '',
            price: '',
            tags: [] as string[],
            isActive: true,
            moduleId: moduleId,
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
                description: initialData?.description ?? '',
                image: initialData?.image ?? '',
                href: initialData?.href ?? '',
                price: initialData?.price ?? '',
                tags: initialData?.tags ?? [],
                isActive: initialData?.isActive ?? true,
                moduleId: initialData?.moduleId ?? moduleId,
                gaEvent: initialData?.gaEvent ?? 'ga-click',
                gaEventName: initialData?.gaEventName ?? '',
                gaCategory: initialData?.gaCategory ?? '',
                gaLabel: initialData?.gaLabel ?? '',
            });
        }
    }, [isOpen, initialData, moduleId, form]);

    const onSubmit = (values: z.infer<typeof CardSchema>) => {
        startTransition(async () => {
            try {
                const formData = new FormData();

                Object.entries(values).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        if (typeof value === 'boolean') {
                            if (value) formData.append(key, 'on');
                        } else if (Array.isArray(value)) {
                            formData.append(key, value.join(','));
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });
                let result: ActionState;

                if (isEdit && initialData?.id) {
                    result = await updateCard(initialData.id, formData);
                } else {
                    result = await createCard(null, formData);
                }

                if (result.success) {
                    
                    toast.success('操作成功', { description: result.message });
                    setIsOpen(false);
                } else {
                    
                    toast.error('操作失敗', {
                        description: result.message || '請檢查欄位',
                    });
                    if (result.errors) {
                        console.error('Validation Errors:', result.errors);
                    }
                }
            } catch (err) {
                console.error(err);
                
                toast.error('發生錯誤', {
                    description: '請稍後再試',
                });
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className="w-[95vw] sm:max-w-[1000px] max-h-[90vh] flex flex-col p-0 gap-0"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>
                        請填寫卡片內容，帶 * 為必填。
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    <Form {...form}>
                        <form
                            id="card-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* === 左欄：基本資料 === */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-base border-l-4 border-primary pl-2 mb-4">
                                        基本資訊
                                    </h3>
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                                    標題
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="例：東京五日遊"
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {showDescription && (
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        描述 (副標題)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            value={field.value || ''}
                                                            placeholder="簡短描述..."
                                                            disabled={isPending}
                                                            className="resize-none h-20"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="href"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                                    連結網址
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="https://..."
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {showPrice && (
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        顯示價格 (選填)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            placeholder="例如：$29,900 起"
                                                            disabled={isPending}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {showTags && mounted && (
                                        <FormField
                                            control={form.control}
                                            name="tags"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        標籤 (Tags)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <CreatableMultiSelect
                                                            instanceId="card-tags-select"
                                                            placeholder="輸入標籤並按 Enter..."
                                                            options={[]}
                                                            value={field.value || []}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        可輸入多個標籤，例如：熱門、優惠、賞櫻。
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                                    圖片
                                                </FormLabel>
                                                <FormControl>
                                                    <SingleImageUploader value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* === 右欄：狀態與 GA === */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-base border-l-4 border-gray-500 pl-2 mb-4">
                                            狀態設定
                                        </h3>
                                        <FormField
                                            control={form.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-gray-50/50">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">
                                                            啟用狀態
                                                        </FormLabel>
                                                        <FormDescription>
                                                            關閉後，此卡片將不會顯示。
                                                        </FormDescription>
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
                                    </div>

                                    <div>
                                        <Separator className="lg:hidden my-4" />
                                        <h3 className="font-semibold text-base border-l-4 border-orange-500 pl-2 mb-4">
                                            Google Analytics 追蹤
                                        </h3>

                                        <div className="p-4 bg-orange-50/50 rounded-lg space-y-4 border border-orange-100">
                                            <FormField
                                                control={form.control}
                                                name="gaEvent"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Event Type</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                placeholder="ga-click"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-xs text-muted-foreground">
                                                            通常填寫 ga-click
                                                        </FormDescription>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="gaEventName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Event Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                placeholder="card_click"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="gaCategory"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                placeholder="Card"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="gaLabel"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Label</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                value={field.value || ''}
                                                                placeholder="Tokyo Tour"
                                                                disabled={isPending}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 flex-shrink-0">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isPending}
                    >
                        取消
                    </Button>
                    <Button type="submit" form="card-form" disabled={isPending}>
                        {isPending
                            ? '儲存中...'
                            : isEdit
                              ? '儲存變更'
                              : '立即新增'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}