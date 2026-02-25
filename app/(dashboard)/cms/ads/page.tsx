
import { getAds } from "./actions/ad";
import { AdTable } from "./components/AdTable";

export default async function AdPage() {
    const { success, data } = await getAds();
    const ads = success && data ? data : [];
    console.log("Ads Data:", ads);
    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold tracking-tight">廣告管理</h1>
            </div>
            <AdTable data={ads} />
        </div>
    );
}