'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BarChart3, Globe, Clock } from 'lucide-react';

interface MarketingMetaProps {
    data: any;
    onChange: (path: string, value: any) => void;
}

export default function MarketingMeta({ data, onChange }: MarketingMetaProps) {
    return (
        <div className="space-y-6 p-6 border rounded-xl bg-white shadow-sm mt-6">
            <h3 className="text-lg font-bold border-b pb-4 text-slate-800">3. 行銷與追蹤設定</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SEO Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <Globe size={16} className="text-blue-500" /> SEO 配置
                    </div>
                    <div className="space-y-3">
                        <Input 
                            placeholder="SEO 搜尋標題" 
                            value={data.seo?.title || ''}
                            onChange={(e) => onChange('seo.title', e.target.value)}
                            className="bg-slate-50/50"
                        />
                        <Textarea 
                            placeholder="SEO 網頁描述 (建議 160 字內)"
                            value={data.seo?.description || ''}
                            onChange={(e) => onChange('seo.description', e.target.value)}
                            className="bg-slate-50/50 min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Tracking Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <BarChart3 size={16} className="text-green-500" /> GA 追蹤代碼
                    </div>
                    <Input 
                        placeholder="例如: G-XXXXXXXXXX" 
                        value={data.tracking?.gaId || ''}
                        onChange={(e) => onChange('tracking.gaId', e.target.value)}
                        className="bg-slate-50/50"
                    />
                    <div className="p-4 rounded-lg bg-slate-50 border text-[11px] text-slate-500 leading-relaxed">
                        <p className="font-bold mb-1 italic underline">系統提示：</p>
                        設定後系統將自動在網頁 Header 插入對應的 Google Analytics 4 全域追蹤代碼。
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t flex flex-col sm:flex-row justify-between text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1">
                    <Clock size={10} /> 建立於: {data.createdAt ? new Date(data.createdAt).toLocaleString() : 'N/A'}
                </div>
                <div className="flex items-center gap-1">
                    最後更新: {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'N/A'}
                </div>
            </div>
        </div>
    );
}