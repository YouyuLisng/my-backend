import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. 定義明確的介面
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
    console.log('🚀 開始初始化選單資料 (自動產生 ID，圖片欄位已清空)...');

    // ✅ 第一步：斷開父子連結，避免 P2014 錯誤
    await prisma.menu.updateMany({
        data: { parentId: null }
    });
    console.log('🔗 已斷開現有選單關聯');

    // 第二步：安全清空資料
    await prisma.menu.deleteMany({});
    console.log('🗑️  已清空舊有選單資料');

    // 3. 定義原始資料 (imageUrl 已全數設為 null)
    const menuData: MenuDataNode[] = [
        {
            title: "日本旅遊",
            order: 0,
            isActive: true,
            children: [
                { title: "沖繩", description: "那霸", linkUrl: "/search?qarea=SAREA00014&regions=沖繩", imageUrl: null, order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_okinawa|navigation_okinawa_v1|always_on" },
                { title: "北海道", description: "札幌．小樽．函館．旭川", linkUrl: "/search?qarea=SAREA00001&regions=北海道", imageUrl: null, order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_hokkaido_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_hokkaido|navigation_hokkaido_v1|always_on" },
                { title: "東北．新潟", description: "仙台．秋田．青森．山形", linkUrl: "/search?qarea=SAREA00002&regions=東北", imageUrl: null, order: 2, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_tohoku_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_tohoku|navigation_tohoku_v1|always_on" },
                { title: "東京", description: "箱根．伊豆．輕井澤．迪士尼", linkUrl: "/search?qarea=SAREA00003&regions=東京", imageUrl: null, order: 3, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_tokyo_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_tokyo|navigation_tokyo_v1|always_on" },
                { title: "名古屋．富山", description: "北陸．黑部立山", linkUrl: "/search?qarea=SAREA00004&regions=名古屋", imageUrl: null, order: 4, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_nagoya_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_nagoya|navigation_nagoya_v1|always_on" },
                { title: "大阪", description: "京都．神戶．奈良．環球影城", linkUrl: "/search?qarea=SAREA00005&regions=大阪", imageUrl: null, order: 5, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_osaka_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_osaka|navigation_osaka_v1|always_on" },
                { title: "四國．山陰山陽", description: "香川．愛媛．德島．高知", linkUrl: "/search?qarea=SAREA00007&regions=四國", imageUrl: null, order: 6, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_shikoku_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_shikoku|navigation_shikoku_v1|always_on" },
                { title: "九州", description: "熊本．福岡．鹿兒島", linkUrl: "/search?qarea=SAREA00008&regions=九州", imageUrl: null, order: 7, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_kyushu_v1", gaCategory: "home_navigation", gaLabel: "2026_jp_nav_kyushu|navigation_kyushu_v1|always_on" }
            ]
        },
        {
            title: "自由行/機票",
            order: 1,
            isActive: true,
            children: [
                { title: "全球機票預訂", description: "國際航班一鑑速查", linkUrl: "https://ticket.dtsgroup.com.tw/search?&utm_source=website&utm_medium=display&utm_campaign=ticket_page_20260112&utm_content=30-50f_abc", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_airbooking_v1", gaCategory: "home_navigation", gaLabel: "2026_air_nav_booking|navigation_airbooking_v1|always_on" },
                { title: "團體自由行", description: "超值機加酒方案", linkUrl: "https://www.dtsgroup.com.tw/%E8%87%AA%E7%94%B1%E8%A1%8C%E6%87%B6%E4%BA%BA%E5%8C%85", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_freetour_v1", gaCategory: "home_navigation", gaLabel: "2026_pkg_nav_freetour|navigation_freetour_v1|always_on" }
            ]
        },
        {
            title: "沖繩專區",
            order: 2,
            isActive: true,
            children: [
                { title: "沖繩租車", description: "台灣人服務、中文也能溝通😆", linkUrl: "https://car.gogojp.com.tw/?_ga=2.98759070.1475048377.1768186972-774380032.1712713880", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_carhire_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_carhire|navigation_okinawa_carhire_v1|always_on" },
                { title: "在地體驗", description: "自由行行程、包車服務、Mini Tour", linkUrl: "https://gogojp.rezio.shop/zh-TW?&utm_source=website&utm_medium=display&utm_campaign=okinawa_page_20260112&utm_content=30-50f_abc", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_experience_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_experience|navigation_okinawa_experience_v1|always_on" },
                { title: "沖繩訂房", description: "優質沖繩訂房", linkUrl: "https://www.gogojp.com.tw/HotelV2/Start.aspx?_ga=2.94034589.1475048377.1768186972-774380032.1712713880", order: 2, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_hotel_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_hotel|navigation_okinawa_hotel_v1|always_on" },
                { title: "沖繩民宿", description: "100%沖繩合格民宿", linkUrl: "https://www.gogojp.com.tw/subject/minshuku/?_ga=2.98759070.1475048377.1768186972-774380032.1712713880", order: 3, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_homestay_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_homestay|navigation_okinawa_homestay_v1|always_on" },
                { title: "客製旅遊", description: "自組一團出去玩", linkUrl: "https://www.gogojp.com.tw/subject/CustomTour/foryou.aspx?_ga=2.128711948.1475048377.1768186972-774380032.1712713880", order: 4, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_okinawa_custom_v1", gaCategory: "home_navigation", gaLabel: "2026_okinawa_nav_custom|navigation_okinawa_custom_v1|always_on" }
            ]
        },
        {
            title: "世界旅遊",
            order: 3,
            isActive: true,
            children: [
                { title: "世界旅遊", description: "東南亞．歐洲．美加．中港澳", linkUrl: "https://dtsgroup.agenttour.com.tw/BBC_PageDesign/D000_CustomerDesign/dtsgroup/DTS.htm?&utm_source=website&utm_medium=display&utm_campaign=agenttour_page_20260112&utm_content=30-50f_abc", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_bbc_v1", gaCategory: "home_navigation", gaLabel: "2026_all_nav_bbc|navigation_bbc_v1|always_on" },
                { title: "韓國", linkUrl: "/search?qarea=SAREA00010&regions=首爾", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_seoul_v1", gaCategory: "home_navigation", gaLabel: "2026_kr_nav_seoul|navigation_seoul_v1|always_on" },
                { title: "越南", linkUrl: "/search?qarea=SAREA00018&regions=越南", order: 2, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_vietnam_v1", gaCategory: "home_navigation", gaLabel: "2026_vn_nav_vietnam|navigation_vietnam_v1|always_on" }
            ]
        },
        {
            title: "服務專區",
            order: 4,
            isActive: true,
            children: [
                { title: "護照簽證代辦", linkUrl: "https://travel.dtsgroup.com.tw/info/%E8%AD%B7%E7%85%A7%E7%B0%BD%E8%AD%89%E4%BB%A3%E8%BE%A6?utm_source=website&utm_medium=display&utm_campaign=info_page_20260123&utm_content=30-50f_abc", order: 0, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_service_visa_v1", gaCategory: "home_navigation", gaLabel: "2026_service_nav_visa|navigation_service_visa_v1|always_on" },
                { title: "信用卡優惠", linkUrl: "https://travel.dtsgroup.com.tw/%E4%BF%A1%E7%94%A8%E5%8D%A1%E5%84%AA%E6%83%A0%E5%B0%88%E5%8D%80?utm_source=website&utm_medium=display&utm_campaign=+credit+card_page_20260112&utm_content=30-50f_abc%22", order: 1, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_service_creditcard_v1", gaCategory: "home_navigation", gaLabel: "2026_service_nav_creditcard|navigation_service_creditcard_v1|always_on" },
                { title: "刷卡授權書", linkUrl: "https://travel.dtsgroup.com.tw/service/download/DTS_Creditcard.pdf", order: 2, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_document_authform_v1", gaCategory: "home_navigation", gaLabel: "2026_document_nav_authform|navigation_document_authform_v1|always_on" },
                { title: "護照自帶同意書", linkUrl: "https://travel.dtsgroup.com.tw/service/download/DTS_PassportAffidavit.pdf", order: 3, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_document_passportform_v1", gaCategory: "home_navigation", gaLabel: "2026_document_nav_passportform|navigation_document_passportform_v1|always_on" },
                { title: "團體旅遊契約書", linkUrl: "https://travel.dtsgroup.com.tw/service/download/DTS_GroupContract.pdf", order: 4, isActive: true, gaEvent: "banner_click", gaEventName: "banner_click_navigation_document_contract_v1", gaCategory: "home_navigation", gaLabel: "2026_document_nav_contract|navigation_document_contract_v1|always_on" }
            ]
        },
        {
            title: "關於大榮",
            linkUrl: "https://travel.dtsgroup.com.tw/info/%E9%97%9C%E6%96%BC%E5%A4%A7%E6%A6%AE",
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
        // 創建父層
        const parent = await prisma.menu.create({
            data: {
                title: item.title,
                order: item.order,
                isActive: item.isActive,
                linkUrl: item.linkUrl || null,
                gaEvent: item.gaEvent || "banner_click",
                gaEventName: item.gaEventName || null,
                gaCategory: item.gaCategory || "home_navigation",
                gaLabel: item.gaLabel || null,
            },
        });

        // 創建子層
        if (item.children && item.children.length > 0) {
            for (const child of item.children) {
                await prisma.menu.create({
                    data: {
                        title: child.title,
                        description: child.description || null,
                        linkUrl: child.linkUrl || null,
                        imageUrl: null, // 強制清空圖片
                        order: child.order,
                        isActive: child.isActive,
                        gaEvent: child.gaEvent || "banner_click",
                        gaEventName: child.gaEventName || null,
                        gaCategory: child.gaCategory || "home_navigation",
                        gaLabel: child.gaLabel || null,
                        parentId: parent.id,
                    },
                });
            }
        }
    }

    console.log('✅ 選單資料初始化完成！(圖片欄位已清空)');
}

main()
    .catch((e) => {
        console.error('❌ 選單 Seed 執行失敗:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });