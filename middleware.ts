import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 允許跨域來源
const ALLOWED_ORIGINS = [
    'https://www.dtsgroup.com.tw',
    'http://localhost:3000',
];

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin');
    
    // 檢查 Origin 是否在允許清單中
    const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

    // 處理預檢請求 (Preflight Request - OPTIONS)
    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 204 });
        
        if (isAllowedOrigin) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            response.headers.set('Access-Control-Allow-Credentials', 'true');
            response.headers.set('Access-Control-Max-Age', '86400'); // 快取預檢結果 24 小時
        }
        
        return response;
    }

    // 處理實際請求 (Actual Request)
    const response = NextResponse.next();

    if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
}

// 設定 Middleware 只作用於 API 路徑
export const config = {
    matcher: '/api/:path*',
};