'use client';

import React, { ChangeEvent, useId, useState, DragEvent, useCallback } from 'react';
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
import { Loader2, Image as ImageIcon } from 'lucide-react';

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
    const [isDragActive, setIsDragActive] = useState(false); // 追蹤拖曳狀態
    
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

    // 核心處理函式：不論拖放或點擊都走這裡
    const processFiles = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const limit = maxCount - (maxCount === 1 ? 0 : value.length);
        const filesToProcess = files.slice(0, limit);

        setIsUploading(true);
        show();

        try {
            const uploadPromises = filesToProcess.map(async (file) => {
                if (file.size > 50 * 1024 * 1024) throw new Error(`${file.name} 超過 50MB`);
                const validSize = await validateImageSize(file);
                if (!validSize) throw new Error(`${file.name} 尺寸不符`);
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
        }
    }, [value, maxCount, onChange, requiredSize, show, hide]);

    // --- 拖放事件處理 ---
    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isUploading) setIsDragActive(true);
    };

    const onDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        
        if (isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        // 過濾僅限圖片
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            processFiles(imageFiles);
        } else if (files.length > 0) {
            toast.error("請拖放圖片格式的檔案");
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processFiles(files);
        e.target.value = ''; 
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
            {value.length < maxCount && (
                <label
                    htmlFor={inputId}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={cn(
                        "group relative flex flex-col items-center justify-center w-full min-h-[300px]",
                        "bg-white rounded-md shadow-sm border border-slate-100",
                        "hover:shadow-md transition-all duration-300 cursor-pointer",
                        isDragActive && "border-blue-400 bg-blue-50/50 scale-[1.01] shadow-lg",
                        isUploading && "opacity-60 cursor-not-allowed"
                    )}
                >
                    <div className={cn(
                        "absolute inset-3 rounded-md border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300",
                        "border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/30",
                        isDragActive && "border-blue-400 bg-blue-100/20"
                    )}>
                        <div className="flex flex-col items-center text-center p-8">
                            {isUploading ? (
                                <Loader2 className="h-12 w-12 mb-4 text-blue-500 animate-spin" />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <h3 className={cn(
                                        "text-xl font-bold transition-colors mb-3",
                                        isDragActive ? "text-blue-600" : "text-slate-800"
                                    )}>
                                        {isDragActive ? "放開以開始上傳" : "將影像拖放到這裡"}
                                    </h3>
                                    <p className="text-sm text-slate-400 max-w-[320px] leading-relaxed mb-8">
                                        支援的檔案類型：JPG、PNG、GIF、WebP。<br />
                                        檔案大小上限為 50MB
                                    </p>
                                    <div className={cn(
                                        "px-10 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-semibold text-sm shadow-sm transition-all",
                                        !isDragActive && "group-hover:border-blue-400 group-hover:text-blue-600 group-hover:shadow"
                                    )}>
                                        選擇影像
                                    </div>
                                </div>
                            )}

                            {requiredSize && (
                                <div className="mt-6 flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-md">
                                    <ImageIcon size={14} className="text-blue-500" />
                                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-tight">
                                        需求尺寸: {requiredSize.width} x {requiredSize.height}
                                    </span>
                                </div>
                            )}
                        </div>
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
                disabled={isUploading} 
            />

            {value.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={value.map((img) => img.url)} strategy={verticalListSortingStrategy}>
                        <div className="grid gap-4">
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