import { z } from 'zod';

export const CardSchema = z.object({
    title: z.string().min(1, '標題為必填'),
    description: z.string().optional().nullable(),
    image: z.string().min(1, '圖片為必填'),
    href: z.string().min(1, '連結為必填'),
    price: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    moduleId: z.string().min(1, '必須關聯模組'),
    isActive: z.boolean().default(true),
    sortOrder: z.number().default(0),

    gaEvent: z.string().optional().nullable().default('ga-click'),
    gaEventName: z.string().optional().nullable(),
    gaCategory: z.string().optional().nullable(),
    gaLabel: z.string().optional().nullable(),
});