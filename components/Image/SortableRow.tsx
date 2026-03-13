'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { GripVertical, Trash2, Star, Eye } from 'lucide-react';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
import { cn } from '@/lib/utils';

interface Props {
    id: string;
    data: { url: string; name: string; isPrimary?: boolean };
    onDelete: () => void;
    onTogglePrimary?: () => void;
    showPrimaryButton?: boolean;
}

export default function SortableRow({
    id,
    data,
    onDelete,
    onTogglePrimary,
    showPrimaryButton,
}: Props) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    if (!mounted) return null;

    const isPDF = data.url.toLowerCase().endsWith('.pdf');

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative flex flex-col bg-white border border-slate-100 rounded-md transition-all duration-300 shadow-sm overflow-hidden',
                'min-h-[300px]',
                isDragging && 'shadow-xl border-blue-400 ring-2 ring-blue-100 scale-[1.02]'
            )}
        >
            {/* 圖片顯示區域 */}
            <div className="relative flex-1 w-full bg-slate-50 flex items-center justify-center p-6">
                {isPDF ? (
                    <div className="flex flex-col items-center gap-4">
                        <BsFileEarmarkPdfFill className="size-24 text-red-500" />
                        <span className="text-sm font-medium text-slate-400">PDF 檔案</span>
                    </div>
                ) : (
                    <img
                        src={data.url}
                        alt={data.name}
                        className="max-w-full max-h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                    />
                )}

                {/* Hover 遮罩與操作按鈕 */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center gap-6">
                    {/* 移除按鈕 (垃圾桶) */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        className="p-4 bg-white hover:bg-red-500 hover:text-white text-slate-700 rounded-full shadow-xl transition-all transform translate-y-4 group-hover:translate-y-0"
                    >
                        <Trash2 size={20} />
                    </button>
                    
                    {/* 主要圖片設定 (星星) */}
                    {showPrimaryButton && !isPDF && (
                        <button
                            type="button"
                            onClick={onTogglePrimary}
                            className={cn(
                                "p-4 bg-white rounded-full shadow-xl transition-all transform translate-y-4 group-hover:translate-y-0 delay-75",
                                data.isPrimary ? "text-yellow-500" : "text-slate-700 hover:text-yellow-500"
                            )}
                        >
                            <Star size={28} fill={data.isPrimary ? 'currentColor' : 'none'} />
                        </button>
                    )}
                </div>
                
                {/* 拖曳手柄 - 浮現在左上角 */}
                {showPrimaryButton && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute top-6 left-6 p-2 bg-white/90 rounded-xl shadow-sm cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <GripVertical size={20} />
                    </div>
                )}
                
                {/* 主要圖片標籤 (Badge) */}
                {data.isPrimary && (
                    <div className="absolute top-6 right-6 px-3 py-1.5 bg-yellow-400 text-white text-[11px] font-bold rounded-full shadow-sm">
                        主要圖片
                    </div>
                )}
            </div>
        </div>
    );
}