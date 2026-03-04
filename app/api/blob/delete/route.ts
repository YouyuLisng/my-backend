import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        if (!url) {
            return NextResponse.json({ error: '缺少 URL' }, { status: 400 });
        }

        await del(url);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
