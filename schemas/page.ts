import { z } from 'zod';

/**
 * 🧩 Page 基礎 Schema（適用於新增與編輯）
 * 只有 title 為必填
 */
export const PageBaseSchema = z.object({
    title: z.string().min(1, '請輸入標題'),

    mainImage: z.string().url('主圖網址格式錯誤').nullable().optional(),
    mobileImage: z.string().url('手機版主圖網址格式錯誤').nullable().optional(),
    slug: z
        .string()
        .regex(/^[a-z0-9-]+$/, 'slug 只能包含英文小寫、數字與 -')
        .nullable()
        .optional(),
    content: z.string().nullable().optional(),
    seoTitle: z.string().nullable().optional(),
    seoDesc: z.string().nullable().optional(),
    seoImage: z.string().nullable().optional(),

    keywords: z.array(z.string()).default([]),
    productId: z.array(z.string()).default([]),

    enabled: z.boolean().default(false),
});

/** ✅ 新增 Page Schema */
export const PageCreateSchema = PageBaseSchema;
export type PageCreateValues = z.infer<typeof PageCreateSchema>;

/** ✅ 編輯 Page Schema */
export const PageEditSchema = PageBaseSchema.extend({
    id: z.string().min(1, 'ID 必填'),
});
export type PageEditValues = z.infer<typeof PageEditSchema>;
