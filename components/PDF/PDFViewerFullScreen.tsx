'use client';

import { X, Download } from 'lucide-react';

interface Props {
    url: string;
    fileName?: string;
    onClose: () => void;
}

export default function PDFViewerFullScreen({ url, fileName, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/70 border-b border-white/20">
                <button
                    onClick={onClose}
                    className="text-white text-sm flex items-center gap-2 hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                    返回
                </button>

                <div className="text-white font-medium truncate max-w-[50%]">
                    {fileName}
                </div>

                <a
                    href={url}
                    download={fileName}
                    target="_blank"
                    className="text-white hover:text-gray-200"
                >
                    <Download className="w-5 h-5" />
                </a>
            </div>

            {/* PDF 內容 */}
            <iframe
                src={url}
                className="flex-1 w-full bg-black"
                style={{ border: 'none' }}
            />

        </div>
    );
}
