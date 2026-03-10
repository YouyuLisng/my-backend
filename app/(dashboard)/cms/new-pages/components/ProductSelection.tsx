'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Search, MapPin, CheckCircle2, Image as ImageIcon, Loader2, 
    Users2, X, FolderTree, GripVertical, CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// DND Kit
import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProductItemData {
    團型編號: string;
    產品名稱: string;
    個團名稱?: string;
    主圖: string | null;
    出發機場: string;
    抵達城市: string;
    抵達國家: string;
    天: number;
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
    onReorder: (newProducts: any[]) => void;
}

// 子元件：可拖曳的行程列
function SortableGroupItem({ group, onRemoveTour, getFullImageUrl }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: group.refCode });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={cn(
                "flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-white border transition-all",
                isDragging ? "shadow-2xl border-blue-500 scale-[1.02]" : "border-slate-200 bg-slate-50/40"
            )}
        >
            <div className="flex items-center gap-4 md:w-80 flex-shrink-0">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-blue-500">
                    <GripVertical size={20} />
                </div>
                <div className="relative size-14 rounded-md overflow-hidden border bg-white shadow-sm flex-shrink-0">
                    {group.image ? (
                        <Image src={getFullImageUrl(group.image)!} alt="" fill className="object-cover" />
                    ) : (
                        <ImageIcon className="size-6 text-slate-200 m-auto" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 line-clamp-2">{group.name}</p>
                    <Badge variant="secondary" className="text-[12px] font-mono py-0 px-1.5 rounded-sm">{group.refCode}</Badge>
                </div>
            </div>

            <div className="flex-1 flex flex-wrap gap-2 items-center">
                {group.tours.map((tour: any) => (
                    <div key={tour.tourId} className="flex items-center gap-3 bg-white px-3 py-2 rounded-md border border-slate-200 shadow-sm">
                        <div className="flex flex-col text-left">
                            <span className="text-[12px] font-black text-blue-600 mb-0.5">{tour.date.replaceAll('/', '-')}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{tour.tourId}</span>
                        </div>
                        <button onClick={() => onRemoveTour(group.refCode, tour.tourId)} className="text-slate-300 hover:text-red-500">
                            <X size={14} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProductSelection({ mode, products, onUpdate, onReorder }: ProductSelectionProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<ProductItemData[]>([]);
    const [savedProductData, setSavedProductData] = useState<any[]>([]);
    const fetchingRef = useRef<Set<string>>(new Set());

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const postData = async (url: string, params: object) => {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...params, pageSize: 100, pageNumber: 1 })
            });
            const result = await res.json();
            return result.data || [];
        } catch (err) { return []; }
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

    // 歷史資料同步
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
                setSavedProductData(prev => [...prev, ...missingData]);
            }
        };
        syncSelectedDetails();
    }, [products, searchResult, savedProductData]);

    // ✅ 群組化資料：確保順序依照 products 陣列排列
    const selectedGroupedItems = useMemo(() => {
        return products.map(p => {
            const searchGroup = searchResult.find(r => r.團型編號 === p.refCode);
            const groupDetail = savedProductData.find(item => item.團型編號 === p.refCode || item.details?.團型編號 === p.refCode);

            const tours = p.productIds.map(id => {
                const searchTour = searchGroup?.TOURS?.find(t => t.團號 === id);
                const tourDetail = savedProductData.find(item => item.團號 === id || item.團體編號 === id);
                return {
                    tourId: id,
                    date: searchTour?.出發日期 || tourDetail?.出發日期 || '讀取中'
                };
            });

            return {
                refCode: p.refCode,
                name: searchGroup?.產品名稱 || groupDetail?.產品名稱 || '歷史勾選產品',
                image: searchGroup?.主圖 || groupDetail?.主圖 || null,
                tours
            };
        });
    }, [products, searchResult, savedProductData]);

    // ✅ 處理拖曳結束：計算新陣列並回傳給父元件
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = products.findIndex(p => p.refCode === active.id);
            const newIndex = products.findIndex(p => p.refCode === over.id);
            const newOrder = arrayMove(products, oldIndex, newIndex);
            onReorder(newOrder); // 呼叫父元件更新狀態
        }
    };

    const getFullImageUrl = (path: string | null) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `https://travel.dtsgroup.com.tw${path}`;
    };

    return (
        <div className="space-y-8 mt-6 text-left">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 bg-slate-50/50 border-b flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Search className="size-6 text-blue-600" /> 搜尋產品庫</h3>
                    </div>
                    <div className="flex gap-2 w-full md:w-[500px] bg-white p-2 rounded-lg border-2 border-slate-100 focus-within:border-blue-500">
                        <Input 
                            placeholder="輸入團型編號 (如: DTS26...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="border-none shadow-none focus-visible:ring-0 text-md font-bold"
                        />
                        <Button onClick={handleSearch} disabled={loading} className="rounded-md px-8 bg-blue-600">
                            {loading ? <Loader2 className="animate-spin size-5" /> : "搜尋"}
                        </Button>
                    </div>
                </div>
                <div className="p-4 space-y-6 max-h-[900px] overflow-y-auto scrollbar-thin text-left">
                    {searchResult.map((group) => (
                        <div key={group.團型編號} className="border rounded-lg overflow-hidden bg-white shadow-sm border-slate-100 mb-6">
                            <div className="p-6 flex flex-col lg:flex-row gap-8 bg-gradient-to-br from-slate-50/50 to-transparent">
                                <div className="relative w-full lg:w-80 aspect-[16/10] rounded-lg overflow-hidden shadow-lg border-4 border-white flex-shrink-0">
                                    {group.主圖 ? <Image src={getFullImageUrl(group.主圖)!} alt="" fill className="object-cover" /> : <div className="bg-slate-200 h-full flex items-center justify-center text-slate-400"><ImageIcon size={40} /></div>}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[11px] font-black bg-slate-800 text-white px-3 py-0.5 rounded-sm uppercase tracking-tighter">團型: {group.團型編號}</span>
                                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><MapPin size={12} />{group.抵達國家} · {group.抵達城市}</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">{group.產品名稱}</h4>
                                    <Separator className="bg-slate-200/60" />
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                        {group.TOURS?.map((tour) => {
                                            const isChecked = products.find(p => p.refCode === group.團型編號)?.productIds.includes(tour.團號);
                                            return (
                                                <div 
                                                    key={tour.團號}
                                                    onClick={() => onUpdate(group.團型編號, tour.團號, !isChecked)}
                                                    className={cn(
                                                        "group relative flex flex-col p-5 rounded-lg border-2 transition-all cursor-pointer select-none shadow-md min-h-[160px]",
                                                        isChecked ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-50" : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className="flex justify-between items-start mb-4 text-left">
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className={cn("text-[18px] font-black font-mono tracking-tighter leading-none", isChecked ? "text-blue-700" : "text-slate-700")}>{tour.出發日期.split('/').slice(1).join('/')}</span>
                                                            <span className="text-[13px] font-mono font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-sm w-fit">{tour.團號}</span>
                                                        </div>
                                                        <div className={cn("size-7 rounded-full border-2 flex items-center justify-center transition-all", isChecked ? "bg-blue-600 border-blue-600 shadow-sm" : "bg-white border-slate-300")}>
                                                            {isChecked && <CheckCircle2 size={18} className="text-white" />}
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto pt-3 border-t border-slate-200/60">
                                                        <span className={cn("text-[13px] font-bold flex items-center gap-1.5", tour.可售機位 > 0 ? "text-emerald-600" : "text-rose-500")}>
                                                            <Users2 size={18} /> 位: {tour.可售機位}
                                                        </span>
                                                        <div className="text-right">
                                                            <span className="text-[22px] font-black text-orange-600 tracking-tight">${tour.直客成人售價?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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
                            <p className="text-xs text-slate-400 font-medium tracking-tight">滑動左側把手調整行程顯示順序</p>
                        </div>
                    </div>
                </div>

                {products.length === 0 ? (
                    <div className="py-16 border-2 border-dashed border-slate-100 rounded-lg text-center text-slate-300 italic">尚未勾選產品...</div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={products.map(p => p.refCode)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                {selectedGroupedItems.map((group) => (
                                    <SortableGroupItem 
                                        key={group.refCode} 
                                        group={group} 
                                        onRemoveTour={(ref: string, id: string) => onUpdate(ref, id, false)}
                                        getFullImageUrl={getFullImageUrl}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}