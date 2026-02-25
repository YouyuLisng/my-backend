'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { buildBreadcrumbs } from '@/config/breadcrumb.config';
import { sidebarItems } from '@/config/sidebar.config';

export const DynamicBreadcrumb = () => {
    const pathname = usePathname();

    const crumbs = useMemo(() => {
        const rawCrumbs = buildBreadcrumbs(pathname);
        
        // 查找當前路徑是否屬於某個側邊欄分組 (MUI 習慣顯示層級)
        const enrichedCrumbs = [...rawCrumbs];
        
        // 邏輯優化：如果當前在子路徑，且父路徑在 sidebarItems 的 items 裡
        // 我們可以確保麵包屑的標籤與側邊欄對應
        sidebarItems.forEach(group => {
            if (group.items?.some(it => pathname.startsWith(it.url))) {
                // 如果麵包屑裡還沒有這個群組名稱，則插入
                if (!enrichedCrumbs.some(c => c.label === group.title)) {
                    // 插在「首頁」之後
                    enrichedCrumbs.splice(1, 0, { label: group.title, href: null as any });
                }
            }
        });

        return enrichedCrumbs;
    }, [pathname]);

    return (
        <Breadcrumb className="text-sm overflow-hidden whitespace-nowrap">
            <BreadcrumbList className="flex-nowrap gap-1 sm:gap-1.5">
                {crumbs.map((c, idx) => {
                    const isLast = idx === crumbs.length - 1;
                    return (
                        <React.Fragment key={`${c.label}-${idx}`}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage className="font-semibold text-slate-900">
                                        {c.label}
                                    </BreadcrumbPage>
                                ) : c.href ? (
                                    <BreadcrumbLink asChild className="text-slate-500 hover:text-blue-600 transition-colors">
                                        <Link href={c.href}>{c.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <span className="text-slate-400 cursor-default">
                                        {c.label}
                                    </span>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator className="text-slate-300">
                                    /
                                </BreadcrumbSeparator>
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
};