import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        
        if (!url) {
            return NextResponse.json({ error: '缺少 URL' }, { status: 400 });
        }

        // 🔍 偵錯用：確保環境變數有抓到 (部署後請移除此行)
        console.log('Using Token:', process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) + '...');

        await del(url, {
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('❌ Vercel Blob 刪除出錯:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}