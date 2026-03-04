import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Menu } from '@prisma/client';

// ✅ 擴充 Prisma Menu，加上 children 屬性
export type MenuWithChildren = Menu & { children: MenuWithChildren[] };

// ✅ 遞迴組裝樹狀結構
function buildMenuTree(
    items: Menu[],
    parentId: string | null = null
): MenuWithChildren[] {
    return items
        .filter((item) => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
            ...item,
            children: buildMenuTree(items, item.id),
        }));
}

// ------------------ POST: 建立選單 ------------------
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            title,
            description,
            linkUrl,
            imageUrl,
            order,
            isActive,
            parentId,
            // 如果你的 Schema 有 TrackingConfig，這裡需對應處理
        } = body;
        
        if (!title) {
            return NextResponse.json(
                { error: '請填寫標題 title' },
                { status: 400 }
            );
        }

        // 檢查父層是否存在
        if (parentId) {
            const parentMenu = await prisma.menu.findUnique({
                where: { id: parentId },
            });
            if (!parentMenu) {
                return NextResponse.json(
                    { error: `指定的 parentId(${parentId}) 不存在` },
                    { status: 400 }
                );
            }
        }

        const menu = await prisma.menu.create({
            data: {
                title,
                description: description || null,
                linkUrl: linkUrl || null,
                imageUrl: imageUrl || null,
                order: order ?? 0,
                isActive: isActive ?? true,
                parentId: parentId ?? null,
                // 注意：如果你的 Schema 中 tracking 是關聯對象，
                // 這裡需要用 tracking: { create: { ... } } 的方式寫入
            },
        });

        return NextResponse.json(
            {
                status: true,
                message: `Menu「${menu.title}」建立成功`,
                data: menu,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating menu:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// ------------------ GET: 獲取樹狀選單 ------------------
export async function GET() {
    try {
        const flatMenus = await prisma.menu.findMany({
            orderBy: { order: 'asc' },
        });
        const menuTree = buildMenuTree(flatMenus);

        return NextResponse.json({
            status: true,
            message: '成功取得選單列表',
            data: menuTree,
        });
    } catch (error) {
        console.error('Error fetching menus:', error);
        return NextResponse.json(
            { error: 'Failed to fetch menus' },
            { status: 500 }
        );
    }
}