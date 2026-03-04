import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const ads = await prisma.ad.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
            select: {
                id: true,
                title: true,
                image: true,
                href: true,
                gaEvent: true,
                gaEventName: true,
                gaCategory: true,
                gaLabel: true,
            },
        });

        return NextResponse.json(ads, { status: 200 });
    } catch (error) {
        console.error('[ADS_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
