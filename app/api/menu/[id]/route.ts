import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma'; // ✅ 統一改用 prisma 單例

interface Props {
    params: Promise<{ id: string }>;
}

/** ✅ 更新單一 Menu */
export async function PUT(request: NextRequest, { params }: Props) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

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
            gaEvent,
            gaEventName,
            gaCategory,
            gaLabel,
        } = body;

        if (!title) {
            return NextResponse.json(
                { error: '請填寫標題 title' },
                { status: 400 }
            );
        }

        // ✅ 檢查 parentId 是否存在（若有指定且非自己）
        if (parentId) {
            if (parentId === id) {
                return NextResponse.json(
                    { error: '父層級不能設定為自己' },
                    { status: 400 }
                );
            }

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

        // ✅ 執行更新
        const updatedMenu = await prisma.menu.update({
            where: { id },
            data: {
                title,
                description: description || null,
                linkUrl: linkUrl || null,
                imageUrl: imageUrl || null,
                order: order ?? undefined, // 若沒傳就不更動
                isActive: isActive ?? true,
                parentId: parentId ?? null,

                // GA 欄位更新
                gaEvent: gaEvent || undefined,
                gaEventName: gaEventName || null,
                gaCategory: gaCategory || null,
                gaLabel: gaLabel || null,
            },
        });

        return NextResponse.json({
            status: true,
            message: `Menu「${updatedMenu.title}」更新成功`,
            data: updatedMenu,
        });
    } catch (error) {
        console.error('Error updating menu:', error);
        return NextResponse.json(
            { error: 'Failed to update menu' },
            { status: 500 }
        );
    }
}

/** ✅ 刪除 Menu */
export async function DELETE(request: NextRequest, { params }: Props) {
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        // 檢查是否有子節點（建議做法，避免產生孤兒節點）
        const hasChildren = await prisma.menu.findFirst({
            where: { parentId: id },
        });

        if (hasChildren) {
            return NextResponse.json(
                {
                    error: '刪除失敗：此選單下仍有子選單，請先移除或移動子選單。',
                },
                { status: 400 }
            );
        }

        const deletedMenu = await prisma.menu.delete({
            where: { id },
        });

        return NextResponse.json({
            status: true,
            message: `Menu「${deletedMenu.title}」已成功刪除`,
            data: deletedMenu,
        });
    } catch (error) {
        console.error('Error deleting menu:', error);
        return NextResponse.json(
            { error: 'Failed to delete menu' },
            { status: 500 }
        );
    }
}
