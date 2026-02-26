'use client';

import React, { useId, useCallback } from 'react';
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
    // ❌ 移除 const { toast } = useToast(); 

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
            
            {/* 只保留這一層外框 */}
            <div className={cn(
                "relative rounded-xl border-2 transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center",
                !value && !error && "border-dashed border-slate-200 bg-slate-50/30 hover:bg-blue-50/50 hover:border-blue-300",
                value && "border-solid border-slate-200 bg-white",
                error && "border-solid border-red-200 bg-red-50/30",
                "focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-50"
            )}>
                
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
                        className="border-none bg-transparent shadow-none"
                    />
                </div>

                {error && (
                    <div className="absolute inset-0 z-20 bg-red-50/90 flex flex-col items-center justify-center animate-in fade-in">
                        <AlertCircle className="text-red-500 size-6 mb-2" />
                        <button 
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