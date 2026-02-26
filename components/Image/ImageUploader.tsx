'use client';

import React, { ChangeEvent, useCallback, useId, useState } from 'react';
import { toast } from "sonner" // ✅ 已改用 sonner
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    KeyboardSensor,
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
import { UploadCloud } from 'lucide-react';

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
    // ❌ 移除 const { toast } = useToast(); 
    
    const [isUploading, setIsUploading] = useState(false);
    const uploaderId = useId();
    const inputId = id || uploaderId;

    const showUploadArea = value.length < maxCount;

    const validateImageSize = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                if (
                    requiredSize &&
                    (img.width !== requiredSize.width ||
                        img.height !== requiredSize.height)
                ) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            img.src = URL.createObjectURL(file);
        });
    };

    const uploadSingleImage = useCallback(
        async (file: File): Promise<ImageItem | null> => {
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'content-type': file.type },
                    body: file,
                });
                if (!res.ok) throw new Error('上傳失敗');
                const { url } = await res.json();
                return { url, name: file.name };
            } catch (err) {
                
                toast.error('上傳失敗', {
                    description: `${file.name} 無法上傳`,
                });
                return null;
            }
        },
        []
    );

    const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        show();

        let currentImages = [...value];
        const uploaded: ImageItem[] = [];

        if (maxCount === 1 && currentImages.length === 1) {
            currentImages = [];
        }

        for (const file of files) {
            if (currentImages.length + uploaded.length >= maxCount) break;

            if (file.size / 1024 / 1024 > 50) {
                
                toast.error('檔案過大', {
                    description: `${file.name} 超過 50MB`,
                });
                continue;
            }

            const validSize = await validateImageSize(file);
            if (!validSize) {
                
                toast.error('圖片尺寸不符', {
                    description: `必須是 ${requiredSize?.width}x${requiredSize?.height}`,
                });
                continue;
            }

            const item = await uploadSingleImage(file);
            if (item) uploaded.push(item);
        }

        if (uploaded.length > 0) {
            const newList = [...currentImages, ...uploaded].slice(0, maxCount);
            onChange(newList);
        }

        setIsUploading(false);
        hide();
        e.target.value = '';
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = value.findIndex((i) => i.url === active.id);
        const newIndex = value.findIndex((i) => i.url === over.id);
        onChange(arrayMove(value, oldIndex, newIndex));
    };

    return (
        <div className={cn("w-full", className)}>
            {showUploadArea && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "group flex flex-col items-center justify-center w-full transition-all duration-200 cursor-pointer",
                        "min-h-[140px] rounded-xl",
                        "hover:bg-blue-50/50" 
                    )}
                >
                    <div className="flex flex-col items-center text-center p-4">
                        <UploadCloud className="h-8 w-8 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        <p className="text-sm font-bold text-slate-700 mb-1">
                            {isUploading ? '正在處理中...' : '點擊或拖放影像至此'}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            支援 JPG, PNG, WEBP (最大 50MB) 
                            {maxCount > 1 ? ` · 最多 ${maxCount} 張` : ' · 最多 1 張'}
                            {requiredSize && (
                                <span className="block mt-0.5 text-blue-500/80 font-medium">
                                    建議尺寸: {requiredSize.width} x {requiredSize.height} px
                                </span>
                            )}
                        </p>
                    </div>
                </label>
            )}

            <input
                id={inputId}
                type="file"
                className="hidden"
                accept="image/*"
                multiple={maxCount > 1}
                onChange={handleFileInput}
            />

            {value.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={value.map((img) => img.url)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={cn("space-y-3", showUploadArea && "mt-4")}>
                            {value.map((img) => (
                                <SortableRow
                                    key={img.url}
                                    id={img.url}
                                    data={img}
                                    onDelete={() => {
                                        onChange(value.filter((i) => i.url !== img.url));
                                    }}
                                    onTogglePrimary={() => {
                                        const updated = value.map((i) => {
                                            if (i.url === img.url) return { ...i, isPrimary: !i.isPrimary };
                                            return { ...i, isPrimary: false };
                                        });
                                        const primary = updated.find((i) => i.isPrimary);
                                        const others = updated.filter((i) => !i.isPrimary);
                                        onChange(primary ? [primary, ...others] : others);
                                    }}
                                    showPrimaryButton={showPrimaryButton}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}