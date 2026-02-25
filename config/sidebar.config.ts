import {
    LayoutDashboard,
    FileText,
    Settings,
    Users,
    Image as ImageIcon,
    Tag,
    LayoutGrid,
    Megaphone,
    MessageSquareQuote,
} from 'lucide-react';

export const sidebarTeams = [
    {
        name: '大榮旅遊',
        logo: LayoutDashboard,
        plan: '管理後台',
    },
];

export const sidebarItems = [
    {
        title: '儀表板',
        url: '/dashboard',
        icon: LayoutDashboard,
        isActive: true,
    },
    {
        title: '內容管理',
        url: '#',
        icon: ImageIcon,
        items: [
            { title: '輪播圖設定', url: '/cms/banners' },
            { title: '選單管理', url: '/cms/menu' },
            { title: '活動頁面', url: '/cms/new-pages' },
            { title: '熱門關鍵字', url: '/cms/hot-keywords', icon: Tag },
            { title: '模組管理', url: '/cms/modules', icon: LayoutGrid },
            { title: '廣告管理', url: '/cms/ads', icon: Megaphone },
            { title: 'FAQ 管理', url: '/cms/faqs', icon: MessageSquareQuote },
        ],
    },
    {
        title: '文章管理',
        url: '/articles',
        icon: FileText,
    },
    {
        title: '系統設定',
        url: '/settings',
        icon: Settings,
    },
];