'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { sidebarItems, sidebarTeams } from '@/config/sidebar.config'; 
import { LifeBuoy, Send } from 'lucide-react';

const navSecondary = [
    { title: '技術支援', url: '#', icon: LifeBuoy },
    { title: '意見回饋', url: '#', icon: Send },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession();

    const currentUser = {
        name: session?.user?.name || '管理員',
        email: session?.user?.email || 'admin@dajung.com.tw',
        image: session?.user?.image || '', 
        role: session?.user?.role || 'PRODUCT',
    };

    const activeTeam = sidebarTeams[0];

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader className="border-b border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/dashboard">
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <activeTeam.logo className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-black tracking-tight text-slate-800">
                                        {activeTeam.name}
                                    </span>
                                    <span className="truncate text-[10px] font-bold uppercase text-slate-400">
                                        {activeTeam.plan}
                                    </span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={sidebarItems} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border/50 p-2">
                <NavUser user={currentUser} />
            </SidebarFooter>
        </Sidebar>
    );
}