import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const faqs = await prisma.faq.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                order: 'asc',
            },
            select: {
                id: true,
                question: true,
                answer: true,
            },
        });

        return NextResponse.json(faqs, { 
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch (error) {
        console.error('[FAQS_GET]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}