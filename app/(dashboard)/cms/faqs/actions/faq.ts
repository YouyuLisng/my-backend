'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { FaqSchema } from '@/schemas/faq';

export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

/** 讀取所有 FAQ */
export async function getFaqs() {
    try {
        const faqs = await prisma.faq.findMany({
            orderBy: { order: 'asc' },
        });
        return { success: true, data: faqs };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: '無法讀取 FAQ 列表' };
    }
}

/** 新增 FAQ */
export async function createFaq(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    
    const rawData = {
        question: formData.get('question'),
        answer: formData.get('answer'),
        order: formData.get('order'),
        isActive: formData.get('isActive') === 'on',
    };

    const validated = FaqSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.faq.create({
            data: validated.data,
        });

        revalidatePath('/admin/faq');
        revalidatePath('/');
        return { success: true, message: 'FAQ 建立成功！' };
    } catch (error) {
        console.error('Create error:', error);
        return { success: false, message: '資料庫錯誤，無法建立 FAQ。' };
    }
}

/** 更新 FAQ */
export async function updateFaq(
    id: string,
    formData: FormData
): Promise<ActionState> {
    
    const rawData = {
        question: formData.get('question'),
        answer: formData.get('answer'),
        order: formData.get('order'),
        isActive: formData.get('isActive') === 'on',
    };

    const validated = FaqSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.faq.update({
            where: { id },
            data: validated.data,
        });

        revalidatePath('/admin/faq');
        revalidatePath('/');
        return { success: true, message: '更新成功' };
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, message: '更新失敗' };
    }
}

/** 刪除 FAQ */
export async function deleteFaq(id: string) {
    try {
        await prisma.faq.delete({ where: { id } });
        revalidatePath('/admin/faq');
        return { success: true };
    } catch (error) {
        return { success: false, error: '刪除失敗' };
    }
}

/** 切換狀態 (上下架) */
export async function toggleFaqStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.faq.update({
            where: { id },
            data: { isActive: !currentStatus },
        });
        revalidatePath('/admin/faq');
        return { success: true };
    } catch (error) {
        return { success: false, error: '更新失敗' };
    }
}

/** 排序更新 */
export async function reorderFaqs(idList: string[]) {
    try {
        const transaction = idList.map((id, index) =>
            prisma.faq.update({
                where: { id },
                data: { order: index },
            })
        );
        await prisma.$transaction(transaction);
        revalidatePath('/admin/faq');
        return { success: true };
    } catch (error) {
        return { success: false, message: '排序失敗' };
    }
}