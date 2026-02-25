'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation'; // 1. 引入 usePathname

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        isActive?: boolean;
        items?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const pathname = usePathname(); // 2. 取得當前路徑

    return (
        <SidebarGroup>
            <SidebarGroupLabel>管理選單</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    // 3. 判斷邏輯：如果當前路徑等於父選單，或是包含在任何子選單的 URL 中，就設為展開
                    const isChildActive = item.items?.some((subItem) => pathname === subItem.url);
                    const isParentActive = pathname === item.url;
                    const shouldOpen = isParentActive || isChildActive || item.isActive;

                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={shouldOpen} // 4. 使用動態判斷的狀態
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={item.title} isActive={isParentActive}>
                                    <a href={item.url}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </a>
                                </SidebarMenuButton>
                                {item.items?.length ? (
                                    <>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                                <ChevronRight className="transition-transform duration-200" />
                                                <span className="sr-only">Toggle</span>
                                            </SidebarMenuAction>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton 
                                                            asChild 
                                                            isActive={pathname === subItem.url} // 5. 高亮當前子選單
                                                        >
                                                            <a href={subItem.url}>
                                                                <span>{subItem.title}</span>
                                                            </a>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </>
                                ) : null}
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}