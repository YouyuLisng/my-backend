// app/(dashboard)/cms/new-pages/new/page.tsx
import NewPageForm from "../components/NewPageForm";
import { auth } from '@/auth';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function CreatePage() {
    // 1. 取得 Session 使用者資訊與權限
    const session = await auth();
    
    // 安全檢查：若未登入則導回登入頁
    if (!session?.user) {
        redirect('/login');
    }

    const userRole = (session?.user?.role as Role) || Role.PRODUCT;

    // 2. 傳遞權限給 Client Component 表單
    return <NewPageForm userRole={userRole} />;
}