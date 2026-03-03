import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 定義 Ad 資料介面
interface AdSeedData {
    title: string;
    image: string;
    href: string;
    isActive: boolean;
    sortOrder: number;
    gaEvent?: string | null;
    gaEventName?: string | null;
    gaCategory?: string | null;
    gaLabel?: string | null;
}

async function main() {
    console.log('🚀 開始初始化廣告資料 (Ad)...');

    // 2. 清除舊有 Ad 資料 (ID 會由資料庫重新產生)
    await prisma.ad.deleteMany({});
    console.log('🗑️  已清空舊有 Ad 資料');

    // 3. 準備原始資料 (移除硬編碼 ID，由資料庫自動產生)
    const adData: AdSeedData[] = [
        {
            title: "全包式滑雪行程",
            image: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/7eukjyE-TMLADNo0p13zhecURkkj855uzKSqCj.jpeg",
            href: "https://www.dtsgroup.com.tw/season/ski/?",
            isActive: true,
            sortOrder: 0,
            gaEvent: "ga-click",
            gaEventName: null,
            gaCategory: null,
            gaLabel: null
        },
        {
            title: "九州海景鐵道旅",
            image: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/TfwxKRO-MchchIBXVsfN8UlvG8hh3th2pUseOB.jpeg",
            href: "/group/DTS26-FUK02&utm_source=website&utm_medium=display&utm_campaign=kyushu_product_20260112&utm_content=30-50f_abc",
            isActive: true,
            sortOrder: 1,
            gaEvent: "ga-click",
            gaEventName: null,
            gaCategory: null,
            gaLabel: null
        },
        {
            title: "超萌企鵝遊行",
            image: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/9jAnVwz-MaEzYM3Z9UQH1x3k2OuCOeCR1i1oVM.jpeg",
            href: "/group/DTS25-SPK151&utm_source=website&utm_medium=display&utm_campaign=hokkaido_product_20260112&utm_content=30-50f_abc",
            isActive: true,
            sortOrder: 2,
            gaEvent: "ga-click",
            gaEventName: null,
            gaCategory: null,
            gaLabel: null
        },
        {
            title: "北海道三大蟹",
            image: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/ncaB0LN-QJErTiLdJcOXC00wUOnntUZLu0JfF4.jpeg",
            href: "/group/DTS26-SPK041&utm_source=website&utm_medium=display&utm_campaign=hokkaido_product_20260112&utm_content=30-50f_abc",
            isActive: true,
            sortOrder: 3,
            gaEvent: "ga-click",
            gaEventName: null,
            gaCategory: null,
            gaLabel: null
        }
    ];

    // 4. 執行大量寫入
    await prisma.ad.createMany({
        data: adData
    });

    console.log(`✅ Ad 資料匯入成功！共匯入 ${adData.length} 筆。`);
}

main()
    .catch((e) => {
        console.error('❌ Ad Seed 執行失敗:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });