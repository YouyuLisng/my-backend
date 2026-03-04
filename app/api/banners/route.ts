import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                order: 'asc',
            },
            select: {
                id: true,
                imageUrl: true,
                title: true,
                subtitle: true,
                linkText: true,
                linkUrl: true, 
                gaEvent: true,
                gaEventName: true,
                gaCategory: true,
                gaLabel: true,
            },
        });

        return NextResponse.json(banners, { status: 200 });
    } catch (error) {
        console.error('[BANNERS_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}