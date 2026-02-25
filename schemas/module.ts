import { z } from 'zod';

export const ModuleSchema = z.object({
    title: z.string().min(1, '模組標題為必填'),
    icon: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});