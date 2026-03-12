import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 定義資料介面
interface HotKeywordSeedData {
    title: string;
    linkUrl?: string | null;
    order: number;
    isActive: boolean;
    gaEvent?: string | null;
    gaEventName?: string | null;
    gaCategory?: string | null;
    gaLabel?: string | null;
}

async function main() {
    console.log('🚀 開始初始化熱門關鍵字資料 (HotKeyword)...');

    // 2. 清除舊有資料 (避免重複匯入)
    await prisma.hotKeyword.deleteMany({});
    console.log('🗑️  已清空舊有 HotKeyword 資料');

    // 3. 準備最新原始資料 (根據最新 JSON 更新)
    const rawData = [
        {
            title: "環球影城",
            linkUrl: "/search?keyword=環球影城",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_usj_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_amanohashidate|navigation_usj_v1|always_on"
        },
        {
            title: "東京迪士尼",
            linkUrl: "/search?keyword=迪士尼",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_disney_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_disney|navigation_disney_v1|always_on"
        },
        {
            title: "暑假",
            linkUrl: "/search?keyword=暑假",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_summer_vacation_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_summer vacation|navigation_summer vacation_v1|always_on"
        },
        {
            title: "關西天橋立",
            linkUrl: "/search?keyword=天橋立",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_amanohashidate_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_amanohashidate|navigation_amanohashidate_v1|always_on"
        },
        {
            title: "九州湯布院",
            linkUrl: "/search?keyword=湯布院",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_yufuin_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_yufuin|navigation_yufuin_v1|always_on"
        },
        {
            title: "合掌村",
            linkUrl: "/search?keyword=白川鄉合掌村",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_shirakawago_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_shirakawago|navigation_shirakawago_v1|always_on"
        },
        {
            title: "北海道滑雪",
            linkUrl: "/search?keyword=滑雪",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_ski_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_ski|navigation_ski_v1|always_on"
        },
        {
            title: "賞櫻行程",
            linkUrl: "/search?keyword=櫻",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_sakura_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_sakura|navigation_sakura_v1|always_on"
        },
        {
            title: "連休出國",
            linkUrl: "https://www.dtsgroup.com.tw/event/week/?&utm_source=website&utm_medium=display&utm_campaign=week_page_20240909&utm_content=30-50f_abc",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_holiday_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_holiday|navigation_holiday_v1|always_on"
        },
        {
            title: "立山雪壁",
            linkUrl: "/search?keyword=立山",
            gaEvent: "search_action",
            gaEventName: "search_action_navigation_tateyama_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_keyword_nav_tateyama|navigation_tateyama_v1|always_on"
        }
    ];

    const hotKeywordData: HotKeywordSeedData[] = rawData.map((item, index) => ({
        ...item,
        order: index,
        isActive: true,
    }));

    // 4. 執行大量寫入
    await prisma.hotKeyword.createMany({
        data: hotKeywordData,
    });

    console.log(
        `✅ HotKeyword 資料匯入成功！共匯入 ${hotKeywordData.length} 筆。`
    );
}

main()
    .catch((e) => {
        console.error('❌ HotKeyword Seed 執行失敗:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });