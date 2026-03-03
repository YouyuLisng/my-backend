'use client';

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    LogOut,
    Sparkles,
    ShieldCheck, // 開發者圖示
    UserCog,     // 企劃圖示
    Package      // 產品圖示
} from 'lucide-react';
import { signOut } from 'next-auth/react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// 定義角色對應的顯示名稱與樣式
const roleConfig: Record<string, { label: string; icon: any; className: string }> = {
    DEV: { label: '開發人員', icon: ShieldCheck, className: 'bg-purple-50 text-purple-700 border-purple-200' },
    PLANNING: { label: '企劃部', icon: UserCog, className: 'bg-blue-50 text-blue-700 border-blue-200' },
    PRODUCT: { label: '產品部', icon: Package, className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export function NavUser({
    user,
}: {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
    };
}) {
    const { isMobile } = useSidebar();
    const config = roleConfig[user.role || ''] || { label: user.role, icon: BadgeCheck, className: 'bg-slate-50 text-slate-600' };
    const Icon = config.icon;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-slate-50 transition-all h-14"
                        >
                            <Avatar className="h-9 w-9 rounded-lg shadow-sm">
                                <AvatarImage
                                    src={user.image || ''}
                                    alt={user.name || 'User'}
                                />
                                <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 font-bold">
                                    {user.name?.slice(0, 1) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                                <div className="flex items-center gap-1.5">
                                    <span className="truncate font-bold text-slate-700">
                                        {user.name}
                                    </span>
                                    {/* ✅ 在側邊欄按鈕顯示簡短部門標籤 */}
                                    <Badge variant="outline" className={cn("px-1 py-0 h-4 text-[10px] font-black uppercase tracking-tighter", config.className)}>
                                        {config.label}
                                    </Badge>
                                </div>
                                <span className="truncate text-xs text-slate-500">
                                    {user.email}
                                </span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-xl border-slate-100 p-2"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                                <Avatar className="h-10 w-10 rounded-lg">
                                    <AvatarImage
                                        src={user.image || ''}
                                        alt={user.name || 'User'}
                                    />
                                    <AvatarFallback className="rounded-lg bg-blue-50 text-blue-600">
                                        {user.name?.slice(0, 1) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="truncate font-black text-slate-800">
                                            {user.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* <Icon size={12} className={cn("shrink-0", config.className.split(' ')[1])} /> */}
                                        <span className={cn("text-[11px] font-bold uppercase tracking-wider", config.className.split(' ')[1])}>
                                            {config.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="my-2" />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-bold rounded-lg py-2.5"
                        >
                            <LogOut className="size-4" />
                            登出管理系統
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}