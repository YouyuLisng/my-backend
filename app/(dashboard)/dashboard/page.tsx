'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, FileText, Users, MousePointer2 } from 'lucide-react';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';

// 模擬數據
const chartData = [
    { name: 'Mon', total: 1200 },
    { name: 'Tue', total: 2100 },
    { name: 'Wed', total: 1800 },
    { name: 'Thu', total: 2400 },
    { name: 'Fri', total: 2000 },
    { name: 'Sat', total: 2800 },
    { name: 'Sun', total: 3100 },
];

const stats = [
    {
        title: '總活動頁面',
        value: '12',
        icon: LayoutDashboard,
        color: 'text-[#A6CF13]',
        bg: 'bg-[#F6FAE7]',
        desc: '+2 較上月增加',
    },
    {
        title: '待處理留言',
        value: '5',
        icon: Users,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        desc: '需要技術部處理',
    },
    {
        title: '文章總數',
        value: '128',
        icon: FileText,
        color: 'text-[#A6CF13]',
        bg: 'bg-[#F6FAE7]',
        desc: '包含 12 篇草稿',
    },
    {
        title: '廣告點擊率',
        value: '3.2%',
        icon: MousePointer2,
        color: 'text-green-600',
        bg: 'bg-green-50',
        desc: 'Banner A 表現最佳',
    },
];

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <header>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    後台儀表板
                </h1>
                <p className="text-sm text-slate-500">
                    歡迎回來，大榮旅遊管理員。以下是今日系統概覽。
                </p>
            </header>

            {/* 數據卡片區 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <Card
                        key={s.title}
                        className="shadow-sm border-slate-100 hover:shadow-md transition-all duration-300 group"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {s.title}
                            </CardTitle>
                            <div
                                className={cn(
                                    'p-2 rounded-lg transition-colors group-hover:bg-[#A6CF13] group-hover:text-white',
                                    s.bg
                                )}
                            >
                                <s.icon
                                    className={cn(
                                        'size-4 group-hover:text-white',
                                        s.color
                                    )}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">
                                {s.value}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                {s.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 圖表與側欄區 */}
            <div className="grid gap-6 md:grid-cols-7">
                <Card className="md:col-span-4 shadow-sm border-slate-100">
                    <CardHeader>
                        <CardTitle className="text-base font-bold text-slate-700">
                            網站存取量分析
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-75 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient
                                            id="colorTotal"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#A6CF13"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#A6CF13"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#f1f5f9"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow:
                                                '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#A6CF13"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 最近更新區 */}
                <div className="md:col-span-3 flex flex-col gap-4">
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#A6CF13]" />{' '}
                            系統待辦事項
                        </h2>
                        <ul className="space-y-4">
                            {[
                                '更新 3 月份輪播圖 Banners',
                                '確認文章管理中的 5 篇草稿',
                                '調整活動頁面的 SEO 關鍵字',
                            ].map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-3 text-sm text-slate-600"
                                >
                                    <div className="mt-1 size-1.5 rounded-full bg-slate-300" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
