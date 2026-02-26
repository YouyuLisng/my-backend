'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { toast } from "sonner" // ✅ 1. 已改用 sonner
import PDFViewerFullScreen from '@/components/PDF/PDFViewerFullScreen';
import { FileSearch, Loader2 } from 'lucide-react';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
// ✅ 引入 Store
import { useLoadingStore } from '@/stores/useLoadingStore';

interface Props {
    id: string;
    data: {
        url: string;
        name: string;
        desc?: string;
        isPrimary?: boolean;
        icon?: 'pdf' | 'image';
    };
    onDelete: () => void;
    onTogglePrimary?: () => void;
    showPrimaryButton?: boolean;
}

export default function SortableRow({
    id,
    data,
    onDelete,
    onTogglePrimary,
    showPrimaryButton = true,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // ❌ 移除 const { toast } = useToast(); 
    
    const { show, hide } = useLoadingStore();
    
    const [preview, setPreview] = useState(false);
    const [deleting, setDeleting] = useState(false); // 按鈕轉圈狀態
    const [deleted, setDeleted] = useState(false);   // 刪除成功，觸發淡出動畫

    const fileName = decodeURIComponent(
        data.name || data.url.split('/').pop() || ''
    );

    const isPDF =
        data.icon === 'pdf' ||
        data.url.toLowerCase().endsWith('.pdf') ||
        data.name.toLowerCase().endsWith('.pdf');

    const handleDelete = async () => {
        if (deleting || deleted) return;

        // 1. 開啟 Loading (全站 + 局部)
        show();
        setDeleting(true);

        try {
            const res = await fetch('/api/blob/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: data.url }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || '刪除失敗');
            }

            // 2. API 成功，關閉全站 Loading
            hide();

            // 3. 設定 deleted 狀態，觸發 CSS 動畫
            setDeleted(true);

            // 4. 等待動畫結束後移除資料並提示
            setTimeout(() => {
                onDelete();
                // ✅ Sonner 語法
                toast.success('檔案已刪除');
            }, 300);

        } catch (error: any) {
            hide();
            setDeleting(false);
            // ✅ Sonner 語法
            toast.error('刪除失敗', {
                description: error.message,
            });
        }
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out ${
                    deleted 
                        ? 'opacity-0 translate-x-4 pointer-events-none scale-95' 
                        : 'opacity-100 scale-100'
                }`}
            >
                {/* 左側：拖曳 + 預覽 */}
                <div
                    className="flex items-center gap-3 flex-1 cursor-grab active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    {isPDF ? (
                        <div
                            className="relative w-[60px] h-[60px] flex-shrink-0 rounded-md bg-red-100 border border-red-300 flex items-center justify-center cursor-pointer"
                            onClick={() => !deleting && setPreview(true)}
                        >
                            <BsFileEarmarkPdfFill className="w-10 h-10 text-red-600" />
                        </div>
                    ) : (
                        <div className="relative w-[100px] h-[100px] flex-shrink-0 rounded-md overflow-hidden border bg-slate-50 flex items-center justify-center">
                            <img
                                src={data.url}
                                alt={data.name}
                                className="w-full h-full object-contain p-1"
                                loading="lazy"
                            />

                            {data.isPrimary && (
                                <span className="absolute -top-2 -left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow z-10">
                                    封面
                                </span>
                            )}
                        </div>
                    )}

                    <div
                        className={`truncate ${isPDF ? 'cursor-pointer' : ''}`}
                        onClick={() => isPDF && !deleting && setPreview(true)}
                    >
                        <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                            {fileName}
                        </p>
                    </div>
                </div>

                {/* 右側操作 */}
                <div className="flex gap-3 pl-4 items-center">
                    {isPDF && (
                        <button
                            type="button"
                            onClick={() => setPreview(true)}
                            className="text-gray-500 hover:text-blue-600 transition"
                            title="預覽 PDF"
                            disabled={deleting}
                        >
                            <FileSearch className="w-5 h-5" />
                        </button>
                    )}

                    {!isPDF && showPrimaryButton && (
                        <button
                            type="button"
                            onClick={onTogglePrimary}
                            className={`text-xl transition ${
                                data.isPrimary
                                    ? 'text-yellow-500'
                                    : 'text-gray-400 hover:text-yellow-400'
                            }`}
                            title="設為封面"
                            disabled={deleting}
                        >
                            ★
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`transition flex items-center justify-center w-6 h-6 ${
                            deleting
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-400 hover:text-red-500'
                        }`}
                        title="刪除"
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            '✕'
                        )}
                    </button>
                </div>
            </div>

            {/* PDF Viewer */}
            {preview && (
                <PDFViewerFullScreen
                    url={data.url}
                    fileName={fileName}
                    onClose={() => setPreview(false)}
                />
            )}
        </>
    );
}