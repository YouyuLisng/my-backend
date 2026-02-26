export const breadcrumbMap: Record<string, string> = {
    dashboard: '儀表板',
    cms: '內容管理',
    banners: '輪播圖設定',
    menu: '選單管理',
    'new-pages': '活動頁面',
    articles: '文章管理',
    settings: '系統設定',
    create: '新增',
    new: '新增',
    edit: '編輯',
};

/**
 * 建立麵包屑陣列
 */
export const buildBreadcrumbs = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);

    const crumbs = [{ label: '首頁', href: '/' }];

    let currentPath = '';
    segments.forEach((seg) => {
        currentPath += `/${seg}`;
        const label = breadcrumbMap[seg] || seg;
        crumbs.push({ label, href: currentPath });
    });

    return crumbs;
};
