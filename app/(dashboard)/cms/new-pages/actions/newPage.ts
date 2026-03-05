'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { NewPageSchema } from '@/schemas/newPage';
import { Role } from '@prisma/client';

export type ActionState = {
    success: boolean;
    message: string;
    errors?: { [key: string]: string[] };
};

/**
 * 內部輔助函式：取得並驗證 Session 使用者
 */
async function getSessionUser() {
    const session = await auth();
    if (!session?.user) throw new Error("未授權訪問");
    return session.user; 
}

/**
 * 內部輔助函式：將 FormData 轉換為結構化資料並進行資料清洗
 */
const parsePageFormData = (formData: FormData) => {
    return {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        mode: (formData.get('mode') as string) || 'GRUPCD', // 修正：從 GRUP 改為 GRUPCD
        enabled: formData.get('enabled') === 'on' || formData.get('enabled') === 'true',
        mainImage: (formData.get('mainImage') as string) || null,
        mobileImage: (formData.get('mobileImage') as string) || null,
        content: (formData.get('content') as string) || null,
        seo: formData.get('seo') ? JSON.parse(formData.get('seo') as string) : undefined,
        tracking: formData.get('tracking') ? JSON.parse(formData.get('tracking') as string) : undefined,
        products: formData.get('products') ? JSON.parse(formData.get('products') as string) : [],
    };
};

export async function getNewPages() {
    try {
        const pages = await prisma.newPage.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: pages };
    } catch (error) {
        console.error('Fetch Error:', error);
        return { success: false, message: '無法讀取活動頁列表' };
    }
}

export async function createNewPage(formData: FormData): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        
        // 🔒 權限防線：產品部禁止建立
        if (user.role === Role.PRODUCT) {
            return { success: false, message: '權限不足：產品部無法建立新活動頁' };
        }

        const rawData = parsePageFormData(formData);
        const validated = NewPageSchema.safeParse(rawData);

        if (!validated.success) {
            return { 
                success: false, 
                message: '驗證失敗', 
                errors: validated.error.flatten().fieldErrors 
            };
        }

        await prisma.newPage.create({
            data: validated.data,
        });

        revalidatePath('/cms/new-pages');
        return { success: true, message: '活動頁已成功建立' };
    } catch (error: any) {
        console.error('Create Error:', error);
        if (error.code === 'P2002') {
            return { success: false, message: '儲存失敗：網址路徑 (Slug) 已被使用' };
        }
        return { success: false, message: '資料庫寫入失敗，請稍後再試' };
    }
}

export async function updateNewPage(id: string, formData: FormData): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        const productsJson = formData.get('products') as string;
        
        // 🔒 權限分流：產品部 (PRODUCT) 只能更新產品列表欄位
        if (user.role === Role.PRODUCT) {
            await prisma.newPage.update({
                where: { id },
                data: {
                    products: productsJson ? JSON.parse(productsJson) : [],
                }
            });
            revalidatePath('/cms/new-pages');
            return { success: true, message: '產品勾選清單已更新' };
        }

        // 🔓 企劃 (PLANNING) 與開發 (DEV)：可以更新所有內容
        if (user.role === Role.PLANNING || user.role === Role.DEV) {
            const rawData = parsePageFormData(formData);
            const validated = NewPageSchema.safeParse(rawData);

            if (!validated.success) {
                return { 
                    success: false, 
                    message: '驗證失敗', 
                    errors: validated.error.flatten().fieldErrors 
                };
            }

            const updatedPage = await prisma.newPage.update({
                where: { id },
                data: validated.data,
            });

            revalidatePath('/cms/new-pages');
            revalidatePath(`/pages/${updatedPage.slug}`); 
            return { success: true, message: '活動頁內容已全面更新' };
        }

        return { success: false, message: '無效的角色權限' };
    } catch (error: any) {
        console.error('Update Error:', error);
        return { success: false, message: error.message || '更新失敗，請稍後再試' };
    }
}

/**
 * 切換活動頁面發佈狀態 (Enabled Status)
 */
export async function toggleNewPageStatus(id: string, currentStatus: boolean): Promise<ActionState> {
    try {
        const user = await getSessionUser();

        // 🔒 權限防線：產品部禁止切換發佈狀態
        if (user.role === Role.PRODUCT) {
            return { success: false, message: '權限不足：產品部無法變更發佈狀態' };
        }

        const updatedPage = await prisma.newPage.update({
            where: { id },
            data: { enabled: !currentStatus },
        });

        revalidatePath('/cms/new-pages');
        revalidatePath(`/pages/${updatedPage.slug}`);
        
        return { 
            success: true, 
            message: `頁面「${updatedPage.title}」已${!currentStatus ? '發佈' : '撤下'}` 
        };
    } catch (error) {
        console.error('Toggle Status Error:', error);
        return { success: false, message: '狀態更新失敗' };
    }
}

/**
 * 刪除活動頁面
 */
export async function deleteNewPage(id: string): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        // 🔒 只有 PLANNING 和 DEV 可以刪除
        if (user.role === Role.PRODUCT) return { success: false, message: '權限不足' };

        await prisma.newPage.delete({ where: { id } });
        revalidatePath('/cms/new-pages');
        return { success: true, message: '活動頁已刪除' };
    } catch (error) {
        console.error('Delete Error:', error);
        return { success: false, message: '刪除失敗' };
    }
}