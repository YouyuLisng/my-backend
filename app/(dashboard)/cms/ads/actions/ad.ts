'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { AdSchema } from '@/schemas/ad';

// 定義回傳的狀態型別
export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

/** * 1. 讀取所有廣告 (後台管理列表用)
 * 依照 sortOrder 排序
 */
export async function getAds() {
    try {
        const ads = await prisma.ad.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        return { success: true, data: ads };
    } catch (error) {
        console.error('Fetch Ads Error:', error);
        return { success: false, error: '無法讀取廣告列表' };
    }
}

/** * 2. 讀取前台用廣告 (只抓取 isActive: true)
 */
export async function getActiveAds() {
    try {
        const ads = await prisma.ad.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        return ads;
    } catch (error) {
        return [];
    }
}

/** * 3. 新增廣告
 */
export async function createAd(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    // 解析 FormData
    const rawData = {
        title: formData.get('title'),
        image: formData.get('image'),
        href: formData.get('href'),
        isActive: formData.get('isActive') === 'on', // Checkbox/Switch 處理
        sortOrder: formData.get('sortOrder'),

        // GA 欄位
        gaEvent: formData.get('gaEvent'),
        gaEventName: formData.get('gaEventName'),
        gaCategory: formData.get('gaCategory'),
        gaLabel: formData.get('gaLabel'),
    };

    // Zod 驗證
    const validated = AdSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    // 資料庫寫入
    try {
        // 處理空字串轉 null (如果 Prisma schema 是 String?)
        const dataToSave = {
            ...validated.data,
            gaEvent: validated.data.gaEvent || 'ga-click', // 預設值
            gaEventName: validated.data.gaEventName || null,
            gaCategory: validated.data.gaCategory || null,
            gaLabel: validated.data.gaLabel || null,
        };

        await prisma.ad.create({
            data: dataToSave,
        });

        revalidatePath('/admin/ads'); // 更新後台
        revalidatePath('/'); // 更新前台首頁

        return { success: true, message: '廣告建立成功！' };
    } catch (error) {
        console.error('Create Ad Error:', error);
        return { success: false, message: '資料庫錯誤，無法建立廣告。' };
    }
}

/** * 4. 更新廣告
 */
export async function updateAd(
    id: string,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        title: formData.get('title'),
        image: formData.get('image'),
        href: formData.get('href'),
        isActive: formData.get('isActive') === 'on',
        sortOrder: formData.get('sortOrder'),

        gaEvent: formData.get('gaEvent'),
        gaEventName: formData.get('gaEventName'),
        gaCategory: formData.get('gaCategory'),
        gaLabel: formData.get('gaLabel'),
    };

    const validated = AdSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        const dataToSave = {
            ...validated.data,
            gaEvent: validated.data.gaEvent || 'ga-click',
            gaEventName: validated.data.gaEventName || null,
            gaCategory: validated.data.gaCategory || null,
            gaLabel: validated.data.gaLabel || null,
        };

        await prisma.ad.update({
            where: { id },
            data: dataToSave,
        });

        revalidatePath('/admin/ads');
        revalidatePath('/');
        return { success: true, message: '更新成功' };
    } catch (error) {
        console.error('Update Ad Error:', error);
        return { success: false, message: '更新失敗' };
    }
}

/** * 5. 刪除廣告
 */
export async function deleteAd(id: string) {
    try {
        await prisma.ad.delete({ where: { id } });
        revalidatePath('/admin/ads');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: '刪除失敗' };
    }
}

/** * 6. 快速切換狀態 (isActive)
 */
export async function toggleAdStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.ad.update({
            where: { id },
            data: { isActive: !currentStatus },
        });
        revalidatePath('/admin/ads');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false, error: '狀態更新失敗' };
    }
}

/** * 7. 拖曳排序 (Reorder)
 */
export async function reorderAds(idList: string[]) {
    try {
        // 使用 Transaction 確保資料一致性
        const transaction = idList.map((id, index) =>
            prisma.ad.update({
                where: { id },
                data: { sortOrder: index },
            })
        );

        await prisma.$transaction(transaction);

        revalidatePath('/admin/ads');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Reorder Ad Error:', error);
        return { success: false, message: '排序更新失敗' };
    }
}
