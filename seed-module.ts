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

  // 3. 準備原始資料 (移除原始 ID，由資料庫產生)
  const moduleData: ModuleSeedData[] = [
    {
      title: "大榮經典跟團行程",
      icon: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/mVkjBaN-QHOkbamwDHm79t19TiYADSr5k1lLJ9.svg%2Bxml",
      description: "精選高評價人氣路線，旅遊首選零踩雷",
      isActive: true,
      cards: [
        { title: "震撼立山雪壁奇景🏔️神之鄉上高地、合掌村、兼六園、三溫泉饗宴 6 日", description: "限定𝟲𝟬天的震撼風景", image: "", href: "/group/DTS26-NGO15", price: "36900", tags: [], isActive: true, sortOrder: 0, gaEvent: "banner_click", gaEventName: "banner_click_product_tateyama_v1", gaCategory: "home_product", gaLabel: "2026_nagoya_tateyama|product_tateyama_v1|20260120-20260228" },
        { title: "期間限定！🌸北海道星形粉色大地．浪漫櫻花隧道五日", description: "入住三名泉飯店", image: "", href: "/group/DTS26-SPK034", price: "42900", tags: [], isActive: true, sortOrder: 1, gaEvent: "banner_click", gaEventName: "banner_click_product_hokkaidoproduct_v1", gaCategory: "home_product", gaLabel: "2026_hokkaido_product|product_hokkaidoproduct_v1|20260120-20260228" },
        { title: "慢拍假期|宮古島&沖繩跳島行~竜宮城．熱帶植物園．美國村五日", description: "星宇航空開通直飛宮古島", image: "", href: "/group/DTS26-OKA07", price: "43900", tags: [], isActive: true, sortOrder: 2, gaEvent: "banner_click", gaEventName: "banner_click_product_okinawaproduct_v1", gaCategory: "home_product", gaLabel: "2026_okinawa_product|product_okinawaproduct_v1|20260120-20260228" },
        { title: "東京賞櫻趣～千波湖畔．海上鳥居．偕樂園．赤城南面千本櫻．福岡堰櫻花公園五日", description: "天天賞櫻的浪漫假期", image: "", href: "/group/DTS26-TYO06", price: "31900", tags: [], isActive: true, sortOrder: 3, gaEvent: "banner_click", gaEventName: "banner_click_product_tokyoproduct_v1", gaCategory: "home_product", gaLabel: "2026_tokyo_product|product_tokyoproduct_v1|20260120-20260228" }
      ]
    },
    {
      title: "主題旅遊",
      icon: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/qKyWJL5-VsX1pGEBFW1WUyPRDHVXxxhSviWP0v.svg%2Bxml",
      description: "玩出不同的風格日本",
      isActive: true,
      cards: [
        { title: "大榮國際滑雪學校", description: null, image: "", href: "https://snow.dtsgroup.com.tw/", price: null, tags: [], isActive: true, sortOrder: 0, gaEvent: "ga-click" },
        { title: "世界遺產", description: null, image: "", href: "https://www.dtsgroup.com.tw/世界遺產", price: null, tags: [], isActive: true, sortOrder: 1, gaEvent: "ga-click" },
        { title: "旅南九州", description: null, image: "", href: "https://www.dtsgroup.com.tw/南九州", price: null, tags: [], isActive: true, sortOrder: 2, gaEvent: "ga-click" },
        { title: "日本溫泉魅力", description: null, image: "", href: "https://www.dtsgroup.com.tw/名湯物語", price: null, tags: [], isActive: true, sortOrder: 3, gaEvent: "ga-click" },
        { title: "沖繩高爾夫", description: null, image: "", href: "https://www.dtsgroup.com.tw/沖繩高爾夫", price: null, tags: [], isActive: true, sortOrder: 4, gaEvent: "ga-click" },
        { title: "日本樂園", description: null, image: "", href: "https://www.dtsgroup.com.tw/subject/paradise_2020/", price: null, tags: [], isActive: true, sortOrder: 5, gaEvent: "ga-click" }
      ]
    },
    {
      title: "企業旅遊熱門團型",
      icon: "https://dcxn8ladrevqu64e.public.blob.vercel-storage.com/IhmREqa-cgdOlvc4pFeKD7Gf87fuMe1GdMpFQ6.svg%2Bxml",
      description: "員工獎勵旅遊、客製化家族旅遊首選",
      isActive: true,
      cards: [
        { title: "北海道泡湯趣~全程無自理餐.百萬夜景.尼克斯海洋公園.三大蟹放題.三溫泉五日(函/旭)", description: "函館/旭川機場進出，不走回頭路 省時省力", image: "", href: "/group/DTS25-SPK142", price: "34900", tags: ["無自理餐", "人氣小丑漢堡套餐", "三大蟹放題", "三晚溫泉飯店"], isActive: true, sortOrder: 0, gaEvent: "ga-click" },
        { title: "樂遊沖繩~海洋博水族館.玉泉洞太鼓秀.半潛艇.IIAS豐崎購物.兩晚海濱飯店四日", description: "入住海邊飯店 享受海景咖啡廳", image: "", href: "/group/DTS26-OKA05", price: "17888", tags: ["四日遊"], isActive: true, sortOrder: 1, gaEvent: "ga-click" },
        { title: "九州海豚共舞～神話高千穗峽、高森田樂圍爐、上色見熊野神社五日", description: "鮑魚海鮮迎賓料理/天草松島/阿蘇溫泉", image: "", href: "/group/DTS26-FUK03", price: "26900", tags: ["溫泉", "OUTLETS"], isActive: true, sortOrder: 2, gaEvent: "ga-click" },
        { title: "北陸彥根美櫻、兼六園、足羽川並木櫻、高山小京都、童話合掌村五日", description: "百選賞櫻景點巡禮/兩晚溫泉飯店", image: "", href: "/group/DTS26-NGO18", price: "35900", tags: ["早去午回"], isActive: true, sortOrder: 3, gaEvent: "ga-click" },
        { title: "犒賞首選！秘境四國慢旅：小豆島魔女飛行、天空鞦韆絕景、大步危遊船、雙溫泉五日", description: "登上「天空鞦韆」俯瞰湛藍大海，在小豆島拿起魔女掃帚拍下飛天美照", image: "", href: "/group/DTS26-TAK01", price: "38900", tags: ["復古礦山列車體驗", "溫泉飯店兩晚連住", "峽谷遊船"], isActive: true, sortOrder: 4, gaEvent: "ga-click" }
      ]
    },
    {
      title: "其他區塊",
      icon: "",
      description: null,
      isActive: true,
      cards: [
        { title: "世界這麼大，到處去看看", description: null, image: "", href: "https://dtsgroup.agenttour.com.tw/BBC_PageDesign/D000_CustomerDesign/dtsgroup/DTS.htm?", price: null, tags: [], isActive: true, sortOrder: 0, gaEvent: "ga-click" },
        { title: "日本跟團，從高雄出國", description: null, image: "", href: "https://khh.dtsgroup.com.tw/", price: null, tags: [], isActive: true, sortOrder: 1, gaEvent: "ga-click" }
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