import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: '缺少圖片 URL' },
                { status: 400 }
            );
        }

        // ✅ 刪除 Blob 檔案
        await del(url);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('❌ 刪除 Blob 失敗:', err);
        return NextResponse.json(
            { error: err?.message ?? '刪除失敗' },
            { status: 500 }
        );
    }
}
