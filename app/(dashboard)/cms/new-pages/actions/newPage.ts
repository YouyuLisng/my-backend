'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { NewPageSchema } from '@/schemas/newPage';
import { Role } from '@prisma/client';

/**
 * 定義 Action 回傳狀態型別
 */
export type ActionState = {
    success: boolean;
    message: string;
    errors?: { [key: string]: string[] };
    data?: any;
};

/**
 * 🔒 內部輔助函式：取得並驗證 Session 使用者
 */
async function getSessionUser() {
    const session = await auth();
    if (!session?.user) throw new Error("未授權訪問：請先登入");
    return session.user; 
}

/**
 * 🛠️ 內部輔助函式：安全解析 JSON
 * 解決 FormData 傳遞 JSON 字串時可能出現的 "null" 或 "undefined" 字串問題
 */
const safeJsonParse = (val: any, fallback: any) => {
    if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') {
        return fallback;
    }
    try {
        return typeof val === 'string' ? JSON.parse(val) : val;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
};

/**
 * 📝 內部輔助函式：將 FormData 轉換為結構化資料
 * 嚴格對照 Prisma NewPage Model 與 Zod Schema
 */
const parsePageFormData = (formData: FormData) => {
    return {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        mode: (formData.get('mode') as string) || 'GRUPCD',
        enabled: formData.get('enabled') === 'on' || formData.get('enabled') === 'true',
        mainImage: (formData.get('mainImage') as string) || null,
        mobileImage: (formData.get('mobileImage') as string) || null,
        content: (formData.get('content') as string) || null,
        
        // 處理 MongoDB 複合型別 (Composite Types)
        seo: safeJsonParse(formData.get('seo'), null),
        tracking: safeJsonParse(formData.get('tracking'), null),
        products: safeJsonParse(formData.get('products'), []),
    };
};

// ================================================================
// 📖 讀取活動頁 (Read)
// ================================================================

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

// ================================================================
// 🆕 建立活動頁 (Create)
// ================================================================

export async function createNewPage(formData: FormData): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        
        // 🔒 權限防線：產品部 (PRODUCT) 禁止建立
        if (user.role === Role.PRODUCT) {
            return { success: false, message: '權限不足：產品部無法建立新活動頁' };
        }

        const rawData = parsePageFormData(formData);
        const validated = NewPageSchema.safeParse(rawData);

        if (!validated.success) {
            return { 
                success: false, 
                message: '驗證失敗：請檢查輸入欄位', 
                errors: validated.error.flatten().fieldErrors 
            };
        }

        // 🚀 執行寫入：validated.data 結構已完全符合 Prisma NewPage 型別
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
        return { success: false, message: '資料庫寫入失敗，請檢查網路連線或 Schema 設定' };
    }
}

// ================================================================
// 🔄 更新活動頁 (Update)
// ================================================================

export async function updateNewPage(id: string, formData: FormData): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        
        // 🔒 權限分流：產品部 (PRODUCT) 只能更新產品列表 (products)
        if (user.role === Role.PRODUCT) {
            const productsJson = formData.get('products');
            await prisma.newPage.update({
                where: { id },
                data: {
                    products: safeJsonParse(productsJson, []),
                }
            });
            revalidatePath('/cms/new-pages');
            return { success: true, message: '產品清單已更新 (僅限產品欄位)' };
        }

        // 🔓 企劃 (PLANNING) 與開發 (DEV)：可更新所有內容
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
        return { success: false, message: error.message || '更新失敗，請檢查資料格式' };
    }
}

// ================================================================
// 🔘 切換發佈狀態 (Toggle Status)
// ================================================================

export async function toggleNewPageStatus(id: string, currentStatus: boolean): Promise<ActionState> {
    try {
        const user = await getSessionUser();

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
        return { success: false, message: '發佈狀態更新失敗' };
    }
}

// ================================================================
// 🗑️ 刪除活動頁 (Delete)
// ================================================================

export async function deleteNewPage(id: string): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        
        // 🔒 只有 PLANNING 和 DEV 可以刪除
        if (user.role === Role.PRODUCT) {
            return { success: false, message: '權限不足：產品部無法刪除頁面' };
        }

        await prisma.newPage.delete({
            where: { id }
        });

        revalidatePath('/cms/new-pages');
        return { success: true, message: '活動頁已從資料庫移除' };
    } catch (error) {
        console.error('Delete Error:', error);
        return { success: false, message: '刪除失敗：資料可能已被移除或存在關聯錯誤' };
    }
}