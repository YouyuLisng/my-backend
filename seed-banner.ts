import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 定義 Banner 資料介面
interface BannerSeedData {
  imageUrl: string;
  title: string;
  subtitle?: string | null;
  linkText?: string | null;
  linkUrl?: string | null;
  order: number;
  isActive: boolean;
  gaEvent?: string | null;
  gaEventName?: string | null;
  gaCategory?: string | null;
  gaLabel?: string | null;
}

async function main() {
  console.log('🚀 開始初始化橫幅資料 (Banner)...');

  // 2. 清除舊有 Banner 資料 (避免重複)
  await prisma.banner.deleteMany({});
  console.log('🗑️  已清空舊有 Banner 資料');

  // 3. 定義原始資料 (imageUrl 已清空)
  const bannerData: BannerSeedData[] = [
    {
      imageUrl: "",
      title: "日本賞花季",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/event/flower/?&utm_source=website&utm_medium=display&utm_campaign=flower_page_20260126&utm_content=30-50f_abc",
      order: 0,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_sakuraevent_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_all_flower|promotion_sakuraevent_v1|always_on"
    },
    {
      imageUrl: "",
      title: "立山黑部專頁",
      subtitle: null,
      linkText: null,
      linkUrl: "https://travel.dtsgroup.com.tw/subject/ngo_tateyama/?&utm_source=website&utm_medium=display&utm_campaign=tateyanma_page_20251113&utm_content=30-50f_abc&_ga=2.256415939.935204629.1770012025-774380032.1712713880",
      order: 1,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_product_tateyama_v2",
      gaCategory: "home_promotion",
      gaLabel: "2026_nagoya_tateyama|product_tateyama_v2|20260203-20260330"
    },
    {
      imageUrl: "",
      title: "東京紫藤",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/group/DTS26-TYO08?&utm_source=website&utm_medium=display&utm_campaign=tokyo_product_20260311&utm_content=30-50f_abc",
      order: 2,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_tokyoproduct_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_tokyo_product|promotion_tokyoproduct_v1|20260224-20260320"
    },
    {
      imageUrl: "",
      title: "DTS26-OKA13",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/group/DTS26-OKA13?&utm_source=website&utm_medium=display&utm_campaign=okinawa_product_20260224&utm_content=30-50f_abc?_ga=2.125786890.1278603067.1771914596-515173460.1771914596",
      order: 3,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_okinawaproduct_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_okinawa_product|promotion_okinawaproduct_v1|20260224-20260320"
    },
    {
      imageUrl: "",
      title: "春北海道",
      subtitle: null,
      linkText: null,
      linkUrl: "https://travel.dtsgroup.com.tw/subject/hokkaido_spring/?&utm_source=website&utm_medium=display&utm_campaign=hokkaido_page_20260211&utm_content=30-50f_abc",
      order: 4,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_hokkaidospringevent_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_hokkaido_springevent|promotion_hokkaidospringevent_v1|20260204-20260330"
    },
    {
      imageUrl: "",
      title: "關西藍色海",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/group/DTS26-OSA27?&utm_source=website&utm_medium=display&utm_campaign=osaka_product_20260224&utm_content=30-50f_abc",
      order: 5,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_osakaproduct_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_osaka_product|promotion_osakaproduct_v1|20260224-20260320"
    },
    {
      imageUrl: "",
      title: "富士賽車",
      subtitle: null,
      linkText: null,
      linkUrl: "https://travel.dtsgroup.com.tw/event/FUJISPEEDWAY/?utm_source=website&utm_medium=display&utm_campaign=racing_page_20241113&utm_content=30-50f_abc",
      order: 6,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_fujispeedway_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_tokyo_fujispeedway|promotion_fujispeedway_v1|always_on"
    },
    {
      imageUrl: "",
      title: "清倉頁",
      subtitle: null,
      linkText: null,
      linkUrl: "/campaigns/clearancesale",
      order: 7,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_clearancesale_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_jp_clearancesale|promotion_clearancesale_v1|always_on"
    },
    {
      imageUrl: "",
      title: "沖繩租車",
      subtitle: null,
      linkText: null,
      linkUrl: "https://car.gogojp.com.tw/?&utm_source=website&utm_medium=display&utm_campaign=dtscar_page_20250620&utm_content=30-50f_abc&_ga=2.88257950.461110410.1765767206-774380032.1712713880",
      order: 8,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_okinawacarhire_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_okinawacarhire|promotion_okinawacarhire_v1|always_on"
    }
  ];

  // 4. 執行大量寫入
  await prisma.banner.createMany({
    data: bannerData
  });

  console.log(`✅ Banner 資料匯入成功！共匯入 ${bannerData.length} 筆（圖片欄位已清空）。`);
}

main()
  .catch((e) => {
    console.error('❌ Banner Seed 執行失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });