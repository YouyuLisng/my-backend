import { prisma } from '@/lib/prisma';
import NewPageForm from '../components/NewPageForm';
import { notFound } from 'next/navigation';

export default async function EditPage({ params }: { params: { id: string } }) {
    const page = await prisma.newPage.findUnique({
        where: { id: params.id }
    });

    if (!page) notFound();

    return <NewPageForm initialData={page} />;
}