import * as z from 'zod';

export const FaqSchema = z.object({
    question: z.string().min(1, '問題必填'),
    answer: z.string().min(1, '回答內容必填'),
    order: z.coerce.number().int().nonnegative().default(0),
    isActive: z.boolean().default(true),
});

export type FaqFormValues = z.infer<typeof FaqSchema>;
