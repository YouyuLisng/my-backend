'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Search, Package, Calendar, MapPin, Trash2, 
    CheckCircle2, Image as ImageIcon, Plane, Clock, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 定義 API 回傳的產品資料介面
interface ProductItemData {
    團體編號: string;
    產品名稱: string;
    個團名稱?: string;
    團型編號: string;
    主圖: string | null;
    直客成人售價: number;
    出發日期: string;
    天: number;
    出發機場: string;
    抵達城市: string;
    抵達國家: string;
    可售: number;
    TOURS?: any[]; // 用於 ProductList 的嵌套結構
}

interface ProductSelectionProps {
    mode: string;
    products: { refCode: string; productIds: string[] }[]; 
    onUpdate: (refCode: string, tourId: string, isChecked: boolean) => void;
}

export default function ProductSelection({ mode, products, onUpdate }: ProductSelectionProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [savedProductData, setSavedProductData] = useState<ProductItemData[]>([]);
    const fetchingRef = useRef<Set<string>>(new Set());

    const postData = async (url: string, params: object) => {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...params, pageSize: 100, pageNumber: 1 })
            });
            const result = await res.json();
            return result.data || [];
        } catch (err) {
            console.error(`Fetch error from ${url}:`, err);
            return [];
        }
    };

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        const url = 'https://bi.dtsgroup.com.tw/api/product/ProductList';
        const payload = mode === 'GRUPCD' ? { qmgrupcd: query } : { qgrupcds: query };
        const data = await postData(url, payload);
        setSearchResult(data);
        setLoading(false);
    };

    useEffect(() => {
        const syncSelectedDetails = async () => {
            const allSelectedTourIds = products.flatMap(p => p.productIds);
            const missingIds = allSelectedTourIds.filter(id => 
                !searchResult.some(group => group.TOURS?.some((t: any) => t.團號 === id)) &&
                !savedProductData.some((item: ProductItemData) => item.團體編號 === id) &&
                !fetchingRef.current.has(id)
            );

            if (missingIds.length === 0) return;
            missingIds.forEach(id => fetchingRef.current.add(id));

            const url = 'https://bi.dtsgroup.com.tw/api/product/GroupList';
            const missingData = await postData(url, { qgrupcds: missingIds.join(',') });
            
            if (missingData.length > 0) {
                setSavedProductData(prev => {
                    const newItems = missingData.filter(
                        (item: ProductItemData) => !prev.some(p => p.團體編號 === item.團體編號)
                    );
                    return [...prev, ...newItems];
                });
            }
        };
        syncSelectedDetails();
    }, [products, searchResult, savedProductData]);

    const getFullImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `https://travel.dtsgroup.com.tw${path}`;
    };

    const selectedItems = useMemo(() => {
        const list: any[] = [];
        products.forEach(p => {
            p.productIds.forEach((id: string) => {
                const searchGroup = searchResult.find(r => r.團型編號 === p.refCode);
                const searchTour = searchGroup?.TOURS?.find((t: any) => t.團號 === id);
                const groupData = savedProductData.find((item: ProductItemData) => item.團體編號 === id);

                const finalData = searchTour ? {
                    image: searchGroup.主圖,
                    name: searchGroup.產品名稱,
                    price: searchTour.直客成人售價,
                    date: searchTour.出發日期,
                    days: searchGroup.天
                } : groupData ? {
                    image: groupData.主圖,
                    name: groupData.產品名稱,
                    price: groupData.直客成人售價,
                    date: groupData.出發日期?.split('T')[0],
                    days: groupData.天
                } : null;

                list.push({
                    tourId: id,
                    refCode: p.refCode,
                    image: getFullImageUrl(finalData?.image || null),
                    name: finalData?.name || "載入中...",
                    price: finalData?.price || 0,
                    date: finalData?.date || "正在獲取...",
                    days: finalData?.days || "-"
                });
            });
        });
        return list;
    }, [products, searchResult, savedProductData]);

    return (
        <div className="space-y-10 mt-8 text-left">
            {/* --- 區塊 B: 搜尋與挑選 --- */}
            <div className="space-y-6 p-8 border rounded-3xl bg-white shadow-sm border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Package className="size-5 text-blue-600" /> 2. 產品庫搜尋
                    </h3>
                    <div className="flex gap-2 w-full md:w-[450px] bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:ring-2 ring-blue-100 transition-all">
                        <Input 
                            placeholder={mode === 'GRUPCD' ? "搜尋團型編號..." : "搜尋團號..."}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                        />
                        <Button onClick={handleSearch} disabled={loading} className="rounded-xl px-6 bg-blue-600">
                            {loading ? <Loader2 className="animate-spin size-4" /> : <Search size={18} />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-12 max-h-[900px] overflow-y-auto pr-4 scrollbar-thin">
                    {searchResult.length > 0 ? (
                        searchResult.map((group) => (
                            <div key={group.團型編號} className="animate-in fade-in duration-500">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{group.產品名稱}</h4>
                                        <p className="text-sm text-slate-400 font-mono italic">團型編號：{group.團型編號}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {group.TOURS?.map((tour: any) => {
                                        const isChecked = products.find(p => p.refCode === group.團型編號)?.productIds.includes(tour.團號);
                                        return (
                                            <div 
                                                key={tour.團號}
                                                onClick={() => onUpdate(group.團型編號, tour.團號, !isChecked)}
                                                className={cn(
                                                    "group flex flex-col rounded-2xl border transition-all duration-300 relative bg-white cursor-pointer",
                                                    isChecked ? "border-blue-600 shadow-lg ring-2 ring-blue-100" : "hover:border-slate-300 shadow-sm"
                                                )}
                                            >
                                                <div className="relative aspect-[16/10] rounded-t-2xl overflow-hidden">
                                                    {group.主圖 ? (
                                                        <Image src={getFullImageUrl(group.主圖)!} alt={group.產品名稱} fill className="object-cover transition-transform group-hover:scale-105" />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full bg-slate-50 text-slate-200"><ImageIcon size={32} /></div>
                                                    )}
                                                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap font-bold">
                                                        <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                                            <Plane size={10} /> {group.出發機場}
                                                        </span>
                                                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-black shadow-sm">
                                                            {group.天}日遊
                                                        </span>
                                                    </div>
                                                    <div className="absolute top-3 right-3 z-20">
                                                        <Checkbox 
                                                            checked={isChecked}
                                                            onCheckedChange={() => {}} 
                                                            className="size-6 rounded-full border-white bg-white/80 shadow-md data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="p-4 flex flex-col flex-1">
                                                    <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{group.抵達城市} · {group.抵達國家}</p>
                                                    <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-4 leading-relaxed min-h-[40px]">
                                                        {tour.個團名稱 || group.產品名稱}
                                                    </p>
                                                    <div className="mt-auto pt-4 border-t border-slate-50">
                                                        <div className="flex justify-between items-center mb-1 text-[12px] text-slate-400 font-mono font-bold tracking-tight">
                                                            <span>{tour.團號}</span>
                                                            <span>{tour.出發日期}</span>
                                                        </div>
                                                        <div className="flex justify-between items-end">
                                                            <span className={cn("text-[10px] font-black", tour.可售機位 > 0 ? "text-green-500" : "text-red-400")}>
                                                                機位: {tour.可售機位}
                                                            </span>
                                                            <div className="text-right">
                                                                <span className="text-xl font-black text-orange-600">${tour.直客成人售價?.toLocaleString()}</span>
                                                                <span className="text-[10px] text-slate-400 ml-0.5 font-bold">起</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center text-slate-300">
                            {query ? "找不到產品，請更換關鍵字再試一次" : "請輸入產品或團型編號開始搜尋"}
                        </div>
                    )}
                </div>
            </div>
             {/* --- 區塊 A: 已選上架產品 --- */}
            <div className="p-6 border-2 border-blue-100 rounded-3xl bg-blue-50/10 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <CheckCircle2 className="size-6 text-blue-600" /> 已選上架產品 ({selectedItems.length})
                    </h3>
                </div>
                {selectedItems.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 bg-white">
                        尚未勾選任何產品
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {selectedItems.map((item) => (
                            <div key={item.tourId} className="group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-300 relative animate-in fade-in">
                                <div className="relative aspect-[16/10]">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-slate-100 text-slate-300">
                                            {item.name === "載入中..." ? <Loader2 className="animate-spin" /> : <ImageIcon size={32} />}
                                        </div>
                                    )}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdate(item.refCode, item.tourId, false);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors z-20 shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="p-4 flex flex-col h-48">
                                    <h4 className="font-bold text-slate-800 line-clamp-2 text-md mb-2 leading-tight">{item.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-auto mb-4">
                                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded">{item.days}日遊</span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded truncate max-w-[120px] font-mono">{item.tourId}</span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-orange-600">${item.price?.toLocaleString()}</span>
                                            <span className="text-xs text-slate-400 ml-1 font-bold">起</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}