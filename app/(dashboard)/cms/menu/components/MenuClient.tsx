'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useLoadingStore } from '@/stores/useLoadingStore';

const SortableTreeAny = dynamic(
    () => import('dnd-kit-sortable-tree').then((m) => m.SortableTree),
    { ssr: false }
) as unknown as React.ComponentType<any>;

import MenuTreeItem from '../components/MenuTreeItem';
import { transformToTreeItems, flattenTree } from '../lib/menuTreeUtils';
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

export default function MenuClient() {
    // ❌ 移除 const { toast } = useToast(); 
    const { show, hide } = useLoadingStore();

    const [items, setItems] = useState<any[]>([]);
    const [ready, setReady] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    
    // 基本欄位
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    // GA / GTM 欄位
    const [newGaEvent, setNewGaEvent] = useState(''); 
    const [newGaEventName, setNewGaEventName] = useState('');
    const [newGaCategory, setNewGaCategory] = useState('');
    const [newGaLabel, setNewGaLabel] = useState('');

    const mergeCollapsed = useCallback((prev: any[], next: any[]) => {
        const map = new Map(prev.map((n) => [n.id, n]));
        return next.map((n) => {
            const p = map.get(n.id);
            return p && 'collapsed' in p ? { ...n, collapsed: p.collapsed } : n;
        });
    }, []);

    const fetchMenu = useCallback(
        async (opts: { silent?: boolean; signal?: AbortSignal } = {}) => {
            const { silent = false, signal } = opts;
            try {
                if (silent) setIsRefreshing(true);
                else show();
                setErrMsg(null);

                const res = await fetch('/api/menu', {
                    signal,
                    cache: 'no-store',
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const next = transformToTreeItems(json.data);

                setItems((prev) =>
                    silent ? mergeCollapsed(prev, next) : next
                );
            } catch (e: any) {
                if (e?.name !== 'AbortError') {
                    console.error('載入選單失敗:', e);
                    setErrMsg('載入選單失敗，請稍後重試');
                }
            } finally {
                if (silent) setIsRefreshing(false);
                else hide();
                setReady(true);
            }
        },
        [mergeCollapsed, show, hide]
    );

    useEffect(() => {
        const ac = new AbortController();
        fetchMenu({ signal: ac.signal });

        const onChanged = () => fetchMenu({ silent: true });
        window.addEventListener('menu:changed', onChanged);

        return () => {
            ac.abort();
            window.removeEventListener('menu:changed', onChanged);
        };
    }, [fetchMenu]);

    const handleItemsChanged = async (newItems: any[]) => {
        const oldFlat = flattenTree(items);
        const newFlat = flattenTree(newItems);

        const hasOrderChanged = newFlat.some((n) => {
            const o = oldFlat.find((x) => x.id === n.id);
            return !o || o.parentId !== n.parentId || o.order !== n.order;
        });

        setItems(newItems);

        if (!hasOrderChanged) return;

        show();

        try {
            const payload = newFlat.map((item: any) => ({
                id: String(item.id),
                parentId: item.parentId ?? null,
                order: item.order,
            }));
            
            const res = await fetch('/api/menu/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // ✅ Sonner 語法
            toast.success('順序已更新');

            await fetchMenu({ silent: true });
        } catch (e) {
            console.error('更新選單順序失敗:', e);
            // ✅ Sonner 語法
            toast.error('排序失敗', {
                description: '請稍後再試'
            });
        } finally {
            hide();
        }
    };

    const handleCreate = async () => {
        try {
            setCreating(true);
            const res = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription || null,
                    linkUrl: newLinkUrl || null,
                    imageUrl: newImageUrl || null,
                    parentId: null,
                    gaEvent: newGaEvent || null,
                    gaEventName: newGaEventName || null,
                    gaCategory: newGaCategory || null,
                    gaLabel: newGaLabel || null,
                }),
            });

            const payload = await res.json();
            if (!res.ok) throw new Error(payload?.message || '建立失敗');

            // ✅ Sonner 語法
            toast.success('已新增選單');

            setCreateOpen(false);
            setNewTitle('');
            setNewDescription('');
            setNewLinkUrl('');
            setNewImageUrl('');
            setNewGaEvent('');
            setNewGaEventName('');
            setNewGaCategory('');
            setNewGaLabel('');

            fetchMenu({ silent: true });
        } catch (err: any) {
            // ✅ Sonner 語法
            toast.error('新增失敗', {
                description: err?.message || '請稍後再試'
            });
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">可摺疊拖曳選單</h1>
                    {isRefreshing && (
                        <span className="inline-flex items-center text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            同步中…
                        </span>
                    )}
                </div>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">新增選單</Button>
                    </DialogTrigger>
                    <DialogContent 
                        className="w-[95vw] sm:max-w-[520px] md:max-w-[720px] lg:max-w-[840px] max-h-[85vh] overflow-y-auto"
                        onInteractOutside={(e) => {
                            e.preventDefault();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle>新增選單</DialogTitle>
                            <DialogDescription>
                                建立新的選單項目（預設為根層）。
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* 左側 */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">基本資訊</h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-title">標題 <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="new-title"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="例如：關於我們"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-description">敘述 (選填)</Label>
                                    <Textarea
                                        id="new-description"
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                        placeholder="例如：認識大榮的歷史與願景"
                                        className="resize-none h-20"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-link">連結網址</Label>
                                    <Input
                                        id="new-link"
                                        value={newLinkUrl}
                                        onChange={(e) => setNewLinkUrl(e.target.value)}
                                        placeholder="例如 /about 或 https://..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>圖片上傳</Label>
                                    <SingleImageUploader
                                        value={newImageUrl}
                                        onChange={(url) => setNewImageUrl(url || '')}
                                    />
                                </div>
                            </div>

                            {/* 右側 */}
                            <div className="space-y-4 md:border-l md:pl-6">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">GA / GTM 追蹤設定</h3>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-gaEvent">Event (事件類型)</Label>
                                    <Input
                                        id="new-gaEvent"
                                        value={newGaEvent}
                                        onChange={(e) => setNewGaEvent(e.target.value)}
                                        placeholder="預設: ga-click"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-gaEventName">Event Name (GA4 事件名稱)</Label>
                                    <Input
                                        id="new-gaEventName"
                                        value={newGaEventName}
                                        onChange={(e) => setNewGaEventName(e.target.value)}
                                        placeholder="例如: nav_click"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-gaCategory">Category (事件類別)</Label>
                                    <Input
                                        id="new-gaCategory"
                                        value={newGaCategory}
                                        onChange={(e) => setNewGaCategory(e.target.value)}
                                        placeholder="例如: Navbar"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-gaLabel">Label (事件標籤)</Label>
                                    <Input
                                        id="new-gaLabel"
                                        value={newGaLabel}
                                        onChange={(e) => setNewGaLabel(e.target.value)}
                                        placeholder="例如: Header Menu"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild disabled={creating}>
                                <Button variant="outline">取消</Button>
                            </DialogClose>
                            <Button onClick={handleCreate} disabled={creating || !newTitle}>
                                {creating ? '建立中…' : '建立'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {errMsg && <p className="text-red-600 mb-4">{errMsg}</p>}

            {ready && !errMsg && (
                <SortableTreeAny
                    items={items}
                    onItemsChanged={handleItemsChanged}
                    TreeItemComponent={MenuTreeItem as any}
                />
            )}
        </div>
    );
}