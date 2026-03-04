import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const page = await prisma.newPage.findFirst({
            where: {
                slug: slug,
                enabled: true,
            }
        });

        if (!page) {
            return NextResponse.json(
                { status: false, message: '找不到該頁面或頁面尚未啟用' },
                { status: 404 }
            );
        }

        if (page.products && page.products.length > 0) {
            page.products.sort((a, b) => a.sortOrder - b.sortOrder);
        }

        return NextResponse.json({
            status: true,
            data: page,
        }, { status: 200 });

    } catch (error) {
        console.error('[NEW_PAGE_GET_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}