import { z } from 'zod';

export const HotKeywordSchema = z.object({
    title: z.string().min(1, '關鍵字標題為必填'),
    linkUrl: z.string().optional().nullable().or(z.literal('')),
    order: z.coerce.number().int().default(0),
    isActive: z.boolean().default(true),

    // ===== GA / GTM 埋點欄位 =====
    gaEvent: z.string().optional().nullable().default('ga-click'),
    gaEventName: z.string().optional().nullable(),
    gaCategory: z.string().optional().nullable(),
    gaLabel: z.string().optional().nullable(),
});

export type HotKeywordFormValues = z.infer<typeof HotKeywordSchema>;
