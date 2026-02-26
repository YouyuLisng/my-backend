import { prisma } from '@/lib/prisma';
import NewPageForm from '../components/NewPageForm';
import { notFound } from 'next/navigation';

// 將 params 的型別定義為 Promise
export default async function EditPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    // 1. 必須先 await params 才能解構出 id
    const { id } = await params;

    // 2. 使用 await 後得到的 id 進行查詢
    const page = await prisma.newPage.findUnique({
        where: { id: id }
    });

    // 3. 如果找不到頁面，回傳 404
    if (!page) {
        notFound();
    }

    return (
        <div className="p-6">
            <NewPageForm initialData={page} />
        </div>
    );
}