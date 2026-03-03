"use client";

import { useState, useEffect } from "react";
import {
    getPortfolioProjects,
    createPortfolioProject,
    deletePortfolioProject,
    addAttachment,
    deleteAttachment,
    generatePortfolioShareLink,
} from "@/app/admin/(protected)/actions";
import { Plus, Trash2, Link as LinkIcon, ExternalLink, Paperclip, Share2, Copy, Check, FileText, Image as ImageIcon, Film } from "lucide-react";
import FileUploader from "./FileUploader";

interface Attachment {
    id: string;
    filename: string;
    url: string;
    fileType: string;
    fileSize: number | null;
    createdAt: Date;
}

interface Project {
    id: string;
    title: string;
    description: string | null;
    url: string | null;
    imageUrl: string | null;
    tags: string | null;
    isFeatured: boolean;
    shareSlug: string | null;
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

export default function PortfolioManager() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [attachingTo, setAttachingTo] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getPortfolioProjects();
        setProjects(data as any);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        // Use uploaded thumbnail URL if available
        if (thumbnailUrl) {
            formData.set("imageUrl", thumbnailUrl);
        }
        await createPortfolioProject(formData);
        e.currentTarget.reset();
        setThumbnailUrl("");
        await fetchData();
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("ลบผลงานชิ้นนี้อย่างถาวร?")) return;
        await deletePortfolioProject(id);
        await fetchData();
    }

    async function handleUploadedAttachment(projectId: string, result: { url: string; filename: string; fileType: string; fileSize: number }) {
        await addAttachment({
            parentType: "portfolio",
            parentId: projectId,
            filename: result.filename,
            url: result.url,
            fileType: result.fileType,
            fileSize: result.fileSize,
        });
        await fetchData();
    }

    async function handleDeleteAttachment(id: string) {
        if (!confirm("ลบไฟล์แนบนี้?")) return;
        await deleteAttachment(id);
        await fetchData();
    }

    async function handleShare(id: string) {
        const result = await generatePortfolioShareLink(id);
        if (result.success && result.slug) {
            const shareUrl = `${window.location.origin}/share/${result.slug}`;
            await navigator.clipboard.writeText(shareUrl);
            setCopiedSlug(id);
            setTimeout(() => setCopiedSlug(null), 2000);
            await fetchData();
        }
    }

    const fileTypeIcon = (type: string) => {
        if (type === "image") return <ImageIcon className="w-3 h-3" />;
        if (type === "video") return <Film className="w-3 h-3" />;
        return <FileText className="w-3 h-3" />;
    };

    return (
        <div className="space-y-6">
            {/* Add Form */}
            <div className="bg-ink-800 border border-ink-700 p-6">
                <h2 className="font-heading text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    เพิ่มผลงานใหม่ (Portfolio)
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ชื่อผลงาน / ระบบ</label>
                        <input name="title" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="เช่น ระบบจองห้องประชุม" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ลิงก์ URL ผลงาน</label>
                        <input name="url" type="url" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="https://..." />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-ink-400 font-code uppercase">รายละเอียด</label>
                        <textarea name="description" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400 h-20" placeholder="พัฒนาด้วย Next.js..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">Tags (คั่นด้วยลูกน้ำ)</label>
                        <input name="tags" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="Next.js, Tailwind, API" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ภาพปก (Thumbnail)</label>
                        <FileUploader
                            accept="image/*"
                            label="อัปโหลดภาพปก"
                            onUpload={(result) => setThumbnailUrl(result.url)}
                        />
                        {thumbnailUrl && (
                            <p className="text-[10px] text-green-400 font-code mt-1">✓ {thumbnailUrl}</p>
                        )}
                        <input name="imageUrl" type="hidden" value={thumbnailUrl} />
                    </div>
                    <div className="md:col-span-2 mt-4 flex justify-end">
                        <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-gold-600 text-ink-900 px-6 py-2 font-bold uppercase text-xs tracking-wider hover:bg-gold-500 disabled:opacity-50">
                            <Plus className="w-4 h-4" />
                            {submitting ? "กำลังบันทึก..." : "เพิ่มผลงาน"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Projects List */}
            <div className="space-y-4">
                <h3 className="font-code text-sm text-ink-300 uppercase tracking-widest px-2">รายการผลงาน (Portfolio)</h3>

                {loading ? (
                    <p className="text-ink-400 text-sm p-4">Loading...</p>
                ) : projects.length === 0 ? (
                    <div className="text-center p-8 bg-ink-800/50 border border-ink-700/50 border-dashed text-ink-500">
                        ยังไม่มีข้อมูลผลงาน เพิ่มผลงานแรกด้านบน
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map(project => (
                            <div key={project.id} className="bg-ink-800 border border-ink-600 p-4 space-y-3">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-bold text-cream-100">{project.title}</h4>
                                            {project.url && (
                                                <a href={project.url} target="_blank" rel="noreferrer" className="text-gold-400 hover:text-gold-300">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm text-ink-300 mt-1 line-clamp-2">{project.description}</p>
                                        {project.tags && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {project.tags.split(",").map((t: string) => (
                                                    <span key={t} className="text-[10px] font-code bg-ink-900 px-2 py-0.5 text-gold-500 border border-gold-500/20">{t.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-2 shrink-0">
                                        <button onClick={() => setAttachingTo(attachingTo === project.id ? null : project.id)} className="text-ink-400 hover:text-gold-400 p-2 transition-colors border border-ink-600 hover:border-gold-500/50" title="แนบไฟล์">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleShare(project.id)} className="text-ink-400 hover:text-green-400 p-2 transition-colors border border-ink-600 hover:border-green-500/50" title="แชร์ลิงก์">
                                            {copiedSlug === project.id ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(project.id)} className="text-ink-500 hover:text-red-400 p-2 transition-colors border border-ink-600 hover:border-red-500/50" title="ลบ">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Share URL */}
                                {project.shareSlug && (
                                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-2 text-xs">
                                        <Share2 className="w-3 h-3 text-green-400" />
                                        <span className="text-green-300 font-code truncate">/share/{project.shareSlug}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${project.shareSlug}`); setCopiedSlug(project.id); setTimeout(() => setCopiedSlug(null), 2000); }} className="ml-auto text-green-400 hover:text-green-300">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* File Upload Zone */}
                                {attachingTo === project.id && (
                                    <div className="bg-ink-900 border border-ink-600 p-4 space-y-3">
                                        <h5 className="text-xs text-gold-400 font-code uppercase">แนบไฟล์ประกอบ (อัปโหลดจากเครื่อง)</h5>
                                        <FileUploader
                                            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            label="เลือกไฟล์ หรือ ลากมาวาง"
                                            onUpload={(result) => handleUploadedAttachment(project.id, result)}
                                        />
                                    </div>
                                )}

                                {/* Attachments List */}
                                {project.attachments.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-ink-500 font-code uppercase">ไฟล์แนบ ({project.attachments.length})</span>
                                        {project.attachments.map(att => (
                                            <div key={att.id} className="flex items-center gap-2 bg-ink-900/50 border border-ink-700 px-3 py-1.5 text-xs">
                                                {fileTypeIcon(att.fileType)}
                                                <a href={att.url} target="_blank" rel="noreferrer" className="text-cream-200 hover:text-gold-400 truncate flex-1">{att.filename}</a>
                                                <span className="text-ink-500 font-code">{att.fileType}</span>
                                                <button onClick={() => handleDeleteAttachment(att.id)} className="text-ink-500 hover:text-red-400 ml-2">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
