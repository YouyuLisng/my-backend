import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 定義明確的介面，解決 TS 屬性推斷錯誤
interface MenuDataNode {
    title: string;
    description?: string | null;
    linkUrl?: string | null;
    imageUrl?: string | null;
    order: number;
    isActive: boolean;
    gaEvent?: string | null;
    gaEventName?: string | null;
    gaCategory?: string | null;
    gaLabel?: string | null;
    children?: MenuDataNode[];
}

async function main() {
    console.log('🚀 開始初始化選單資料 (自動產生 ID，包含圖片網址)...');

    // ✅ 關鍵修正：解決 P2014 錯誤
    // 第一步：先將所有資料的 parentId 設為 null，斷開父子連結
    await prisma.menu.updateMany({
        data: { parentId: null }
    });
    console.log('🔗 已斷開現有選單關聯');

    // 第二步：現在可以安全地清空所有資料
    await prisma.menu.deleteMany({});
    console.log('🗑️  已清空舊有選單資料');

    // 2. 指定型別為 MenuDataNode[]
    const menuData: MenuDataNode[] = [
        {
            title: "日本跟團",
            order: 0,
            isActive: true,
            children: [
                { title: "沖繩", description: "那霸", linkUrl: "/search?keyword=沖繩", imageUrl: null, order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_okinawa|navigation_okinawa_v1|always_on" },
                { title: "北海道", description: "札幌．小樽．函館．旭川", linkUrl: "/search?keyword=北海道", imageUrl: null, order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_hokkaido_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_hokkaido|navigation_hokkaido_v1|always_on" },
                { title: "東北", description: "仙台．秋田．青森．山形", linkUrl: "/search?keyword=東北", imageUrl: null, order: 2, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_tohoku_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_tohoku|navigation_tohoku_v1|always_on" },
                { title: "東京", description: "箱根．伊豆．輕井澤．迪士尼", linkUrl: "/search?keyword=東京", imageUrl: null, order: 3, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_tokyo_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_tokyo|navigation_tokyo_v1|always_on" },
                { title: "名古屋", description: "北陸．黑部立山", linkUrl: "/search?keyword=名古屋", imageUrl: null, order: 4, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_nagoya_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_nagoya|navigation_nagoya_v1|always_on" },
                { title: "大阪", description: "京都．神戶．奈良．環球影城", linkUrl: "/search?keyword=大阪", imageUrl: null, order: 5, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_osaka_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_osaka|navigation_osaka_v1|always_on" },
                { title: "四國", description: "香川．愛媛．德島．高知", linkUrl: "/search?keyword=四國", imageUrl: null, order: 6, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_shikoku_v1", gaCategory: "home_navigation", gaLabel:"2026_jp_nav_shikoku|navigation_shikoku_v1|always_on" },
                { title: "九州", description: "熊本．福岡．鹿兒島", linkUrl: "/search?keyword=九州", imageUrl: null, order: 7, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_kyushu_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_kyushu|navigation_kyushu_v1|always_on" }
            ]
        },
        {
            title: "韓國跟團",
            order: 1,
            isActive: true,
            gaEvent: "ga-click",
            children: [
                { title: "首爾", linkUrl: "/search?keyword=韓國", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_seoul_v1", gaCategory: "home_navigation", gaLabel: "2026_kr_nav_seoul|navigation_seoul_v1|always_on" },
                { title: "釜山", linkUrl: "/search?keyword=釜山", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_busan_v1", gaCategory: "home_navigation", gaLabel: "2026_kr_nav_busan|navigation_busan_v1|always_on" }
            ]
        },
        {
            title: "自由行/機票",
            order: 2,
            isActive: true,
            children: [
                { title: "全球機票預訂", description: "國際航班一鑑速查", linkUrl: "https://ticket.dtsgroup.com.tw/search?", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_airbooking_v1", gaCategory: "home_navigation", gaLabel: "2026_air_nav_booking|navigation_airbooking_v1|always_on" },
                { title: "團體自由行", description: "超值機加酒方案", linkUrl: "https://www.dtsgroup.com.tw/自由行懶人包", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_freetour_v1", gaCategory: "home_navigation", gaLabel: "2026_pkg_nav_freetour|navigation_freetour_v1|always_on" }
            ]
        },
        {
            title: "沖繩專區",
            order: 3,
            isActive: true,
            children: [
                { title: "沖繩租車", description: "台灣人服務、中文也能溝通😆", linkUrl: "https://car.gogojp.com.tw/", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_carhire_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_carhire|navigation_okinawa_carhire_v1|always_on" },
                { title: "在地體驗", description: "自由行行程、包車服務、Mini Tour", linkUrl: "https://gogojp.rezio.shop/zh-TW", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_experience_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_experience|navigation_okinawa_experience_v1|always_on" },
                { title: "沖繩訂房", description: "優質沖繩訂房", linkUrl: "https://www.gogojp.com.tw/HotelV2/", order: 2, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_hotel_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_hotel|navigation_okinawa_hotel_v1|always_on" }
            ]
        },
        {
            title: "服務專區",
            order: 4,
            isActive: true,
            children: [
                { title: "護照簽證代辦", linkUrl: "https://www.dtsgroup.com.tw/info/護照簽證代辦", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_service_visa_v1", gaCategory: "home_navigation", gaLabel: "2026_service_nav_visa|navigation_service_visa_v1|always_on" },
                { title: "信用卡優惠", linkUrl: "https://www.dtsgroup.com.tw/信用卡優惠專區", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_service_creditcard_v1", gaCategory: "home_navigation", gaLabel: "2026_service_nav_creditcard|navigation_service_creditcard_v1|always_on" }
            ]
        },
        {
            title: "關於大榮",
            linkUrl: "https://www.dtsgroup.com.tw/info/關於大榮",
            order: 5,
            isActive: true,
            gaEvent: "banner_click",
            gaEventName: "banner_click_navigation_info_about_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_info_nav_about|navigation_info_about_v1|always_on"
        },
        {
            title: "同業專區",
            linkUrl: "https://b2b.dtsgroup.com.tw/login",
            order: 6,
            isActive: true,
            gaEvent: "banner_click",
            gaEventName: "banner_click_navigation_service_b2b_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_service_nav_b2b|navigation_service_b2b_v1|always_on"
        },
        {
            title: "查詢訂單",
            linkUrl: "/search/order",
            order: 7,
            isActive: true,
            gaEvent: "banner_click",
            gaEventName: "banner_click_navigation_service_order_v1",
            gaCategory: "home_navigation",
            gaLabel: "2026_service_nav_order|navigation_service_order_v1|always_on"
        }
    ];

    for (const item of menuData) {
        const parent = await prisma.menu.create({
            data: {
                title: item.title,
                order: item.order,
                isActive: item.isActive,
                linkUrl: item.linkUrl || null,
                gaEvent: item.gaEvent || "ga-click",
                gaEventName: item.gaEventName || null,
                gaCategory: item.gaCategory || null,
                gaLabel: item.gaLabel || null,
            },
        });

        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                await prisma.menu.create({
                    data: {
                        title: child.title,
                        description: child.description || null,
                        linkUrl: child.linkUrl || null,
                        imageUrl: child.imageUrl || null,
                        order: child.order,
                        isActive: child.isActive,
                        gaEvent: child.gaEvent || "ga-click",
                        gaEventName: child.gaEventName || null,
                        gaCategory: child.gaCategory || null,
                        gaLabel: child.gaLabel || null,
                        parentId: parent.id,
                    },
                });
            }
        }
    }

    console.log('✅ 選單資料初始化完成！');
}

main()
    .catch((e) => {
        console.error('❌ 選單 Seed 執行失敗:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });