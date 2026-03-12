'use client';

import React, { ChangeEvent, useCallback, useId, useState } from 'react';
import { toast } from "sonner";
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableRow from './SortableRow';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { cn } from '@/lib/utils';
import { UploadCloud, ImagePlus, Loader2 } from 'lucide-react';

export interface ImageItem {
    url: string;
    name: string;
    desc?: string;
    isPrimary?: boolean;
}

interface Props {
    id?: string;
    value: ImageItem[];
    onChange: (images: ImageItem[]) => void;
    maxCount?: number;
    requiredSize?: { width: number; height: number };
    showPrimaryButton?: boolean;
    className?: string;
}

export default function ImageUploader({
    id,
    value,
    onChange,
    maxCount = 10,
    requiredSize,
    showPrimaryButton = true,
    className
}: Props) {
    const { show, hide } = useLoadingStore();
    const [isUploading, setIsUploading] = useState(false);
    const uploaderId = useId();
    const inputId = id || uploaderId;

    const validateImageSize = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const isValid = !requiredSize || (img.width === requiredSize.width && img.height === requiredSize.height);
                URL.revokeObjectURL(img.src);
                resolve(isValid);
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const uploadSingleImage = async (file: File): Promise<ImageItem> => {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'content-type': file.type },
            body: file,
        });
        if (!res.ok) throw new Error(`${file.name} 上傳失敗`);
        const { url } = await res.json();
        return { url, name: file.name };
    };

    const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const limit = maxCount - (maxCount === 1 ? 0 : value.length);
        const filesToProcess = files.slice(0, limit);

        setIsUploading(true);
        show();

        try {
            // 並行驗證與上傳
            const uploadPromises = filesToProcess.map(async (file) => {
                if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} 超過 50MB`);
                const validSize = await validateImageSize(file);
                if (!validSize) throw new Error(`${file.name} 尺寸不符 (${requiredSize?.width}x${requiredSize?.height})`);
                return uploadSingleImage(file);
            });

            const results = await Promise.allSettled(uploadPromises);
            const successfulUploads: ImageItem[] = [];

            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    successfulUploads.push(result.value);
                } else {
                    toast.error('處理失敗', { description: result.reason.message });
                }
            });

            if (successfulUploads.length > 0) {
                const newList = maxCount === 1 
                    ? successfulUploads 
                    : [...value, ...successfulUploads];
                onChange(newList.slice(0, maxCount));
            }
        } finally {
            setIsUploading(false);
            hide();
            e.target.value = '';
        }
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = value.findIndex((i) => i.url === active.id);
        const newIndex = value.findIndex((i) => i.url === over.id);
        onChange(arrayMove(value, oldIndex, newIndex));
    };

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* 上傳區域 */}
            {value.length < maxCount && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "group relative flex flex-col items-center justify-center w-full min-h-[140px]",
                        "border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50",
                        "hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer",
                        isUploading && "opacity-60 cursor-not-allowed"
                    )}
                >
                    <div className="flex flex-col items-center text-center p-6">
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 mb-3 text-blue-500 animate-spin" />
                        ) : (
                            <UploadCloud className="h-8 w-8 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        )}
                        <p className="text-sm font-bold text-slate-700">
                            {isUploading ? '正在上傳中...' : '點擊或拖放影像至此'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                            支援 JPG, PNG (最大 50MB) 
                            {requiredSize && <span className="text-blue-500 block">需求尺寸: {requiredSize.width}x{requiredSize.height}</span>}
                        </p>
                    </div>
                </label>
            )}

            <input id={inputId} type="file" className="hidden" accept="image/*" multiple={maxCount > 1} onChange={handleFileInput} disabled={isUploading} />

            {/* 列表區域 */}
            {value.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={value.map((img) => img.url)} strategy={verticalListSortingStrategy}>
                        <div className="grid gap-3">
                            {value.map((img) => (
                                <SortableRow
                                    key={img.url}
                                    id={img.url}
                                    data={img}
                                    onDelete={() => onChange(value.filter((i) => i.url !== img.url))}
                                    onTogglePrimary={() => {
                                        const updated = value.map((i) => ({ ...i, isPrimary: i.url === img.url }));
                                        onChange([updated.find(i => i.isPrimary)!, ...updated.filter(i => !i.isPrimary)]);
                                    }}
                                    showPrimaryButton={showPrimaryButton && maxCount > 1}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}