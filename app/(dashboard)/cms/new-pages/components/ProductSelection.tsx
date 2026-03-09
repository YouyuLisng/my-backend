'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Search, Package, Calendar, MapPin, Trash2, 
    CheckCircle2, Image as ImageIcon, Loader2,
    CalendarDays, Users2, Tags, X, FolderTree
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// 完全對照 API 的資料介面
interface ProductItemData {
    團型編號: string;
    產品名稱: string;
    個團名稱?: string;
    主圖: string | null;
    出發機場: string;
    抵達城市: string;
    抵達國家: string;
    天: number;
    團體編號?: string; 
    TOURS?: {
        團號: string;
        出發日期: string;
        可售機位: number;
        直客成人售價: number;
    }[];
}

interface ProductSelectionProps {
    mode: string;
    products: { refCode: string; productIds: string[] }[]; 
    onUpdate: (refCode: string, tourId: string, isChecked: boolean) => void;
}

export default function ProductSelection({ mode, products, onUpdate }: ProductSelectionProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<ProductItemData[]>([]);
    const [savedProductData, setSavedProductData] = useState<any[]>([]);
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
            console.error(`Fetch error:`, err);
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

    // 自動補齊「曾勾選但不在搜尋結果中」的產品資訊
    useEffect(() => {
        const syncSelectedDetails = async () => {
            const allSelectedTourIds = products.flatMap(p => p.productIds);
            const missingIds = allSelectedTourIds.filter(id => 
                !searchResult.some(group => group.TOURS?.some((t: any) => t.團號 === id)) &&
                !savedProductData.some((item: any) => (item.團體編號 === id || item.團號 === id)) &&
                !fetchingRef.current.has(id)
            );

            if (missingIds.length === 0) return;
            missingIds.forEach(id => fetchingRef.current.add(id));

            const url = 'https://bi.dtsgroup.com.tw/api/product/GroupList';
            const missingData = await postData(url, { qgrupcds: missingIds.join(',') });
            
            if (missingData.length > 0) {
                setSavedProductData(prev => {
                    const newItems = missingData.filter(
                        (item: any) => !prev.some(p => (p.團體編號 === item.團體編號 || p.團號 === item.團號))
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

    // ✅ 將已勾選產品進行群組化呈現，並進行 TypeScript 安全檢查
    const selectedGroupedItems = useMemo(() => {
        const groups: Record<string, any> = {};

        products.forEach(p => {
            p.productIds.forEach((id: string) => {
                const searchGroup = searchResult.find(r => r.團型編號 === p.refCode);
                const searchTour = searchGroup?.TOURS?.find((t) => t.團號 === id);
                const groupData = savedProductData.find((item: any) => (item.團體編號 === id || item.團號 === id || item.團體編號 === id));

                // 檢查 searchGroup 與 searchTour 是否同時存在以符合 TS
                const finalData = (searchTour && searchGroup) ? {
                    image: searchGroup.主圖,
                    name: searchGroup.產品名稱,
                    price: searchTour.直客成人售價,
                    date: searchTour.出發日期,
                } : groupData ? {
                    image: groupData.主圖,
                    name: groupData.產品名稱,
                    price: groupData.直客成人售價,
                    date: groupData.出發日期?.split('T')[0] || groupData.出發日期,
                } : null;

                if (finalData) {
                    if (!groups[p.refCode]) {
                        groups[p.refCode] = {
                            refCode: p.refCode,
                            name: finalData.name,
                            image: finalData.image,
                            tours: []
                        };
                    }
                    groups[p.refCode].tours.push({
                        tourId: id, // 這就是 API 中的「團號」
                        date: finalData.date,
                    });
                }
            });
        });
        return Object.values(groups);
    }, [products, searchResult, savedProductData]);

    return (
        <div className="space-y-8 mt-6 text-left">
            
            {/* --- 區塊 A: 群組化「確認上架清單」 --- */}
            <div className="p-6 border-2 border-blue-500/20 rounded-lg bg-white shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg">
                            <FolderTree className="size-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">
                                確認上架清單 <span className="text-blue-600 ml-1">({products.reduce((acc, p) => acc + p.productIds.length, 0)})</span>
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">已根據團型分類，右側顯示個別「團號」與日期</p>
                        </div>
                    </div>
                </div>

                {selectedGroupedItems.length === 0 ? (
                    <div className="py-16 border-2 border-dashed border-slate-100 rounded-lg text-center text-slate-300 italic">
                        尚未勾選任何產品...
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedGroupedItems.map((group) => (
                            <div key={group.refCode} className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-slate-50/50 border border-slate-200">
                                {/* 左側：團型簡覽 */}
                                <div className="flex items-center gap-4 md:w-1/3 lg:w-1/4 flex-shrink-0">
                                    <div className="relative size-14 rounded-md overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
                                        {group.image ? (
                                            <Image src={getFullImageUrl(group.image)!} alt="" fill className="object-cover" />
                                        ) : (
                                            <ImageIcon className="size-6 text-slate-200 m-auto" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[12px] font-black text-slate-800 line-clamp-2 leading-tight mb-1">{group.name}</p>
                                        <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 opacity-60 rounded-sm italic">Ref: {group.refCode}</Badge>
                                    </div>
                                </div>

                                {/* 右側：已選日期與團號標籤 */}
                                <div className="flex-1 flex flex-wrap gap-2 items-center">
                                    {group.tours.map((tour: any) => (
                                        <div key={tour.tourId} className="group flex items-center gap-3 bg-white px-3 py-2 rounded-md border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-blue-600 leading-none mb-1.5">{tour.date.replaceAll('/', '-')}</span>
                                                {/* ✅ 這裡顯示團體編號 (團號) */}
                                                <span className="text-[10px] font-mono text-slate-400 font-bold leading-none bg-slate-50 px-1 rounded-sm">
                                                    {tour.tourId}
                                                </span>
                                            </div>
                                            <Separator orientation="vertical" className="h-5 bg-slate-100" />
                                            <button 
                                                onClick={() => onUpdate(group.refCode, tour.tourId, false)}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- 區塊 B: 搜尋過濾器 --- */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Search className="size-6 text-blue-600" /> 搜尋產品庫</h3>
                        <p className="text-slate-400 text-sm mt-1 font-medium italic">輸入團型編號展開該系列的所有出發日期</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-[500px] bg-white p-2 rounded-lg border-2 border-slate-100 focus-within:border-blue-500 transition-all shadow-inner">
                        <Input 
                            placeholder={mode === 'GRUPCD' ? "輸入團型編號 (如: DTS26...)" : "輸入團號..."}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="border-none shadow-none focus-visible:ring-0 text-md font-bold"
                        />
                        <Button onClick={handleSearch} disabled={loading} className="rounded-md px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                            {loading ? <Loader2 className="animate-spin size-5" /> : "搜尋"}
                        </Button>
                    </div>
                </div>

                {/* --- 區塊 C: 搜尋結果 (主從式 UI) --- */}
                <div className="p-4 space-y-6 max-h-[900px] overflow-y-auto scrollbar-thin">
                    {searchResult.length > 0 ? (
                        searchResult.map((group) => (
                            <div key={group.團型編號} className="border rounded-lg overflow-hidden bg-white shadow-sm border-slate-100 transition-all animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-6 flex flex-col lg:flex-row gap-8 bg-gradient-to-br from-slate-50/50 to-transparent">
                                    <div className="relative w-full lg:w-80 aspect-[16/10] rounded-lg overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                                        {group.主圖 ? (
                                            <Image src={getFullImageUrl(group.主圖)!} alt="" fill className="object-cover" />
                                        ) : (
                                            <div className="bg-slate-200 h-full flex items-center justify-center text-slate-400"><ImageIcon size={40} /></div>
                                        )}
                                        <div className="absolute bottom-3 left-3 flex gap-2">
                                            <Badge className="bg-black/70 backdrop-blur-md border-none font-bold rounded-sm">{group.天}天</Badge>
                                            <Badge className="bg-blue-600 border-none font-bold rounded-sm">{group.出發機場}出發</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[11px] font-black bg-slate-800 text-white px-3 py-0.5 rounded-sm uppercase tracking-tighter shadow-sm">團型: {group.團型編號}</span>
                                                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={12} />{group.抵達國家} · {group.抵達城市}</span>
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">{group.產品名稱}</h4>
                                        </div>
                                        
                                        <Separator className="bg-slate-200/60" />
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <CalendarDays size={20} className="text-blue-500" />
                                                <span className="text-sm font-black uppercase tracking-widest">可選出發日期</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                                {group.TOURS?.map((tour) => {
                                                    const isChecked = products.find(p => p.refCode === group.團型編號)?.productIds.includes(tour.團號);
                                                    return (
                                                        <div 
                                                            key={tour.團號}
                                                            onClick={() => onUpdate(group.團型編號, tour.團號, !isChecked)}
                                                            className={cn(
                                                                "group relative flex flex-col p-4 rounded-lg border-2 transition-all cursor-pointer select-none shadow-sm",
                                                                isChecked 
                                                                    ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50" 
                                                                    : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex flex-col">
                                                                    <span className={cn("text-[14px] font-black font-mono tracking-tighter leading-none mb-1", isChecked ? "text-blue-700" : "text-slate-600")}>
                                                                        {tour.出發日期.split('/').slice(1).join('/')}
                                                                    </span>
                                                                    {/* 直接顯示團號，不再需要 Hover */}
                                                                    <span className="text-[12px] font-mono font-bold bg-slate-100/50 rounded-sm w-fit">
                                                                        {tour.團號}
                                                                    </span>
                                                                </div>
                                                                <div className={cn(
                                                                    "size-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                                                    isChecked ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-slate-200"
                                                                )}>
                                                                    {isChecked && <CheckCircle2 size={12} className="text-white" />}
                                                                </div>
                                                            </div>
                                                            <div className="mt-auto pt-2 border-t border-slate-100/50">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={cn(
                                                                        "text-[12px] font-bold flex items-center gap-1",
                                                                        tour.可售機位 > 0 ? "text-emerald-600" : "text-rose-400"
                                                                    )}>
                                                                        可售機位: {tour.可售機位}
                                                                    </span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-[17px] font-black text-orange-600 tracking-tight">
                                                                        ${tour.直客成人售價?.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-40 flex flex-col items-center justify-center text-slate-300">
                            <Tags size={60} className="mb-4 opacity-10" />
                            <p className="font-black text-xl tracking-tight">{query ? "找不到產品" : "輸入編號開始管理"}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}