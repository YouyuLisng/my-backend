'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { CardSchema } from '@/schemas/card'; 

export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

/** 讀取特定模組下的所有 Cards */
export async function getCardsByModule(moduleId: string) {
    if (!moduleId) return { success: false, error: 'Module ID is required' };

    try {
        const cards = await prisma.card.findMany({
            where: { moduleId },
            orderBy: { sortOrder: 'asc' }, 
        });
        return { success: true, data: cards };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: '無法讀取卡片列表' };
    }
}

/** 新增 Card */
export async function createCard(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    // 1. 處理 Tags 
    const tagsString = formData.get('tags') as string;
    const tagsArray = tagsString 
        ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) 
        : [];

    // 2. 整理表單資料
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description') || null,
        image: formData.get('image'),
        href: formData.get('href'),
        price: formData.get('price') ? String(formData.get('price')) : null, 
        moduleId: formData.get('moduleId'), 
        tags: tagsArray,
        isActive: formData.get('isActive') === 'on',
        sortOrder: 0, 
        
        // ✅ 新增：GA 欄位處理
        gaEvent: formData.get('gaEvent') || 'ga-click',
        gaEventName: formData.get('gaEventName') || null,
        gaCategory: formData.get('gaCategory') || null,
        gaLabel: formData.get('gaLabel') || null,
    };

    // 3. Zod 驗證
    const validated = CardSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        // 4. 計算排序
        const lastCard = await prisma.card.findFirst({
            where: { moduleId: validated.data.moduleId },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        });
        
        const newOrder = (lastCard?.sortOrder ?? -1) + 1;

        // 5. 寫入資料庫
        await prisma.card.create({
            data: {
                ...validated.data,
                sortOrder: newOrder,
            },
        });

        revalidatePath(`/admin/modules/${validated.data.moduleId}/cards`);
        revalidatePath('/admin/modules'); 
        
        return { success: true, message: '卡片建立成功！' };
    } catch (error) {
        console.error('Create error:', error);
        return { success: false, message: '資料庫錯誤，無法建立卡片。' };
    }
}

/** 更新 Card */
export async function updateCard(
    id: string,
    formData: FormData
): Promise<ActionState> {
    // 1. 處理 Tags
    const tagsString = formData.get('tags') as string;
    const tagsArray = tagsString 
        ? tagsString.split(',').map(tag => tag.trim()).filter(Boolean) 
        : [];

    // 2. 整理資料
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description') || null,
        image: formData.get('image'),
        href: formData.get('href'),
        price: formData.get('price') ? String(formData.get('price')) : null,
        moduleId: formData.get('moduleId'),
        tags: tagsArray,
        isActive: formData.get('isActive') === 'on',

        // ✅ 新增：GA 欄位處理
        gaEvent: formData.get('gaEvent') || 'ga-click',
        gaEventName: formData.get('gaEventName') || null,
        gaCategory: formData.get('gaCategory') || null,
        gaLabel: formData.get('gaLabel') || null,
    };

    const validated = CardSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        const { sortOrder, ...dataToUpdate } = validated.data;

        await prisma.card.update({
            where: { id },
            data: dataToUpdate,
        });

        revalidatePath(`/admin/modules/${validated.data.moduleId}/cards`);
        
        return { success: true, message: '更新成功' };
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, message: '更新失敗' };
    }
}

/** 刪除 Card */
export async function deleteCard(id: string) {
    try {
        const card = await prisma.card.findUnique({ where: { id }, select: { moduleId: true }});
        
        await prisma.card.delete({ where: { id } });
        
        if(card) {
            revalidatePath(`/admin/modules/${card.moduleId}/cards`);
        }
        
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: '刪除失敗' };
    }
}

/** 切換狀態 */
export async function toggleCardStatus(id: string, currentStatus: boolean) {
    try {
        const card = await prisma.card.update({
            where: { id },
            data: { isActive: !currentStatus },
            select: { moduleId: true }
        });
        
        revalidatePath(`/admin/modules/${card.moduleId}/cards`);
        return { success: true };
    } catch (error) {
        return { success: false, error: '更新失敗' };
    }
}

/** 排序 Cards */
export async function reorderCards(items: { id: string; sortOrder: number }[]) {
    try {
        const transaction = items.map((item) =>
            prisma.card.update({
                where: { id: item.id },
                data: { sortOrder: item.sortOrder },
            })
        );

        await prisma.$transaction(transaction);
        
        revalidatePath('/admin/modules/[id]/cards', 'page'); 
        
        return { success: true };
    } catch (error) {
        console.error('Reorder error:', error);
        return { success: false, message: '排序失敗' };
    }
}