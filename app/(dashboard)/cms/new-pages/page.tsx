// app/(dashboard)/cms/new-pages/page.tsx

import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NewPageDataTable } from './components/NewPageDataTable'; // 請確保路徑正確
import { LayoutGrid } from 'lucide-react';
import { Role } from '@prisma/client';

export default async function NewPagesPage() {
    // 1. 取得 Session 使用者資訊與權限
    const session = await auth();
    const userRole = (session?.user?.role as Role) || 'PRODUCT';

    // 2. 從資料庫讀取所有活動頁面
    const pages = await prisma.newPage.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* 標題區塊 */}
            <div className="space-y-1 border-b pb-6">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                    <LayoutGrid className="text-blue-600 size-8" />
                    活動頁面管理
                </h1>
                <p className="text-slate-500 font-medium italic">
                    精準控管全站行銷活動、產品分組配置與 SEO 追蹤
                </p>
            </div>

            {/* 3. 引入 Table 組件並傳入資料與角色 */}
            <div className="animate-in slide-in-from-bottom-4 duration-500">
                <NewPageDataTable 
                    data={pages} 
                    userRole={userRole} 
                />
            </div>
        </div>
    );
}