'use client';

import { useId, useCallback } from 'react';
import ImageUploader, { ImageItem } from './ImageUploader';
import { toast } from 'sonner';
import { deleteFromVercelBlob } from '@/lib/deleteFromVercelBlob';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface SingleImageUploaderProps {
    id?: string;
    value?: string;
    onChange: (url?: string) => void;
    requiredSize?: { width: number; height: number };
    label?: string;
    error?: string;
}

export default function SingleImageUploader({
    id,
    value,
    onChange,
    requiredSize,
    label,
    error,
}: SingleImageUploaderProps) {
    const uploaderId = useId();
    const inputId = id || uploaderId;

    const handleDelete = useCallback(
        async (url: string) => {
            // 【修正 1】將 undefined 改為空字串，符合 Zod 的 string 驗證，解決報錯
            // 並且這會讓 currentValue 變回空陣列，促使 ImageUploader 變回上傳狀態
            onChange('');

            try {
                // 在背景安靜地刪除 Vercel Blob 檔案
                await deleteFromVercelBlob(url);
                toast.success('圖片已從伺服器移除');
            } catch (err: any) {
                console.error('Blob delete error:', err);
                // 就算失敗也不要恢復 UI，避免使用者以為沒刪掉又點一次
            }
        },
        [onChange]
    );

    const handleUploadChange = (arr: ImageItem[]) => {
        // 當 SortableRow 的 onDelete 被觸發，arr 會變為 []
        if (arr.length === 0) {
            if (value && value !== '') {
                handleDelete(value);
            }
            return;
        }

        const newFile = arr[0];
        if (newFile?.url) {
            onChange(newFile.url);
        }
    };

    // 【修正 2】當 value 為空字串時，不顯示圖片列表
    const currentValue: ImageItem[] =
        value && value !== '' ? [{ url: value, name: '已上傳圖片' }] : [];

    return (
        <div className="group flex flex-col w-full">
            {label && (
                <Label
                    className={cn(
                        'text-[11px] font-bold uppercase tracking-wider mb-2 ml-1',
                        error ? 'text-red-500' : 'text-slate-500'
                    )}
                >
                    {label}{' '}
                    {requiredSize && (
                        <span>
                            ({requiredSize.width}x{requiredSize.height})
                        </span>
                    )}
                </Label>
            )}

            <div className="relative w-full">
                <ImageUploader
                    // 【修正 3】key 必須包含 value 的有無狀態，確保刪除時徹底重置組件
                    key={`${inputId}-${!!value}`}
                    id={inputId}
                    value={currentValue}
                    onChange={handleUploadChange}
                    maxCount={1}
                    requiredSize={requiredSize}
                    showPrimaryButton={false}
                    className={cn(error && 'border-red-500 bg-red-50/30')}
                />

                {error && (
                    <div className="mt-2 flex items-center gap-1 text-red-500 text-[10px] font-bold animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={12} />
                        {/* 如果錯誤訊息是 Zod 預設的，可在此做轉譯 */}
                        <span>
                            {error === 'Required' ? '此欄位必填' : error}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
