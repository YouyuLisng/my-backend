import { prisma } from '@/lib/prisma';
import NewPageForm from '../components/NewPageForm';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { Role } from '@prisma/client';

export default async function EditPage({ 
    params 
}: { 
    params: Promise<{ id: string }> 
}) {
    const session = await auth();
    const userRole = (session?.user?.role as Role) || Role.PRODUCT;

    const { id } = await params;

    const page = await prisma.newPage.findUnique({
        where: { id: id }
    });

    if (!page) {
        notFound();
    }

    return (
        <div className="p-6 animate-in fade-in duration-500">
            {/* 5. 將 initialData 與 userRole 一併傳入 */}
            <NewPageForm 
                initialData={page} 
                userRole={userRole} 
            />
        </div>
    );
}