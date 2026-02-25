import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { getCardsByModule } from './actions/card';
import { CardDataTable } from './components/CardDataTable';

// 引入 Server Actions 與 Components
// 注意：根據你的目錄結構，這裡假設 actions 和 components 位於 modules 資料夾下

// ✅ Next.js 15 定義：params 是一個 Promise
interface PageProps {
    params: Promise<{
        id: string; // 這裡是動態路由的 [id]，代表 moduleId
    }>;
}

export default async function ModuleCardsPage(props: PageProps) {
    const params = await props.params;
    const moduleId = params.id;

    const moduleData = await db.module.findUnique({
        where: { id: moduleId },
        select: { id: true, title: true },
    });

    if (!moduleData) {
        notFound();
    }

    const { success, data } = await getCardsByModule(moduleId);
    const cards = success && data ? data : [];

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/modules" title="返回模組列表">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>

                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {moduleData.title}
                        <span className="text-muted-foreground font-normal text-lg">
                            / 卡片管理
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        在此管理「{moduleData.title}
                        」模組下的所有卡片內容、連結與排序。
                    </p>
                </div>
            </div>

            {/* 卡片資料表格 */}
            <div>
                <CardDataTable
                    data={cards}
                    moduleTitle={moduleData.title}
                    moduleId={moduleId}
                />
            </div>
        </div>
    );
}
