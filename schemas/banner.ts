import * as z from 'zod';

export const BannerCreateSchema = z.object({
  imageUrl: z.string().min(1, '請提供圖片 URL'),
  title: z.string().min(1, '標題必填'),
  subtitle: z.string().optional().nullable(),
  linkText: z.string().optional().nullable(),
  linkUrl: z.string().optional().nullable().or(z.literal('')),
  order: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),

  gaEvent: z.string().optional().nullable().default('ga-click'),
  gaEventName: z.string().optional().nullable(),
  gaCategory: z.string().optional().nullable(),
  gaLabel: z.string().optional().nullable(),
});

export type BannerFormValues = z.infer<typeof BannerCreateSchema>;