'use client';

import SingleImageUploader from '@/components/Image/SingleImageUploader';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface PageBasicSettingsProps {
    data: any;
    onChange: (path: string, value: any) => void;
}

export default function PageBasicSettings({ data, onChange }: PageBasicSettingsProps) {
    const currentMode = data.mode || 'GRUPCD';

    return (
        <div className="space-y-6 p-6 border rounded-xl bg-white shadow-sm">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-bold text-slate-800">1. 頁面基本設定</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">啟用狀態</span>
                    <Switch 
                        checked={data.enabled} 
                        onCheckedChange={(val) => onChange('enabled', val)} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">頁面標題</label>
                    <Input 
                        value={data.title} 
                        onChange={(e) => onChange('title', e.target.value)} 
                        placeholder="輸入行銷頁面名稱"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">網址路徑 (Slug)</label>
                    <Input 
                        value={data.slug} 
                        onChange={(e) => onChange('slug', e.target.value)} 
                        placeholder="例如: japan-sale-2026"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">產品抓取模式</label>
                    <Select 
                        value={currentMode} 
                        onValueChange={(val) => onChange('mode', val)}
                    >
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="選擇抓取模式" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GRUPCD">團型模式 (按團型編號)</SelectItem>
                            <SelectItem value="ITEM">團體模式 (按具體團號)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 ml-1">
                        * 預設為團型模式，可輸入團型編號後勾選多個出發日期。
                    </p>
                </div>

                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <SingleImageUploader 
                        label="電腦版主圖 (Main Image)"
                        value={data.mainImage}
                        onChange={(url) => onChange('mainImage', url)}
                        requiredSize={{ width: 1920, height: 600 }}
                    />
                    <SingleImageUploader 
                        label="手機版主圖 (Mobile Image)"
                        value={data.mobileImage}
                        onChange={(url) => onChange('mobileImage', url)}
                        requiredSize={{ width: 800, height: 800 }}
                    />
                </div>
            </div>
        </div>
    );
}