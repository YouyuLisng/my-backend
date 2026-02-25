// app/admin/faq/page.tsx
import { getFaqs } from "./actions/faq";
import { FaqDataTable } from "./components/FaqDataTable";

export default async function FaqPage() {
    const { success, data } = await getFaqs();
    const faqs = success && data ? data : [];

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold tracking-tight">常見問題管理 (FAQ)</h1>
            </div>
            <FaqDataTable data={faqs} />
        </div>
    );
}