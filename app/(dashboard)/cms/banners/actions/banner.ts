'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BannerCreateSchema } from '@/schemas/banner';

// 1. 定義標準回傳格式
export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

/** 讀取所有 Banner */
export async function getBanners() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { order: 'asc' },
        });
        return { success: true, data: banners };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: '無法讀取 Banner 列表' };
    }
}

/** 新增 Banner */
export async function createBanner(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    
    // 2. 整理表單資料
    const rawData = {
        title: formData.get('title'),
        imageUrl: formData.get('imageUrl'),
        subtitle: formData.get('subtitle') || null,
        linkText: formData.get('linkText') || null,
        linkUrl: formData.get('linkUrl') || null,
        order: Number(formData.get('order')) || 0, // 確保轉為數字
        isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
        
        // GA 欄位
        gaEvent: formData.get('gaEvent') || 'ga-click',
        gaEventName: formData.get('gaEventName') || null,
        gaCategory: formData.get('gaCategory') || null,
        gaLabel: formData.get('gaLabel') || null,
    };

    const validated = BannerCreateSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.banner.create({
            data: validated.data,
        });

        revalidatePath('/admin/banner');
        revalidatePath('/'); 
        return { success: true, message: 'Banner 建立成功！' };
    } catch (error) {
        console.error('Create error:', error);
        return { success: false, message: '資料庫錯誤，無法建立 Banner。' };
    }
}

/** 更新 Banner */
export async function updateBanner(
    id: string,
    formData: FormData
): Promise<ActionState> {
    
    const rawData = {
        title: formData.get('title'),
        imageUrl: formData.get('imageUrl'),
        subtitle: formData.get('subtitle') || null,
        linkText: formData.get('linkText') || null,
        linkUrl: formData.get('linkUrl') || null,
        order: Number(formData.get('order')) || 0,
        isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',

        gaEvent: formData.get('gaEvent') || 'ga-click',
        gaEventName: formData.get('gaEventName') || null,
        gaCategory: formData.get('gaCategory') || null,
        gaLabel: formData.get('gaLabel') || null,
    };

    const validated = BannerCreateSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.banner.update({
            where: { id },
            data: validated.data,
        });

        revalidatePath('/admin/banner');
        revalidatePath('/');
        return { success: true, message: '更新成功' };
    } catch (error) {
        console.error('Update error:', error);
        return { success: false, message: '更新失敗' };
    }
}

/** 刪除 Banner */
export async function deleteBanner(id: string) {
    try {
        await prisma.banner.delete({ where: { id } });
        revalidatePath('/admin/banner');
        return { success: true };
    } catch (error) {
        return { success: false, error: '刪除失敗' };
    }
}

/** 切換狀態 */
export async function toggleBannerStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.banner.update({
            where: { id },
            data: { isActive: !currentStatus },
        });
        revalidatePath('/admin/banner');
        return { success: true };
    } catch (error) {
        return { success: false, error: '更新失敗' };
    }
}

/** 排序 */
export async function reorderBanners(idList: string[]) {
    try {
        // 使用 $transaction 確保批量更新的效能與原子性
        await prisma.$transaction(
            idList.map((id, index) =>
                prisma.banner.update({
                    where: { id },
                    data: { order: index },
                })
            )
        );
        revalidatePath('/admin/banner');
        return { success: true };
    } catch (error) {
        console.error('Reorder error:', error);
        return { success: false, message: '排序失敗' };
    }
}