'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ModuleSchema } from '@/schemas/module'; // 請確認路徑正確
import { Prisma } from '@prisma/client';

// 定義標準回傳格式
export type ActionState = {
    success: boolean;
    message: string;
    errors?: {
        [key: string]: string[];
    };
};

/** 讀取所有 Module */
export async function getModules() {
    try {
        const modules = await prisma.module.findMany({
            orderBy: { createdAt: 'asc' },
            include: {
                cards: true,
            }
        });
        return { success: true, data: modules };
    } catch (error) {
        console.error('Fetch error:', error);
        return { success: false, error: '無法讀取模組列表' };
    }
}

/** 新增 Module */
export async function createModule(
    prevState: any,
    formData: FormData
): Promise<ActionState> {
    // 1. 整理表單資料
    const rawData = {
        title: formData.get('title'),
        icon: formData.get('icon'),
        description: formData.get('description') || null,
        isActive: formData.get('isActive') === 'on',
    };

    // 2. Zod 驗證
    const validated = ModuleSchema.safeParse(rawData);
    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    // 3. 寫入資料庫
    try {
        await prisma.module.create({
            data: validated.data,
        });

        revalidatePath('/admin/modules');
        revalidatePath('/'); 
        return { success: true, message: '模組建立成功！' };
    } catch (error) {
        console.error('Create error:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { 
                success: false, 
                message: '模組標題已存在，請使用其他名稱。',
                errors: { title: ['標題不可重複'] }
            };
        }

        return { success: false, message: '資料庫錯誤，無法建立模組。' };
    }
}

/** 更新 Module */
export async function updateModule(
    id: string,
    formData: FormData
): Promise<ActionState> {
    const rawData = {
        title: formData.get('title'),
        icon: formData.get('icon'),
        description: formData.get('description') || null,
        isActive: formData.get('isActive') === 'on',
    };

    const validated = ModuleSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            success: false,
            message: '欄位驗證失敗',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    try {
        await prisma.module.update({
            where: { id },
            data: validated.data,
        });

        revalidatePath('/admin/modules');
        revalidatePath('/');
        return { success: true, message: '更新成功' };
    } catch (error) {
        console.error('Update error:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return { 
                success: false, 
                message: '模組標題已存在，請使用其他名稱。',
                errors: { title: ['標題不可重複'] }
            };
        }

        return { success: false, message: '更新失敗' };
    }
}

/** 刪除 Module */
export async function deleteModule(id: string) {
    try {
        await prisma.module.delete({ where: { id } });
        
        revalidatePath('/admin/modules');
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: '刪除失敗' };
    }
}

/** 切換狀態 */
export async function toggleModuleStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.module.update({
            where: { id },
            data: { isActive: !currentStatus },
        });
        revalidatePath('/admin/modules');
        return { success: true };
    } catch (error) {
        return { success: false, error: '更新失敗' };
    }
}