import { getHotKeywords } from './actions/hotKeyword';
import { HotKeywordDataTable } from './components/HotKeywordTable';

export default async function HotKeywordsPage() {
    const { success, data } = await getHotKeywords();
    const hotKeywords = success && data ? data : [];

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">熱門關鍵字管理</h1>
            <HotKeywordDataTable data={hotKeywords} />
        </div>
    );
}
