'use client';

import { ChevronRight, type LucideIcon } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// 定義導航項目的型別
interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
        title: string;
        url: string;
    }[];
}

export function NavMain({ items }: { items: NavItem[] }) {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = pathname.startsWith(item.url);
                    return (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        className={cn(
                                            'relative transition-all duration-200',
                                            'data-[active=true]:bg-[#F6FAE7] data-[active=true]:text-[#A6CF13] font-medium',
                                            'hover:bg-slate-50'
                                        )}
                                        data-active={isActive}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    'size-4',
                                                    isActive && 'text-[#A6CF13]'
                                                )}
                                            />
                                        )}
                                        <span>{item.title}</span>
                                        {item.items && (
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        )}

                                        {/* 左側 Active 指示條 */}
                                        {isActive && (
                                            <div className="absolute left-0 h-5 w-1 rounded-r-full bg-[#A6CF13]" />
                                        )}
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                {item.items && (
                                    <CollapsibleContent>
                                        <SidebarMenuSub className="border-l-slate-100 ml-4">
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem
                                                    key={subItem.title}
                                                >
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={pathname === subItem.url}
                                                        className="data-[active=true]:text-[#A6CF13] data-[active=true]:font-bold"
                                                    >
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                )}
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}