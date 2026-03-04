import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        // 1. 先抓取 Page 基礎資料
        const page = await prisma.newPage.findFirst({
            where: { slug, enabled: true }
        });

        if (!page) {
            return NextResponse.json({ status: false, message: '找不到頁面' }, { status: 404 });
        }

        // 轉為普通物件以利操作
        const pageData = JSON.parse(JSON.stringify(page));

        // 2. 如果是 GRUP 模式，處理產品格式
        if (pageData.mode === "GRUP" && pageData.products) {
            
            // 根據你的需求，將 products 陣列重新映射
            // 這裡我們會遍歷每一個 ProductItem，並根據 productIds 去撈取詳細資料
            const formattedProducts = await Promise.all(
                pageData.products.map(async (item: any) => {
                    
                    // 這裡假設你要根據 ID 陣列去撈取具體的產品
                    // 如果你只需要回傳你指定的格式： { [refCode]: [productIds] }
                    const result: Record<string, string[]> = {};
                    
                    // 這裡的 refCode 就是你的團型代碼 (例如: DTS25-SPK166)
                    // productIds 就是後台人員決定的產品清單
                    result[item.refCode || 'default'] = item.productIds || [];
                    
                    return result;
                })
            );

            // 替換原本的 products 內容
            pageData.products = formattedProducts;
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