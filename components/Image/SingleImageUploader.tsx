'use client';

import { useId, useCallback } from 'react';
import ImageUploader, { ImageItem } from './ImageUploader';
import { toast } from "sonner" 
import { deleteFromVercelBlob } from '@/lib/deleteFromVercelBlob';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCcw } from 'lucide-react';

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

    // 驗證圖片尺寸的輔助函式
    const validateImageSize = (url: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = url;
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
        });
    };

    const handleDelete = useCallback(async (url: string) => {
        try {
            await deleteFromVercelBlob(url);
            onChange(undefined);
            toast.success('圖片已移除');
        } catch (err: any) {
            toast.error('移除失敗', { description: '請重試' });
        }
    }, [onChange]);

    const handleUploadChange = async (arr: ImageItem[]) => {
        // 1. 如果是刪除行為
        if (arr.length === 0 && value) {
            await handleDelete(value);
            return;
        }

        const newFile = arr[0];
        if (!newFile?.url) return;

        // 2. 如果有設定尺寸限制，進行檢查
        if (requiredSize) {
            try {
                const size = await validateImageSize(newFile.url);
                if (size.width !== requiredSize.width || size.height !== requiredSize.height) {
                    await deleteFromVercelBlob(newFile.url);
                    toast.error("圖片尺寸不符合", {
                        description: `需求尺寸為 ${requiredSize.width}x${requiredSize.height}，目前為 ${size.width}x${size.height}`,
                    });
                    return;
                }
            } catch (err) {
                toast.error("無法讀取圖片尺寸資訊");
                return;
            }
        }

        // 3. 通過驗證，執行更新
        onChange(newFile.url);
    };

    const currentValue: ImageItem[] = value
        ? [{ url: value, name: value.split('/').pop() || '圖片' }]
        : [];

    return (
        <div className="group flex flex-col w-full">
            {label && (
                <Label className={cn(
                    "text-[11px] font-bold uppercase tracking-wider mb-2 ml-1 transition-colors",
                    error ? "text-red-500" : "text-slate-500 group-focus-within:text-blue-600"
                )}>
                    {label} {requiredSize && <span className="text-slate-400 font-normal">({requiredSize.width}x{requiredSize.height})</span>}
                </Label>
            )}
            <div className="relative w-full transition-all duration-200">
                <div className="w-full h-full">
                    <ImageUploader
                        key={id || uploaderId}
                        id={id || uploaderId}
                        value={currentValue}
                        onChange={handleUploadChange}
                        maxCount={1}
                        requiredSize={requiredSize}
                        showPrimaryButton={false}
                        className={cn(
                            "w-full h-full",
                            error && "border-red-500 bg-red-50/30"
                        )}
                    />
                </div>

                {error && (
                    <div className="absolute inset-0 z-20 bg-red-50/90 flex flex-col items-center justify-center animate-in fade-in rounded-xl border-2 border-red-200">
                        <AlertCircle className="text-red-500 size-6 mb-2" />
                        <button 
                            type="button"
                            onClick={() => onChange(undefined)}
                            className="flex items-center gap-2 px-3 py-1 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                            <RefreshCcw size={12} /> 重試
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}