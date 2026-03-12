'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { GripVertical, Trash2, Star } from 'lucide-react';
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
                'group flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl transition-all shadow-sm',
                isDragging && 'shadow-xl border-blue-400 ring-2 ring-blue-100'
            )}
        >
            {/* 只有在多圖模式下才顯示拖曳手柄 */}
            {showPrimaryButton ? (
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors"
                >
                    <GripVertical size={20} />
                </div>
            ) : (
                <div className="w-2" />
            )}

            {/* 縮圖 */}
            <div className="relative size-16 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                {isPDF ? (
                    <BsFileEarmarkPdfFill className="size-full p-3 text-red-500" />
                ) : (
                    <img
                        src={data.url}
                        alt={data.name}
                        className="size-full object-cover"
                    />
                )}
            </div>

            {/* 資訊 */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">
                    {decodeURIComponent(data.name)}
                </p>
            </div>

            {/* 按鈕組 */}
            <div className="flex items-center gap-1">
                {showPrimaryButton && !isPDF && (
                    <button
                        type="button"
                        onClick={onTogglePrimary}
                        className={cn(
                            'p-2 rounded-lg transition-colors',
                            data.isPrimary
                                ? 'text-yellow-500 bg-yellow-50'
                                : 'text-slate-300 hover:bg-slate-50 hover:text-yellow-500'
                        )}
                    >
                        <Star
                            size={18}
                            fill={data.isPrimary ? 'currentColor' : 'none'}
                        />
                    </button>
                )}
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(); // 直接通知父層
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
