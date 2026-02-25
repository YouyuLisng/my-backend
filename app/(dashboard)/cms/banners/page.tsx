// app/admin/banners/page.tsx
import { getBanners } from "./actions/banner";
import { BannerDataTable } from "./components/BannerTable";

export default async function BannerPage() {
    const { success, data } = await getBanners();
    const banners = success && data ? data : [];

    return (
        <div className="container mx-auto py-8">
            <BannerDataTable data={banners} />
        </div>
    );
}