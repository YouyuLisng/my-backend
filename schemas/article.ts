import * as z from 'zod';

/** 建立用 */
export const ArticleCreateSchema = z.object({
    title: z.string().min(1, '標題必填'),
    subtitle: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    imageUrl: z.string().url('圖片網址格式不正確').nullable().optional(),
    tags: z.array(z.string()).default([]),
    slug: z
        .string()
        .min(1, 'Slug 必填')
        .regex(/^[a-z0-9-]+$/, {
            message: 'Slug 只能包含小寫字母、數字與連字號(-)',
        }),
    isPublished: z.boolean().default(false),
});

/** 編輯用（全部欄位都可改） */
export const ArticleEditSchema = z.object({
    title: z.string().min(1, '標題必填'),
    subtitle: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    imageUrl: z.string().url('圖片網址格式不正確').nullable().optional(),
    tags: z.array(z.string()).default([]),
    slug: z
        .string()
        .min(1, 'Slug 必填')
        .regex(/^[a-z0-9-]+$/, {
            message: 'Slug 只能包含小寫字母、數字與連字號(-)',
        }),
    isPublished: z.boolean(),
});

export type ArticleCreateValues = z.infer<typeof ArticleCreateSchema>;
export type ArticleEditValues = z.infer<typeof ArticleEditSchema>;
