import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received request body:', body); // Debug log
        const payload = {
            qcoun: "JP",
            pageNumber: 1,
            pageSize: 50,
            ...body
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