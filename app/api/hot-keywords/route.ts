import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const keywords = await prisma.hotKeyword.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                order: 'asc',
            },
            select: {
                id: true,
                title: true,
                linkUrl: true,
                gaEvent: true,
                gaEventName: true,
                gaCategory: true,
                gaLabel: true,
            },
        });

        return NextResponse.json(keywords, { 
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            }
        });
    } catch (error) {
        console.error('[HOT_KEYWORDS_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}