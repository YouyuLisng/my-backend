'use client';

import React, { useMemo, useState } from 'react';
import {
    SimpleTreeItemWrapper,
    TreeItemComponentProps,
} from 'dnd-kit-sortable-tree';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner" // ✅ 已改用 sonner
import SingleImageUploader from '@/components/Image/SingleImageUploader';

// 定義資料結構
type MinimalTreeItemData = {
    value: string;
    description?: string;
    linkUrl?: string;
    imageUrl?: string;
    parentId?: string | null;
    gaEvent?: string;
    gaEventName?: string;
    gaCategory?: string;
    gaLabel?: string;
};

const MenuTreeItem = React.forwardRef<
    HTMLDivElement,
    TreeItemComponentProps<MinimalTreeItemData>
>((props, ref) => {
    const { item } = props;
    const id = useMemo(() => String(item.id), [item.id]);
    
    // ❌ 移除 const { toast } = useToast(); 

    // Dialog 開關狀態
    const [editOpen, setEditOpen] = useState(false);
    const [delOpen, setDelOpen] = useState(false);

    // 表單狀態
    const [title, setTitle] = useState(item.value ?? '');
    const [description, setDescription] = useState(item.description ?? '');
    const [linkUrl, setLinkUrl] = useState(item.linkUrl ?? '');
    const [imageUrl, setImageUrl] = useState(item.imageUrl ?? '');

    // GA 狀態
    const [gaEvent, setGaEvent] = useState(item.gaEvent ?? '');
    const [gaEventName, setGaEventName] = useState(item.gaEventName ?? '');
    const [gaCategory, setGaCategory] = useState(item.gaCategory ?? '');
    const [gaLabel, setGaLabel] = useState(item.gaLabel ?? '');

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ✅ 事件阻擋函式
    const stopPropagation = (e: React.SyntheticEvent) => {
        e.stopPropagation();
    };

    // ✅ 處理網址顯示邏輯
    const getDisplayUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        const baseUrl = 'https://www.dtsgroup.com.tw';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${path}`;
    };

    // 當 Dialog 打開時，重置表單資料為當前 item 的值
    const handleOpenChange = (open: boolean) => {
        setEditOpen(open);
        if (open) {
            setTitle(item.value ?? '');
            setDescription(item.description ?? '');
            setLinkUrl(item.linkUrl ?? '');
            setImageUrl(item.imageUrl ?? '');
            setGaEvent(item.gaEvent ?? '');
            setGaEventName(item.gaEventName ?? '');
            setGaCategory(item.gaCategory ?? '');
            setGaLabel(item.gaLabel ?? '');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const currentParentId = item.parentId ?? null;

            const res = await fetch(`/api/menu/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: description || null,
                    linkUrl: linkUrl || null,
                    imageUrl: imageUrl || null,
                    parentId: currentParentId,
                    gaEvent: gaEvent || null,
                    gaEventName: gaEventName || null,
                    gaCategory: gaCategory || null,
                    gaLabel: gaLabel || null,
                }),
            });

            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload?.message || `HTTP ${res.status}`);

            // 更新本地 item 資料
            item.value = title;
            item.description = description;
            item.linkUrl = linkUrl;
            item.imageUrl = imageUrl;
            item.parentId = currentParentId;
            item.gaEvent = gaEvent;
            item.gaEventName = gaEventName;
            item.gaCategory = gaCategory;
            item.gaLabel = gaLabel;

            // ✅ Sonner 語法
            toast.success('更新成功');
            setEditOpen(false);
        } catch (err: any) {
            console.error('❌ 更新失敗:', err);
            // ✅ Sonner 語法
            toast.error('更新失敗', { description: err?.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // ✅ Sonner 語法
            toast.success('已刪除');
            window.dispatchEvent(new CustomEvent('menu:changed'));
            setDelOpen(false);
        } catch (err: any) {
            console.error('刪除失敗:', err);
            // ✅ Sonner 語法
            toast.error('刪除失敗', { description: err?.message });
        } finally {
            setDeleting(false);
        }
    };

    return (
        <SimpleTreeItemWrapper {...props} ref={ref}>
            <div className="p-2 cursor-pointer flex justify-between items-center w-full">
                {/* 列表內容顯示區塊 */}
                <div className="flex items-center gap-3">
                    {item.imageUrl && (
                        <img 
                            src={item.imageUrl} 
                            alt={item.value} 
                            className="w-10 h-10 object-cover rounded bg-gray-100" 
                        />
                    )}
                    <div>
                        <div className="font-medium text-sm">{item.value}</div>
                        <div className="flex flex-col text-xs text-gray-500">
                            {item.linkUrl && (
                                <span 
                                    className="truncate max-w-[200px]" 
                                    title={getDisplayUrl(item.linkUrl)} 
                                >
                                    {getDisplayUrl(item.linkUrl)}
                                </span>
                            )}
                            {item.gaEventName && <span className="text-purple-600">GTM: {item.gaEventName}</span>}
                        </div>
                    </div>
                </div>

                {/* 按鈕操作區塊 */}
                <div 
                    className="flex gap-2"
                    onPointerDown={stopPropagation}
                    onMouseDown={stopPropagation}
                    onClick={stopPropagation}
                    onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') {
                            e.stopPropagation();
                        }
                    }}
                >
                    {/* === 編輯 Dialog === */}
                    <Dialog open={editOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 px-2">編輯</Button>
                        </DialogTrigger>
                        
                        <DialogContent className="w-[95vw] sm:max-w-[520px] md:max-w-[720px] lg:max-w-[840px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>編輯選單</DialogTitle>
                                <DialogDescription>修改選單資訊後儲存。</DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid gap-6 md:grid-cols-2 mt-4">
                                {/* 左側：基本資訊 */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">基本資訊</h3>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`title-${id}`}>標題</Label>
                                        <Input id={`title-${id}`} value={title} onChange={(e) => setTitle(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`description-${id}`}>敘述 (選填)</Label>
                                        <Textarea id={`description-${id}`} value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none h-20" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`link-${id}`}>連結網址</Label>
                                        <Input id={`link-${id}`} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/about 或 https://..." />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>圖片上傳</Label>
                                        <SingleImageUploader
                                            value={imageUrl}
                                            onChange={(url) => setImageUrl(url || '')}
                                        />
                                    </div>
                                </div>

                                {/* 右側：追蹤設定 */}
                                <div className="space-y-4 md:border-l md:pl-6">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">GA / GTM 追蹤設定</h3>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`gaEvent-${id}`}>Event</Label>
                                        <Input id={`gaEvent-${id}`} value={gaEvent} onChange={(e) => setGaEvent(e.target.value)} placeholder="預設: ga-click" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`gaEventName-${id}`}>Event Name</Label>
                                        <Input id={`gaEventName-${id}`} value={gaEventName} onChange={(e) => setGaEventName(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`gaCategory-${id}`}>Category</Label>
                                        <Input id={`gaCategory-${id}`} value={gaCategory} onChange={(e) => setGaCategory(e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`gaLabel-${id}`}>Label</Label>
                                        <Input id={`gaLabel-${id}`} value={gaLabel} onChange={(e) => setGaLabel(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <DialogClose asChild disabled={saving}>
                                    <Button variant="outline">取消</Button>
                                </DialogClose>
                                <Button onClick={handleSave} disabled={saving || !title}>
                                    {saving ? '儲存中…' : '儲存'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* === 刪除 Dialog === */}
                    <Dialog open={delOpen} onOpenChange={setDelOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="h-8 px-2">刪除</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>確認刪除</DialogTitle>
                                <DialogDescription>此操作無法復原，確定要刪除此項目嗎？</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild disabled={deleting}>
                                    <Button variant="outline">取消</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? '刪除中…' : '刪除'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </SimpleTreeItemWrapper>
    );
});

MenuTreeItem.displayName = 'MenuTreeItem';
export default MenuTreeItem;