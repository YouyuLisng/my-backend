'use client';
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface TinyEditorProps {
    value: string;
    onChange: (val: string) => void;
}

// TinyMCE 沒有直接輸出的 BlobInfo 型別，這裡自定義
interface BlobInfo {
    blob: () => Blob;
    filename: () => string;
}

export default function TinyEditor({ value, onChange }: TinyEditorProps) {
    const editorRef = useRef<TinyMCEEditor | null>(null);

    // 共用圖片上傳方法
    const uploadImage = async (file: File): Promise<string> => {
        const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'content-type': file.type },
            body: file,
        });

        const { url, error } = await res.json();
        console.log('📤 圖片上傳結果:', { url, error });

        if (!res.ok || !url) {
            throw new Error(error || '圖片上傳失敗');
        }
        return url;
    };

    return (
        <Editor
            apiKey="cs3yculovnwpmfnl3bvoqn9bip21yjxr480f4phfj17g9rqe"
            value={value}
            onEditorChange={onChange}
            onInit={(_evt, editor) => {
                editorRef.current = editor;
            }}
            init={{
                language: 'zh_TW',
                image_advtab: false,
                plugins: [
                    'image',
                    'link',
                    'lists',
                    'media',
                    'table',
                    'code',
                    'wordcount',
                ],
                toolbar:
                    'undo redo | blocks | bold italic underline | customimage media link | align bullist numlist outdent indent | code',

                // 自訂插入圖片按鈕
                setup: (editor: TinyMCEEditor) => {
                    (editor as any).ui.registry.addButton('customimage', {
                        icon: 'image',
                        tooltip: '插入圖片',
                        onAction: async () => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async () => {
                                const file = input.files?.[0];
                                if (!file) return;

                                try {
                                    const url = await uploadImage(file);
                                    // ✅ 插入上傳後的公開 URL
                                    editor.insertContent(
                                        `<img src="${url}" />`
                                    );
                                } catch (err: any) {
                                    console.error('圖片上傳錯誤', err);
                                    alert(err.message || '圖片上傳錯誤');
                                }
                            };
                            input.click();
                        },
                    });
                },

                // ✅ 拖曳圖片 or 貼上圖片 (改成 Promise 寫法)
                images_upload_handler: (
                    blobInfo: BlobInfo
                ): Promise<string> => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const file = new File(
                                [blobInfo.blob()],
                                blobInfo.filename(),
                                {
                                    type: blobInfo.blob().type,
                                }
                            );
                            const url = await uploadImage(file);
                            resolve(url);
                        } catch (err: any) {
                            console.error('圖片上傳錯誤', err);
                            reject(err.message || '圖片上傳發生錯誤');
                        }
                    });
                },
            }}
        />
    );
}
