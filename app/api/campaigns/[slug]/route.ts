import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

const PRODUCT_LIST_API = 'https://bi.dtsgroup.com.tw/api/product/ProductList';
const GROUP_LIST_API = 'https://bi.dtsgroup.com.tw/api/product/GroupList';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        const page = await prisma.newPage.findFirst({
            where: { slug, enabled: true }
        });

        if (!page) {
            return NextResponse.json({ status: false, message: '找不到頁面' }, { status: 404 });
        }

        const pageData = JSON.parse(JSON.stringify(page));
        let allProductIds: string[] = [];
        let allRefCodes: string[] = [];

        if (pageData.products && Array.isArray(pageData.products)) {
            pageData.products.forEach((item: any) => {
                if (item.productIds) allProductIds.push(...item.productIds);
                if (item.refCode) allRefCodes.push(item.refCode);
            });
        }

        let detailedProducts = [];
        if (allProductIds.length > 0 || allRefCodes.length > 0) {
            try {
                let apiUrl = "";
                let payload = {};

                if (pageData.mode === "ITEM") {
                    apiUrl = GROUP_LIST_API;
                    payload = { 
                        qgrupcds: allProductIds.join(','),
                        pageSize: 100 
                    };
                } else if (pageData.mode === "GRUPCD") {
                    apiUrl = PRODUCT_LIST_API;
                    payload = { 
                        qmgrupcds: allRefCodes.join(','),
                        pageSize: 100 
                    };
                }

                const apiRes = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    detailedProducts = apiData.data || [];
                }
            } catch (apiError) {
                console.error('[EXTERNAL_API_FETCH_ERROR]', apiError);
            }
        }

        if (pageData.mode === "ITEM") {
            pageData.products = detailedProducts;
        } else if (pageData.mode === "GRUPCD") {
            pageData.products = detailedProducts;
        }

        return NextResponse.json({
            status: true,
            data: pageData,
        }, { status: 200 });

    } catch (error) {
        console.error('[NEW_PAGE_GET_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}