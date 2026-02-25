import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json(); // 接收來自前端的 { qmgrupcd } 或 { qmgrupcds }
        
        const payload = {
            qcoun: "JP",      // 預設值
            pageNumber: 1,    // 預設值
            pageSize: 50,     // 擴大單次查詢數量
            ...body           // 將 qmgrupcd 或 qmgrupcds 覆蓋進去
        };

        const response = await fetch('https://bi.dtsgroup.com.tw/api/product/GroupList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': '2l*xvFhSOe7@zC46',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Proxy Error' }, { status: 500 });
    }
}