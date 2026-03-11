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

  // 3. 定義原始資料 (ID 由資料庫自動產生，不從 JSON 帶入)
  const bannerData: BannerSeedData[] = [
    {
      imageUrl: "",
      title: "春節大清倉",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/event/chinesenewyearsale/?&utm_source=website&utm_medium=display&utm_campaign=sale_page_20251212&utm_content=30-50f_abc",
      order: 0,
      isActive: false,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_redcelebrate_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_all_chinesenewyearsale|promotion_redcelebrate_v1|20260120-20260209"
    },
    {
      imageUrl: "",
      title: "合掌村點燈",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/event/GasshoZukuri/?",
      order: 1,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_gasshozukuri_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_nagoya_gasshozukuri|promotion_gasshozukuri_v1|20260120-20260209"
    },
    {
      imageUrl: "",
      title: "冬北海道",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/subject/hokkaido_winter/",
      order: 2,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_hokkaidowinterevent_v1",
      gaCategory: "home_promotion",
      gaLabel: "2026_hokkaido_winterevent|promotion_hokkaidowinterevent_v1|20260120-20260131"
    },
    {
      imageUrl: "",
      title: "榮遊東京",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/group/DTS26-TYO07",
      order: 3,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_tokyoproduct_v1",
      gaCategory: "home_product",
      gaLabel: "2026_tokyo_product|promotion_tokyoproduct_v1|20260120-20260215"
    },
    {
      imageUrl: "",
      title: "沖繩宮古島那霸",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/group/DTS26-OKA07",
      order: 4,
      isActive: true,
      gaEvent: "banner_click",
      gaEventName: "banner_click_promotion_okinawaproduct_v1",
      gaCategory: "home_product",
      gaLabel: "2026_okinawa_product|promotion_okinawaproduct_v1|20260120-20260215"
    },
    {
      imageUrl: "",
      title: "富士賽車",
      subtitle: null,
      linkText: null,
      linkUrl: "https://www.dtsgroup.com.tw/event/FUJISPEEDWAY/?&utm_source=website&utm_medium=display&utm_campaign=racing_page_20241113&utm_content=30-50f_abc",
      order: 5,
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
      order: 6,
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
      order: 7,
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

  console.log(`✅ Banner 資料匯入成功！共匯入 ${bannerData.length} 筆。`);
}

main()
  .catch((e) => {
    console.error('❌ Banner Seed 執行失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });