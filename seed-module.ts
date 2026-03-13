import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 定義資料結構介面
interface CardSeedData {
  title: string;
  description?: string | null;
  image: string;
  href: string;
  price?: string | null;
  tags: string[];
  isActive: boolean;
  sortOrder: number;
  gaEvent?: string | null;
  gaEventName?: string | null;
  gaCategory?: string | null;
  gaLabel?: string | null;
}

interface ModuleSeedData {
  title: string;
  icon?: string | null;
  description?: string | null;
  isActive: boolean;
  cards: CardSeedData[];
}

async function main() {
  console.log('🚀 開始初始化模組與卡片資料 (Module & Card)...');

  // 2. 清除舊有資料 (由於設定了 Cascade，刪除 Module 會自動刪除 Card)
  await prisma.module.deleteMany({});
  console.log('🗑️  已清空舊有模組與卡片資料');

  // 3. 準備原始資料 (根據 2026-03-13 最新 JSON 更新)
  const moduleData: ModuleSeedData[] = [
    {
      title: "大榮經典跟團行程",
      icon: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/mVkjBaN-QHOkbamwDHm79t19TiYADSr5k1lLJ9.svg%2Bxml",
      description: "精選高評價人氣路線，旅遊首選零踩雷",
      isActive: true,
      cards: [
        { title: "震撼立山雪壁奇景🏔️神之鄉上高地、合掌村、兼六園、三溫泉饗宴 6 日", description: "限定𝟲𝟬天的震撼風景", image: "", href: "/group/DTS26-NGO15", price: "36900", tags: [], isActive: true, sortOrder: 0, gaEvent: "banner_click", gaEventName: "banner_click_product_tateyama_v1", gaCategory: "home_product", gaLabel: "2026_nagoya_tateyama|product_tateyama_v1|20260120-20260228" },
        { title: "期間限定！🌸北海道星形粉色大地．浪漫櫻花隧道五日", description: "入住三名泉飯店", image: "", href: "https://www.dtsgroup.com.tw/group/DTS26-SPK034?&utm_source=website&utm_medium=display&utm_campaign=hokkaido_product_20260112&utm_content=30-50f_abc", price: "42900", tags: [], isActive: true, sortOrder: 1, gaEvent: "banner_click", gaEventName: "banner_click_product_hokkaidoproduct_v1", gaCategory: "home_product", gaLabel: "2026_hokkaido_product|product_hokkaidoproduct_v1|20260120-20260228" },
        { title: "來趣沖繩！巨大鯨鯊水族館．恐龍森林冒險．IIAS購物四日", description: "看巨大鯨鯊超震撼，享受最 Chill 的海島春日派對！", image: "", href: "https://www.dtsgroup.com.tw/group/DTS26-OKA14?&utm_source=website&utm_medium=display&utm_campaign=okinawa_product_20260226&utm_content=30-50f_abc", price: "23900", tags: [], isActive: true, sortOrder: 2, gaEvent: "banner_click", gaEventName: "banner_click_product_okinawaproduct_v1", gaCategory: "home_product", gaLabel: "2026_okinawa_product|product_okinawaproduct_v1|20260226-20260312" },
        { title: "東京玩翻天！保證入園迪士尼．御殿場Outlet．蟹腳大餐吃到飽五日", description: "除了保證玩翻迪士尼，更安排御殿場 Outlet 掃盪名牌", image: "", href: "https://www.dtsgroup.com.tw/group/DTS26-TYO10?&utm_source=website&utm_medium=display&utm_campaign=tokyo_product_20260226&utm_content=30-50f_abc", price: "33900", tags: [], isActive: true, sortOrder: 3, gaEvent: "banner_click", gaEventName: "banner_click_product_tokyoproduct_v1", gaCategory: "home_product", gaLabel: "2026_tokyo_product|product_tokyoproduct_v1|20260226-20260312" },
        { title: "漫遊海之京都！伊根舟屋散策．天橋立飛龍觀纜車．天空之城五日", description: "登上「天空之城」美譽的竹田城跡", image: "", href: "https://www.dtsgroup.com.tw/group/DTS25-OSA09?&utm_source=website&utm_medium=display&utm_campaign=osaka_product_20260226&utm_content=30-50f_abc", price: "36900", tags: [], isActive: true, sortOrder: 4, gaEvent: "banner_click", gaEventName: "banner_click_product_osakaproduct_v1", gaCategory: "home_product", gaLabel: "2026_osaka_product|product_osakaproduct_v1|20260226-20260312" },
        { title: "九州度假首選!黑川夢幻竹燈祭、湯布院小鎮、草莓吃到飽 5 日", description: "澎湃螃蟹涮涮鍋吃到飽", image: "", href: "/group/DTS26-FUK04", price: "30900", tags: [], isActive: true, sortOrder: 5, gaEvent: "banner_click", gaEventName: "banner_click_product_kyushuproduct_v1", gaCategory: "home_product", gaLabel: "2026_kyushu_product|product_kyushuproduct_v1|20260120-20260228" },
        { title: "🌊 解鎖北海道最北端！利尻、禮文雙島大冒險，這團真的太「鮮」了！", description: "親手體驗現採現吃採海膽體驗", image: "", href: "/group/DTS26-SPK035", price: "46900", tags: [], isActive: true, sortOrder: 6, gaEvent: "banner_click", gaEventName: "banner_click_product_hokkaidoproduct_v1", gaCategory: "home_product", gaLabel: "2026_hokkaido_product|product_hokkaidoproduct_v1|20260120-20260228" },
        { title: "關西我來啦！從古都漫步到環球影城，這團根本是「夢想清單」全包！", description: "想要京都的浪漫、又想要環球影城的刺激？", image: "", href: "/group/DTS26-OSA19", price: "37900", tags: [], isActive: true, sortOrder: 7, gaEvent: "banner_click", gaEventName: "banner_click_product_osakaproduct_v1", gaCategory: "home_product", gaLabel: "2026_osaka_product|product_osakaproduct_v1|20260120-20260228" },
        { title: "森林系輕健行|東北銀山溫泉、奧入瀨溪，美到想哭的六天！", description: "去摘現採水果、泡花卷名湯的舒壓行程！", image: "", href: "/group/DTS26-AOJ01", price: "38900", tags: [], isActive: true, sortOrder: 8, gaEvent: "banner_click", gaEventName: "banner_click_product_tohokuproduct_v1", gaCategory: "home_product", gaLabel: "2026_tohoku_product|product_tohokuproduct_v1|20260120-20260228" },
        { title: "東北櫻木花道！銀山溫泉浪漫散策、白石川一目千本櫻、花見小火車、三名湯五日", description: "欣賞千株櫻花與遠方雪山共舞的絕景", image: "", href: "/group/DTS26-SDJ003", price: "38900", tags: [], isActive: true, sortOrder: 9, gaEvent: "banner_click", gaEventName: "banner_click_product_tohokuproduct_v2", gaCategory: "home_product", gaLabel: "2026_tohoku_product|product_tohokuproduct_v2|20260123-20260228" }
      ]
    },
    {
      title: "主題旅遊",
      icon: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/qKyWJL5-VsX1pGEBFW1WUyPRDHVXxxhSviWP0v.svg%2Bxml",
      description: "玩出不同的風格日本",
      isActive: true,
      cards: [
        { title: "大榮國際滑雪學校", description: null, image: "", href: "https://snow.dtsgroup.com.tw/index.html?&utm_source=website&utm_medium=display&utm_campaign=snow_page_20260114&utm_content=30-50f_abc", price: null, tags: [], isActive: true, sortOrder: 0, gaEvent: "banner_click", gaEventName: "banner_click_promotion_daieisnowschool_v1", gaCategory: "home_promotion", gaLabel: "2026_daieisnowschool_product|promotion_daieisnowschool_v1|always_on" },
        { title: "富士賽車體驗營", description: null, image: "", href: "https://travel.dtsgroup.com.tw/event/FUJISPEEDWAY/?utm_source=website&utm_medium=display&utm_campaign=racing_page_20241113&utm_content=30-50f_abc", price: null, tags: [], isActive: true, sortOrder: 1, gaEvent: "ga-click", gaEventName: "banner_click_promotion_fujispeedway_v2", gaCategory: "home_promotion", gaLabel: "2026_tokyo_fujispeedway|promotion_fujispeedway_v2|always_on" },
        { title: "世界遺產", description: null, image: "", href: "https://www.dtsgroup.com.tw/%E4%B8%96%E7%95%8C%E9%81%BA%E7%94%A2", price: null, tags: [], isActive: true, sortOrder: 2, gaEvent: "banner_click", gaEventName: "banner_click_promotion_worldheritage_v1", gaCategory: "home_promotion", gaLabel: "2026_ worldheritage_product|promotion_worldheritage_v1|always_on" },
        { title: "日本溫泉魅力", description: null, image: "", href: "https://www.dtsgroup.com.tw/%E5%90%8D%E6%B9%AF%E7%89%A9%E8%AA%9E", price: null, tags: [], isActive: true, sortOrder: 3, gaEvent: "banner_click", gaEventName: "banner_click_promotion_hotspring_v1", gaCategory: "home_promotion", gaLabel: "2026_ hotspring_product|promotion_hotspring_v1|always_on" },
        { title: "沖繩高爾夫", description: null, image: "", href: "https://travel.dtsgroup.com.tw/%E6%B2%96%E7%B9%A9%E9%AB%98%E7%88%BE%E5%A4%AB", price: null, tags: [], isActive: true, sortOrder: 4, gaEvent: "banner_click", gaEventName: "banner_click_promotion_okinawagolf_v1", gaCategory: "home_promotion", gaLabel: "2026_ okinawagolf_product|promotion_okinawagolf_v1|always_on" },
        { title: "旅南九州", description: null, image: "", href: "https://www.dtsgroup.com.tw/%E5%8D%97%E4%B9%9D%E5%B7%9E", price: null, tags: [], isActive: true, sortOrder: 5, gaEvent: "banner_click", gaEventName: "banner_click_promotion_southkyushu_v1", gaCategory: "home_promotion", gaLabel: "home_promotion|promotion_southkyushu_v1|always_on" },
        { title: "日本樂園", description: null, image: "", href: "https://www.dtsgroup.com.tw/subject/paradise_2020/", price: null, tags: [], isActive: true, sortOrder: 6, gaEvent: "banner_click", gaEventName: "banner_click_promotion_themepark_v1", gaCategory: "home_promotion", gaLabel: "2026_ themepark_product|promotion_themepark_v1|always_on" }
      ]
    },
    {
      title: "企業旅遊熱門團型",
      icon: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/IhmREqa-cgdOlvc4pFeKD7Gf87fuMe1GdMpFQ6.svg%2Bxml",
      description: "員工獎勵旅遊、客製化家族旅遊首選",
      isActive: true,
      cards: [
        { title: "慢旅北海道：留壽都森之度假飯店、尼克斯海洋、拼布花田、螃蟹極致饗宴", description: "在五彩繽紛的花田間尋找北國最美風景", image: "", href: "https://dts-main.vercel.app/group/DTS26-SPK036?&utm_source=website&utm_medium=display&utm_campaign=hokkaido_page_20260226&utm_content=30-50f_abc", price: "38900", tags: ["北海道最大渡假飯店", "富良野花毯", "直飛千歲機場", "精選螃蟹盛宴"], isActive: true, sortOrder: 0, gaEvent: "banner_click", gaEventName: "banner_click_promotion_hokkaido_v2", gaCategory: "home_promotion", gaLabel: "2026_ hokkaido_product|promotion_hokkaido_v2|20260226-20260301" },
        { title: "樂遊沖繩~海洋博水族館.玉泉洞太鼓秀.半潛艇.IIAS豐崎購物.兩晚海濱飯店四日", description: "入住海邊飯店 享受海景咖啡廳", image: "", href: "/group/DTS26-OKA05", price: "17888", tags: ["四日遊"], isActive: true, sortOrder: 1, gaEvent: "banner_click", gaEventName: "banner_click_promotion_okinawa_v1", gaCategory: "home_promotion", gaLabel: "2026_ okinawa_product|promotion_okinawa_v1|20260123-20260228" },
        { title: "九州海豚共舞～神話高千穗峽、高森田樂圍爐、上色見熊野神社五日", description: "鮑魚海鮮迎賓料理/天草松島/阿蘇溫泉", image: "", href: "/group/DTS26-FUK03", price: "26900", tags: ["溫泉", "OUTLETS"], isActive: true, sortOrder: 2, gaEvent: "banner_click", gaEventName: "banner_click_promotion_kyushu_v1", gaCategory: "home_promotion", gaLabel: "2026_ kyushu_product|promotion_kyushu_v1|20260123-20260228" },
        { title: "北陸彥根美櫻、兼六園、足羽川並木櫻、高山小京都、童話合掌村五日", description: "百選賞櫻景點巡禮/兩晚溫泉飯店", image: "", href: "/group/DTS26-NGO18", price: "35900", tags: ["早去午回"], isActive: true, sortOrder: 3, gaEvent: "banner_click", gaEventName: "banner_click_promotion_nagoya_v1", gaCategory: "home_promotion", gaLabel: "2026_ nagoya_product|promotion_nagoya_v1|20260123-20260228" },
        { title: "犒賞首選！秘境四國慢旅：小豆島魔女飛行、天空鞦韆絕景、大步危遊船、雙溫泉五日", description: "登上「天空鞦韆」俯瞰湛藍大海", image: "", href: "/group/DTS26-TAK01", price: "38900", tags: ["復古礦山列車體驗", "溫泉飯店兩晚連住", "峽谷遊船"], isActive: true, sortOrder: 4, gaEvent: "banner_click", gaEventName: "banner_click_promotion_shikoku_v1", gaCategory: "home_promotion", gaLabel: "2026_ shikoku_product|promotion_shikoku_v1|20260123-20260228" }
      ]
    },
    {
      title: "其他區塊",
      icon: "",
      description: null,
      isActive: true,
      cards: [
        { title: "世界這麼大，到處去看看", description: null, image: "", href: "https://dtsgroup.agenttour.com.tw/BBC_PageDesign/D000_CustomerDesign/dtsgroup/DTS.htm?&utm_source=website&utm_medium=display&utm_campaign=agenttour_page_20260112&utm_content=30-50f_abc", price: null, tags: [], isActive: true, sortOrder: 1, gaEvent: "banner_click", gaEventName: "banner_click_content_shikoku_v1", gaCategory: "home_content", gaLabel: "2026_agenttour_bbc|content_shikoku_v1|always_on" },
        { title: "高雄出發", description: null, image: "", href: "https://khh.dtsgroup.com.tw/", price: null, tags: [], isActive: true, sortOrder: 0, gaEvent: "banner_click", gaEventName: "banner_click_content_khhdeparture_v1", gaCategory: "home_content", gaLabel: "2026_khh_departure|content_khhdeparture_v1|always_on" }
      ]
    }
  ];

  // 4. 執行匯入 (使用巢狀寫入)
  for (const mod of moduleData) {
    await prisma.module.create({
      data: {
        title: mod.title,
        icon: mod.icon || null,
        description: mod.description || null,
        isActive: mod.isActive,
        cards: {
          create: mod.cards.map(card => ({
            title: card.title,
            description: card.description || null,
            image: card.image,
            href: card.href,
            price: card.price || null,
            tags: card.tags,
            isActive: card.isActive,
            sortOrder: card.sortOrder,
            gaEvent: card.gaEvent || "ga-click",
            gaEventName: card.gaEventName || null,
            gaCategory: card.gaCategory || null,
            gaLabel: card.gaLabel || null,
          }))
        }
      }
    });
  }

  console.log(`✅ 模組與卡片資料匯入成功！共匯入 ${moduleData.length} 個模組。`);
}

main()
  .catch((e) => {
    console.error('❌ Module Seed 執行失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });