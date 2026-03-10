// app/(dashboard)/cms/new-pages/page.tsx
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { NewPageDataTable } from './components/NewPageDataTable';
import { Package, UserCog, ShieldCheck } from 'lucide-react';
import { Role } from '@prisma/client';
import { Badge } from '@/components/ui/badge';

export default async function NewPagesPage() {
    const session = await auth();
    const userRole = (session?.user?.role as Role) || Role.PRODUCT;

    const pages = await prisma.newPage.findMany({
        orderBy: {
            createdAt: 'desc',
        },
    });

    // 權限標籤顯示邏輯
    const getRoleBadge = (role: Role) => {
        switch (role) {
            case Role.DEV:
                return (
                    <Badge
                        variant="secondary"
                        className="bg-purple-50 text-purple-600 border-purple-200 gap-1 h-6"
                    >
                        <ShieldCheck size={12} /> 開發者
                    </Badge>
                );
            case Role.PLANNING:
                return (
                    <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-600 border-blue-200 gap-1 h-6"
                    >
                        <UserCog size={12} /> 企劃部
                    </Badge>
                );
            case Role.PRODUCT:
                return (
                    <Badge
                        variant="secondary"
                        className="bg-amber-50 text-amber-600 border-amber-200 gap-1 h-6"
                    >
                        <Package size={12} /> 產品部
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">
                活動頁管理
            </h1>
            <NewPageDataTable data={pages} userRole={userRole} />
        </div>
    );
}
