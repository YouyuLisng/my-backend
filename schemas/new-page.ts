// @/schemas/page.ts
import { z } from "zod";

export const NewPageSchema = z.object({
    title: z.string().min(1, "請輸入標題"),
    slug: z.string().min(1, "請輸入 Slug"),
    mode: z.enum(["GRUPCD", "GROUP"]),
    mainImage: z.string().nullable(),
    mobileImage: z.string().nullable(),
    content: z.string().optional(),
    enabled: z.boolean().default(false),
    products: z.array(z.object({
        type: z.string(),
        grupcd: z.string().optional().nullable(),
        productIds: z.array(z.string()).default([]),
        sortOrder: z.number().default(0),
    })).min(1, "至少需要一個產品項目"),
});

export type NewPageValues = z.infer<typeof NewPageSchema>;