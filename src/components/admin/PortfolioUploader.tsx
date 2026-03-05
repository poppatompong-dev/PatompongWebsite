"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Sparkles, ChevronDown } from "lucide-react";

const PORTFOLIO_CATEGORIES = [
    "CCTV & Security",
    "Network & Server",
    "Wireless & Antenna",
    "Fiber Optic",
    "Broadcasting & AV",
    "Field Operations",
    "Drone Survey",
    "Uncategorized",
];

interface UploadResult {
    url: string;
    filename: string;
    fileSize: number;
    width?: number;
    height?: number;
    enhancements?: Record<string, string>;
    error?: string;
}

interface QueueItem {
    id: string;
    file: File;
    preview: string;
    status: "pending" | "processing" | "done" | "error";
    result?: UploadResult;
}

interface Props {
    category: string;
    onUploadComplete?: () => void;
}

export default function PortfolioUploader({ category, onUploadComplete }: Props) {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessingAll, setIsProcessingAll] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((files: FileList | File[]) => {
        const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
        const newItems: QueueItem[] = imageFiles.map(file => ({
            id: `${file.name}_${Date.now()}_${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            status: "pending",
        }));
        setQueue(prev => [...prev, ...newItems]);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    }, [addFiles]);

    const processOne = async (item: QueueItem, cat: string): Promise<UploadResult> => {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("category", cat);
        const res = await fetch("/api/portfolio-upload", { method: "POST", body: fd });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Upload failed" }));
            throw new Error(err.error || "Upload failed");
        }
        return await res.json();
    };

    const handleProcessAll = async () => {
        const pending = queue.filter(q => q.status === "pending");
        if (pending.length === 0) return;

        setIsProcessingAll(true);

        for (const item of pending) {
            setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "processing" } : q));
            try {
                const result = await processOne(item, category);
                setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "done", result } : q));
            } catch (err: any) {
                setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "error", result: { url: "", filename: item.file.name, fileSize: 0, error: err.message } } : q));
            }
        }

        setIsProcessingAll(false);
        onUploadComplete?.();
    };

    const removeItem = (id: string) => {
        setQueue(prev => {
            const item = prev.find(q => q.id === id);
            if (item?.preview) URL.revokeObjectURL(item.preview);
            return prev.filter(q => q.id !== id);
        });
    };

    const clearDone = () => {
        setQueue(prev => {
            prev.filter(q => q.status === "done").forEach(q => URL.revokeObjectURL(q.preview));
            return prev.filter(q => q.status !== "done");
        });
    };

    const pendingCount = queue.filter(q => q.status === "pending").length;
    const doneCount = queue.filter(q => q.status === "done").length;
    const errorCount = queue.filter(q => q.status === "error").length;

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${isDragging
                        ? "border-gold-400 bg-gold-500/10 scale-[1.01]"
                        : "border-ink-600 bg-ink-900/40 hover:border-ink-500 hover:bg-ink-800/60"
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files && addFiles(e.target.files)}
                />
                <UploadCloud className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? "text-gold-400" : "text-ink-500"}`} />
                <p className="font-heading text-base font-semibold text-cream-200">
                    {isDragging ? "ปล่อยไฟล์ที่นี่" : "ลากรูปภาพมาวาง หรือคลิกเพื่อเลือก"}
                </p>
                <p className="font-code text-xs text-ink-400 mt-1">
                    รองรับ JPG, PNG, WebP, HEIC · สูงสุด 30MB ต่อไฟล์ · อัปโหลดได้หลายไฟล์พร้อมกัน
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span className="font-code text-[10px] text-gold-400 uppercase tracking-wider">Production Studio Auto-Processing</span>
                </div>
            </div>

            {/* Action Bar */}
            {queue.length > 0 && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 font-code text-xs">
                        {pendingCount > 0 && <span className="text-ink-400">{pendingCount} รอประมวลผล</span>}
                        {doneCount > 0 && <span className="text-green-400">✓ {doneCount} เสร็จแล้ว</span>}
                        {errorCount > 0 && <span className="text-red-400">✗ {errorCount} ผิดพลาด</span>}
                    </div>
                    <div className="flex gap-2">
                        {doneCount > 0 && (
                            <button onClick={clearDone} className="px-3 py-1.5 text-xs font-code border border-ink-600 text-ink-400 hover:text-cream-100 transition-colors">
                                ล้างรายการเสร็จ
                            </button>
                        )}
                        {pendingCount > 0 && (
                            <button
                                onClick={handleProcessAll}
                                disabled={isProcessingAll}
                                className="flex items-center gap-2 px-5 py-2 bg-gold-500 text-ink-900 text-sm font-bold font-code hover:bg-gold-400 transition-colors disabled:opacity-60 shadow-lg shadow-gold-500/20"
                            >
                                {isProcessingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {isProcessingAll ? "กำลังประมวลผล..." : `ประมวลผล ${pendingCount} ภาพ`}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Queue Grid */}
            {queue.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {queue.map(item => (
                        <div key={item.id} className="relative bg-ink-800 border border-ink-700 rounded-lg overflow-hidden group">
                            <div className="aspect-square relative">
                                <Image src={item.preview} alt={item.file.name} fill className="object-cover" sizes="200px" />

                                {/* Status Overlay */}
                                {item.status === "processing" && (
                                    <div className="absolute inset-0 bg-ink-900/70 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                                    </div>
                                )}
                                {item.status === "done" && (
                                    <div className="absolute inset-0 bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-green-400 drop-shadow-lg" />
                                    </div>
                                )}
                                {item.status === "error" && (
                                    <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center flex-col gap-1 p-2">
                                        <AlertCircle className="w-7 h-7 text-red-400" />
                                        <p className="text-[9px] font-code text-red-300 text-center leading-tight">{item.result?.error}</p>
                                    </div>
                                )}

                                {/* Remove Button */}
                                {item.status !== "processing" && (
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-1 right-1 w-5 h-5 bg-ink-900/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                )}
                            </div>

                            <div className="p-2">
                                <p className="font-code text-[9px] text-ink-400 truncate">{item.file.name}</p>
                                {item.status === "done" && item.result && (
                                    <p className="font-code text-[9px] text-green-400 mt-0.5">
                                        {item.result.width}×{item.result.height} · {(item.result.fileSize / 1024).toFixed(0)}KB · WebP
                                    </p>
                                )}
                                {item.status === "pending" && (
                                    <p className="font-code text-[9px] text-ink-500 mt-0.5">{(item.file.size / 1024 / 1024).toFixed(1)}MB</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
