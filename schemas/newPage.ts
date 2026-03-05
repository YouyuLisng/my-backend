import * as z from 'zod';

/**
 * MongoDB 嵌入式型別：GA / GTM 追蹤設定
 */
const TrackingConfigSchema = z.object({
    gaId: z.string().nullable().optional(), // 配合前端 MarketingMeta 使用的 gaId
    gaEvent: z.string().nullable().optional(),
    gaEventName: z.string().nullable().optional(),
    gaCategory: z.string().nullable().optional(),
    gaLabel: z.string().nullable().optional(),
});

/**
 * MongoDB 嵌入式型別：SEO 設定
 */
const SeoConfigSchema = z.object({
    title: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    keywords: z.array(z.string()).default([]), // 給予預設空陣列
    ogTitle: z.string().nullable().optional(),
    ogDescription: z.string().nullable().optional(),
    ogImage: z.string().nullable().optional(),
    canonical: z.string().nullable().optional(),
});

/**
 * MongoDB 嵌入式型別：產品清單項目
 */
const ProductItemSchema = z.object({
    type: z.string().default("GRUPCD"),
    refCode: z.string().nullable().optional(),
    productIds: z.array(z.string()).default([]),
    sortOrder: z.number().default(0),
});

/**
 * 活動頁面主 Schema
 */
export const NewPageSchema = z.object({
    title: z.string().min(1, '請輸入活動頁標題'),
    slug: z
        .string()
        .min(1, '請輸入 URL 路徑 (Slug)')
        .regex(/^[a-z0-9-]+$/, '只允許小寫英文、數字與連字號 (-)'),
    
    // ✅ 關鍵修正：同步 mode 的列舉值為 GRUPCD 與 ITEM
    mode: z.enum(['GRUPCD', 'ITEM']), 
    
    enabled: z.boolean().default(false),
    mainImage: z.string().nullable().optional(),
    mobileImage: z.string().nullable().optional(),
    content: z.string().nullable().optional(),

    // 複合欄位
    products: z.array(ProductItemSchema).default([]),
    seo: SeoConfigSchema.optional().nullable(),
    tracking: TrackingConfigSchema.optional().nullable(),
});

// 匯出型別定義
export type NewPageFormValues = z.infer<typeof NewPageSchema>;