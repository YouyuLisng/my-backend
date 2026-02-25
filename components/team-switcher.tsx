'use client';

import * as React from 'react';
import { ChevronsUpDown, LogOut, Settings, User } from 'lucide-react';
import { signOut } from 'next-auth/react'; // 匯入登出函式

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

export function TeamSwitcher({
    teams,
}: {
    teams: {
        name: string;
        logo: React.ElementType;
        plan: string;
    }[];
}) {
    const { isMobile } = useSidebar();
    const [activeTeam, setActiveTeam] = React.useState(teams[0]);

    if (!activeTeam) return null;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-slate-50 transition-colors"
                        >
                            {/* MUI 風格：強烈的 Primary 背景色塊 */}
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                <activeTeam.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                                <span className="truncate font-bold text-slate-700">
                                    {activeTeam.name}
                                </span>
                                <span className="truncate text-xs text-slate-500">
                                    {activeTeam.plan}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg border-slate-100"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
                            帳戶與系統
                        </DropdownMenuLabel>

                        {/* 這裡可以放一些快捷操作 */}
                        <DropdownMenuItem className="gap-2 p-2 cursor-pointer focus:bg-slate-50">
                            <User className="size-4 text-slate-500" />
                            <span className="text-sm">個人檔案</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 p-2 cursor-pointer focus:bg-slate-50">
                            <Settings className="size-4 text-slate-500" />
                            <span className="text-sm">帳號設定</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-100" />

                        {/* 登出按鈕：使用 MUI 常用的小範圍紅色強調樣式 */}
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="gap-2 p-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium"
                        >
                            <LogOut className="size-4" />
                            <span className="text-sm">登出系統</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
