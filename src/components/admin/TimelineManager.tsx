"use client";

import { useState, useEffect } from "react";
import {
    getTimelineEvents,
    createTimelineEvent,
    deleteTimelineEvent,
    addAttachment,
    deleteAttachment,
    generateTimelineShareLink,
} from "@/app/admin/(protected)/actions";
import { Plus, Trash2, Calendar, Paperclip, Share2, Copy, Check, FileText, Image as ImageIcon, Film, MapPin } from "lucide-react";

interface Attachment {
    id: string;
    filename: string;
    url: string;
    fileType: string;
    fileSize: number | null;
    createdAt: Date;
}

interface TimelineEvent {
    id: string;
    title: string;
    description: string | null;
    date: Date;
    category: string;
    imageUrl: string | null;
    location: string | null;
    shareSlug: string | null;
    attachments: Attachment[];
    createdAt: Date;
    updatedAt: Date;
}

const CATEGORIES = ["Training", "Development", "Event", "Ceremony", "Meeting", "Other"];

export default function TimelineManager() {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    // Attachment form state
    const [attachingTo, setAttachingTo] = useState<string | null>(null);
    const [attachForm, setAttachForm] = useState({ filename: "", url: "", fileType: "image" });

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getTimelineEvents();
        setEvents(data as any);
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        await createTimelineEvent(formData);
        e.currentTarget.reset();
        await fetchData();
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("ลบรายการนี้อย่างถาวร?")) return;
        await deleteTimelineEvent(id);
        await fetchData();
    }

    async function handleAddAttachment(eventId: string) {
        if (!attachForm.filename || !attachForm.url) return;
        await addAttachment({
            parentType: "timeline",
            parentId: eventId,
            filename: attachForm.filename,
            url: attachForm.url,
            fileType: attachForm.fileType,
        });
        setAttachForm({ filename: "", url: "", fileType: "image" });
        setAttachingTo(null);
        await fetchData();
    }

    async function handleDeleteAttachment(id: string) {
        if (!confirm("ลบไฟล์แนบนี้?")) return;
        await deleteAttachment(id);
        await fetchData();
    }

    async function handleShare(id: string) {
        const result = await generateTimelineShareLink(id);
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

    const categoryColor: Record<string, string> = {
        Training: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        Development: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        Event: "bg-green-500/20 text-green-400 border-green-500/30",
        Ceremony: "bg-pink-500/20 text-pink-400 border-pink-500/30",
        Meeting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        Other: "bg-ink-700/50 text-ink-300 border-ink-600",
    };

    return (
        <div className="space-y-6">
            {/* Add Form */}
            <div className="bg-ink-800 border border-ink-700 p-6">
                <h2 className="font-heading text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    เพิ่มรายการไทม์ไลน์
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">หัวข้อ / ชื่อกิจกรรม</label>
                        <input name="title" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="เช่น อบรมเชิงปฏิบัติการ AI" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">วันที่</label>
                        <input name="date" type="date" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">หมวดหมู่</label>
                        <select name="category" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">สถานที่</label>
                        <input name="location" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="เช่น ห้องประชุม ศาลากลาง" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-ink-400 font-code uppercase">รายละเอียด</label>
                        <textarea name="description" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400 h-20" placeholder="รายละเอียดกิจกรรม..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ลิงก์ภาพประกอบ</label>
                        <input name="imageUrl" type="url" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="https://..." />
                    </div>
                    <div className="flex items-end justify-end">
                        <button type="submit" disabled={submitting} className="flex items-center gap-2 bg-gold-600 text-ink-900 px-6 py-2 font-bold uppercase text-xs tracking-wider hover:bg-gold-500 disabled:opacity-50">
                            <Plus className="w-4 h-4" />
                            {submitting ? "กำลังบันทึก..." : "เพิ่มรายการ"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                <h3 className="font-code text-sm text-ink-300 uppercase tracking-widest px-2">รายการไทม์ไลน์</h3>

                {loading ? (
                    <p className="text-ink-400 text-sm p-4">Loading...</p>
                ) : events.length === 0 ? (
                    <div className="text-center p-8 bg-ink-800/50 border border-ink-700/50 border-dashed text-ink-500">
                        ยังไม่มีรายการ เพิ่มรายการแรกด้านบน
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {events.map(event => (
                            <div key={event.id} className="bg-ink-800 border border-ink-600 p-4 space-y-3">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-lg font-bold text-cream-100">{event.title}</h4>
                                            <span className={`text-[10px] font-code px-2 py-0.5 border ${categoryColor[event.category] || categoryColor.Other}`}>
                                                {event.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-ink-400">
                                            <span className="font-code">{new Date(event.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />{event.location}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-ink-300 mt-2 line-clamp-2">{event.description}</p>
                                    </div>
                                    <div className="flex items-start gap-2 shrink-0">
                                        <button onClick={() => setAttachingTo(attachingTo === event.id ? null : event.id)} className="text-ink-400 hover:text-gold-400 p-2 transition-colors border border-ink-600 hover:border-gold-500/50" title="แนบไฟล์">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleShare(event.id)} className="text-ink-400 hover:text-green-400 p-2 transition-colors border border-ink-600 hover:border-green-500/50" title="แชร์ลิงก์">
                                            {copiedSlug === event.id ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(event.id)} className="text-ink-500 hover:text-red-400 p-2 transition-colors border border-ink-600 hover:border-red-500/50" title="ลบ">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Share URL */}
                                {event.shareSlug && (
                                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-2 text-xs">
                                        <Share2 className="w-3 h-3 text-green-400" />
                                        <span className="text-green-300 font-code truncate">/share/{event.shareSlug}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${event.shareSlug}`); setCopiedSlug(event.id); setTimeout(() => setCopiedSlug(null), 2000); }} className="ml-auto text-green-400 hover:text-green-300">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                {/* Attachment Form */}
                                {attachingTo === event.id && (
                                    <div className="bg-ink-900 border border-ink-600 p-4 space-y-3">
                                        <h5 className="text-xs text-gold-400 font-code uppercase">แนบไฟล์ประกอบ</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input value={attachForm.filename} onChange={e => setAttachForm(p => ({ ...p, filename: e.target.value }))} className="bg-ink-800 border border-ink-600 text-cream-100 px-3 py-2 text-xs" placeholder="ชื่อไฟล์" />
                                            <input value={attachForm.url} onChange={e => setAttachForm(p => ({ ...p, url: e.target.value }))} className="bg-ink-800 border border-ink-600 text-cream-100 px-3 py-2 text-xs" placeholder="URL ไฟล์ (https://...)" />
                                            <select value={attachForm.fileType} onChange={e => setAttachForm(p => ({ ...p, fileType: e.target.value }))} className="bg-ink-800 border border-ink-600 text-cream-100 px-3 py-2 text-xs">
                                                <option value="image">รูปภาพ</option>
                                                <option value="document">เอกสาร</option>
                                                <option value="video">วิดีโอ</option>
                                            </select>
                                        </div>
                                        <button onClick={() => handleAddAttachment(event.id)} className="bg-gold-600 text-ink-900 px-4 py-1.5 text-xs font-bold hover:bg-gold-500">
                                            <Plus className="w-3 h-3 inline mr-1" />เพิ่มไฟล์แนบ
                                        </button>
                                    </div>
                                )}

                                {/* Attachments List */}
                                {event.attachments.length > 0 && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-ink-500 font-code uppercase">ไฟล์แนบ ({event.attachments.length})</span>
                                        {event.attachments.map(att => (
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
