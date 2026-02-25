'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { HotKeywordSchema } from '@/schemas/hotKeyword';

// 定義標準回傳格式
export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

/** 讀取所有熱門關鍵字 */
export async function getHotKeywords() {
    try {
        const keywords = await prisma.hotKeyword.findMany({
            orderBy: { order: 'asc' },
        });
        return { success: true, data: keywords };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: '無法讀取熱門關鍵字列表' };
    }
}

/** 新增熱門關鍵字 */
export async function createHotKeyword(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    // 1. 整理表單資料
    const rawData = {
        title: formData.get('title'),
        linkUrl: formData.get('linkUrl') || null,
        order: formData.get('order'),
        isActive: formData.get('isActive') === 'on',

        // GA 欄位
        gaEvent: formData.get('gaEvent') || 'ga-click',
        gaEventName: formData.get('gaEventName') || null,
        gaCategory: formData.get('gaCategory') || null,
        gaLabel: formData.get('gaLabel') || null,
    };

    // 2. Zod 驗證
    const validated = HotKeywordSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        // 3. 寫入資料庫
        await prisma.hotKeyword.create({
            data: validated.data,
        });

        // 4. 更新快取 (請確認你的後台路徑是否正確)
        revalidatePath('/admin/hot-keywords');
        revalidatePath('/'); // 首頁若有顯示也要更新

        return { success: true, message: '關鍵字建立成功！' };
    } catch (error) {
        console.error('Create error:', error);
        return { success: false, message: '資料庫錯誤，無法建立關鍵字。' };
    }
}

/** 更新熱門關鍵字 */
export async function updateHotKeyword(
    id: string,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        title: formData.get('title'),
        linkUrl: formData.get('linkUrl') || null,
        order: formData.get('order'),
        isActive: formData.get('isActive') === 'on',

        // GA 欄位
        gaEvent: formData.get('gaEvent') || 'ga-click',
        gaEventName: formData.get('gaEventName') || null,
        gaCategory: formData.get('gaCategory') || null,
        gaLabel: formData.get('gaLabel') || null,
    };

    const validated = HotKeywordSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.hotKeyword.update({
            where: { id },
            data: validated.data,
        });

        revalidatePath('/admin/hot-keywords');
        revalidatePath('/');

        return { success: true, message: '更新成功' };
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, message: '更新失敗' };
    }
}

/** 刪除熱門關鍵字 */
export async function deleteHotKeyword(id: string) {
    try {
        await prisma.hotKeyword.delete({ where: { id } });

        revalidatePath('/admin/hot-keywords');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: '刪除失敗' };
    }
}

/** 切換啟用狀態 */
export async function toggleHotKeywordStatus(
    id: string,
    currentStatus: boolean
) {
    try {
        await prisma.hotKeyword.update({
            where: { id },
            data: { isActive: !currentStatus },
        });

        revalidatePath('/admin/hot-keywords');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        return { success: false, error: '更新失敗' };
    }
}

/** 排序熱門關鍵字 */
export async function reorderHotKeywords(
    items: { id: string; sortOrder: number }[]
) {
    try {
        const transaction = items.map((item) =>
            prisma.hotKeyword.update({
                where: { id: item.id },
                data: { order: item.sortOrder },
            })
        );

        await prisma.$transaction(transaction);

        revalidatePath('/admin/hot-keywords');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Reorder error:', error);
        return { success: false, message: '排序失敗' };
    }
}
