import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title');

        // 1. 單一查詢 (根據 Title)
        if (title) {
            const moduleData = await prisma.module.findUnique({
                where: { 
                    title: title,
                    isActive: true
                },
                include: {
                    cards: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                    },
                },
            });

            if (!moduleData) {
                return NextResponse.json(
                    { error: `找不到名為「${title}」的模組或該模組尚未啟用` },
                    { status: 404 }
                );
            }

            return NextResponse.json(moduleData, { status: 200 });
        }

        // 2. 批量查詢 (回傳所有啟用的模組)
        const allModules = await prisma.module.findMany({
            where: {
                isActive: true,
            },
            include: {
                cards: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                }
            },
        });

        return NextResponse.json(allModules, { status: 200 });

    } catch (error) {
        console.error('[MODULES_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}