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

    const handleDelete = useCallback(async (url: string) => {
        try {
            await deleteFromVercelBlob(url);
            onChange(undefined);
            toast.success('圖片已移除');
        } catch (err: any) {
            toast.error('移除失敗', { description: '請重試' });
        }
    }, [onChange]);

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
                    {label}
                </Label>
            )}
            <div className="relative w-full transition-all duration-200">
                
                <div className="w-full h-full">
                    <ImageUploader
                        key={id || uploaderId}
                        id={id || uploaderId}
                        value={currentValue}
                        onChange={async (arr) => {
                            if (arr.length === 0 && value) {
                                await handleDelete(value);
                            } else {
                                onChange(arr[0]?.url);
                            }
                        }}
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