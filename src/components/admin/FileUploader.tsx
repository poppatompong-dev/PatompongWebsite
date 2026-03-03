"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface UploadResult {
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
}

interface FileUploaderProps {
    onUpload: (result: UploadResult) => void;
    accept?: string;
    label?: string;
}

export default function FileUploader({ onUpload, accept, label = "อัปโหลดไฟล์" }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function handleFile(file: File) {
        setError(null);
        setSuccess(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Upload failed");
                return;
            }

            setSuccess(file.name);
            onUpload(data);
            setTimeout(() => setSuccess(null), 3000);
        } catch {
            setError("เกิดข้อผิดพลาดในการอัปโหลด");
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    return (
        <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed transition-all duration-200 p-4 text-center cursor-pointer ${dragOver
                    ? "border-gold-400 bg-gold-500/10"
                    : "border-ink-600 hover:border-gold-500/50 bg-ink-900/50"
                }`}
            onClick={() => inputRef.current?.click()}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />

            {uploading ? (
                <div className="flex items-center justify-center gap-2 text-gold-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-code">กำลังอัปโหลด...</span>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center gap-2 text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-code">{error}</span>
                </div>
            ) : success ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-code truncate">{success}</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 text-ink-400">
                    <Upload className="w-4 h-4" />
                    <span className="text-xs font-code">{label}</span>
                    <span className="text-[10px] text-ink-500 font-code">(หรือ ลากไฟล์มาวาง)</span>
                </div>
            )}
        </div>
    );
}
