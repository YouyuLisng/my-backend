import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
    try {
        const body = await req.json();

        // 1. 驗證格式
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: '無效的資料格式' }, { status: 400 });
        }

        // 2. 使用 $transaction 確保原子性 (Atomicity)
        // 這樣如果其中一筆更新失敗，整批操作都會回滾
        await prisma.$transaction(
            body.map((item: { id: string; order: number; parentId?: string | null }) =>
                prisma.menu.update({
                    where: { id: item.id },
                    data: {
                        order: item.order,
                        parentId: item.parentId ?? null,
                    },
                })
            )
        );

        return NextResponse.json({ 
            status: true, 
            message: '選單排序與層級更新成功' 
        });
    } catch (error) {
        console.error('排序更新失敗：', error);
        return NextResponse.json(
            { error: '更新失敗，請稍後再試' }, 
            { status: 500 }
        );
    }
}