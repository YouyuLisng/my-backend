'use client';

import React, { ChangeEvent, useCallback, useId, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import SortableRow from '../Image/SortableRow';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { deleteFromVercelBlob } from '@/lib/deleteFromVercelBlob';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';

export interface PDFItem {
    url: string;
    name: string;
}

interface Props {
    id?: string;
    value: PDFItem[];
    onChange: (pdfs: PDFItem[]) => void;
    maxCount?: number;
}

export default function PDFUploader({
    id,
    value,
    onChange,
    maxCount = 10,
}: Props) {
    const { show, hide } = useLoadingStore();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const uploaderId = useId();
    const inputId = id || uploaderId;

    /* ----------------------------
       📤 上傳 PDF
    ---------------------------- */
    const uploadSinglePDF = useCallback(
        async (file: File): Promise<PDFItem | null> => {
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
                toast({
                    variant: 'destructive',
                    title: '上傳失敗',
                    description: `${file.name} 上傳時發生問題`,
                });
                return null;
            }
        },
        [toast]
    );

    /* ----------------------------
       🗑 刪除 Vercel Blob
    ---------------------------- */
    const deleteOldPDF = useCallback(async (url: string) => {
        try {
            await deleteFromVercelBlob(url);
        } catch {
            console.warn('刪除 PDF 失敗');
        }
    }, []);

    /* ----------------------------
       📥 處理 PDF 上傳
    ---------------------------- */
    const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        show();

        let current = [...value];
        const uploaded: PDFItem[] = [];

        // 單檔模式 → 覆蓋 PDF
        if (maxCount === 1 && current.length === 1) {
            await deleteOldPDF(current[0].url);
            current = [];
        }

        for (const file of files) {
            if (file.type !== 'application/pdf') {
                toast({
                    variant: 'destructive',
                    title: '格式錯誤',
                    description: `${file.name} 不是 PDF`,
                });
                continue;
            }

            if (file.size / 1024 / 1024 > 50) {
                toast({
                    variant: 'destructive',
                    title: '檔案過大',
                    description: `${file.name} 超過 50MB`,
                });
                continue;
            }

            const item = await uploadSinglePDF(file);
            if (item) uploaded.push(item);
        }

        if (uploaded.length > 0) {
            const newList = [...current, ...uploaded].slice(0, maxCount);
            onChange(newList);

            toast({
                title: '上傳完成',
                description: `成功上傳 ${uploaded.length} 份 PDF`,
            });
        }

        setIsUploading(false);
        hide();
        e.target.value = '';
    };

    /* ----------------------------
       ↕ 拖曳排序設定
    ---------------------------- */
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

    /* ----------------------------
       🖼 PDF 列表渲染（含 PDF ICON）
    ---------------------------- */
    return (
        <div className="space-y-4">
            {/* 上傳按鈕 */}
            <label
                htmlFor={inputId}
                className="group flex h-32 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100 transition"
            >
                <div className="flex flex-col items-center text-slate-500">
                    <BsFileEarmarkPdfFill className="w-10 h-10 text-red-600" />
                    <p className="text-sm">
                        {isUploading ? '上傳中...' : '點擊上傳 PDF'}
                    </p>

                    <p className="text-xs text-slate-400">
                        PDF up to 50MB · 最多 {maxCount} 份
                    </p>
                </div>
            </label>

            <input
                id={inputId}
                type="file"
                className="hidden"
                accept="application/pdf"
                multiple={maxCount > 1}
                onChange={handleFileInput}
            />

            {/* PDF 列表 */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={value.map((pdf) => pdf.url)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {value.map((pdf) => (
                            <SortableRow
                                key={pdf.url}
                                id={pdf.url}
                                data={{
                                    name: pdf.name,
                                    url: pdf.url,
                                    isPrimary: false,
                                    icon: 'pdf',
                                }}
                                showPrimaryButton={false}
                                onDelete={async () => {
                                    await deleteOldPDF(pdf.url);
                                    onChange(value.filter((i) => i.url !== pdf.url));
                                }}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
