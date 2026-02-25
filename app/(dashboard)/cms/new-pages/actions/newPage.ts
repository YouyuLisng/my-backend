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

async function getSessionUser() {
    const session = await auth();
    if (!session?.user) throw new Error("未授權訪問");
    return session.user;
}

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

/** * ✅ 修正：移除 prevState，改為僅接收 formData 以匹配前端 onSubmit 呼叫
 */
export async function createNewPage(formData: FormData): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        
        if (user.role === Role.PRODUCT) {
            return { success: false, message: '權限不足：產品部無法建立新活動頁' };
        }

        // 解析資料並補齊 missing fields
        const rawData = {
            title: formData.get('title'),
            slug: formData.get('slug'),
            mode: formData.get('mode') || 'GRUP',
            enabled: formData.get('enabled') === 'on',
            mainImage: formData.get('mainImage') || '',
            mobileImage: formData.get('mobileImage') || '',
            content: formData.get('content') || '',
            seo: formData.get('seo') ? JSON.parse(formData.get('seo') as string) : undefined,
            tracking: formData.get('tracking') ? JSON.parse(formData.get('tracking') as string) : undefined,
            products: [], // 初始產品清單為空
        };

        const validated = NewPageSchema.safeParse(rawData);
        if (!validated.success) {
            return { success: false, message: '驗證失敗', errors: validated.error.flatten().fieldErrors };
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
        
        if (user.role === Role.PRODUCT) {
            await prisma.newPage.update({
                where: { id },
                data: {
                    products: productsJson ? JSON.parse(productsJson) : [],
                }
            });
            revalidatePath('/cms/new-pages');
            return { success: true, message: '產品勾選清單已儲存' };
        }

        if (user.role === Role.PLANNING || user.role === Role.DEV) {
            const rawData = {
                title: formData.get('title'),
                slug: formData.get('slug'),
                mode: formData.get('mode'),
                mainImage: formData.get('mainImage'),
                mobileImage: formData.get('mobileImage'),
                content: formData.get('content'),
                enabled: formData.get('enabled') === 'on',
                seo: formData.get('seo') ? JSON.parse(formData.get('seo') as string) : undefined,
                tracking: formData.get('tracking') ? JSON.parse(formData.get('tracking') as string) : undefined,
                products: productsJson ? JSON.parse(productsJson) : undefined,
            };

            const validated = NewPageSchema.safeParse(rawData);
            if (!validated.success) {
                return { success: false, message: '驗證失敗', errors: validated.error.flatten().fieldErrors };
            }

            await prisma.newPage.update({
                where: { id },
                data: validated.data,
            });

            revalidatePath('/cms/new-pages');
            revalidatePath(`/pages/${validated.data.slug}`); 
            return { success: true, message: '活動頁內容已全面更新' };
        }

        return { success: false, message: '無效的角色權限' };
    } catch (error) {
        console.error('Update Error:', error);
        return { success: false, message: '更新失敗，請稍後再試' };
    }
}

export async function deleteNewPage(id: string): Promise<ActionState> {
    try {
        const user = await getSessionUser();
        if (user.role === Role.PRODUCT) return { success: false, message: '權限不足' };

        await prisma.newPage.delete({ where: { id } });
        revalidatePath('/cms/new-pages');
        return { success: true, message: '活動頁已刪除' };
    } catch (error) {
        return { success: false, message: '刪除失敗' };
    }
}