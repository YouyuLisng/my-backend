import * as z from 'zod';

export const AdSchema = z.object({
    title: z.string().min(1, '標題為必填'),
    image: z.string().min(1, '圖片為必填'),
    href: z.string().min(1, '連結為必填'),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().default(0),
    gaEvent: z.string().optional().nullable().or(z.literal('')),
    gaEventName: z.string().optional().nullable().or(z.literal('')),
    gaCategory: z.string().optional().nullable().or(z.literal('')),
    gaLabel: z.string().optional().nullable().or(z.literal('')),
});

export type AdFormValues = z.infer<typeof AdSchema>;
