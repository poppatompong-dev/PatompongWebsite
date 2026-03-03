"use client";

import { useState, useEffect } from "react";
import { getTimelineEvents, createTimelineEvent, deleteTimelineEvent } from "@/app/admin/(protected)/actions";
import { Plus, Trash2, Calendar } from "lucide-react";

export default function TimelineManager() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getTimelineEvents();
        setEvents(data);
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
        if (!confirm("ลบกิจกรรมนี้อย่างถาวร?")) return;
        await deleteTimelineEvent(id);
        await fetchData();
    }

    return (
        <div className="space-y-6">
            <div className="bg-ink-800 border border-ink-700 p-6">
                <h2 className="font-heading text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    เพิ่มประสบการณ์ (ไทม์ไลน์)
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ชื่อกิจกรรม / การอบรม</label>
                        <input name="title" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="เช่น เข้าร่วมโครงการพัฒนาเว็บ" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">วันที่เกิดกิจกรรม (หรือเดือน)</label>
                        <input name="date" type="date" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400 [&::-webkit-calendar-picker-indicator]:invert" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">หมวดหมู่</label>
                        <select name="category" required className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400">
                            <option value="Training">เข้ารับการอบรม (Training)</option>
                            <option value="Development">พัฒนาระบบ (Development)</option>
                            <option value="Event">เข้าร่วมงานพิธี/ประชุม (Event)</option>
                            <option value="Achievement">ความสำเร็จ/รางวัล (Achievement)</option>
                            <option value="Other">อื่นๆ (Other)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">สถานที่จัดงาน (ถ้ามี)</label>
                        <input name="location" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="เช่น ศูนย์ราชการฯ" />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-ink-400 font-code uppercase">รายละเอียด หรือประสบการณ์ที่ได้รับ</label>
                        <textarea name="description" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400 h-20" placeholder="รายละเอียดเพิ่มเติม (สำหรับออกรายงาน)..." />
                    </div>

                    <div className="md:col-span-2 mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-gold-600 text-ink-900 px-6 py-2 font-bold uppercase text-xs tracking-wider hover:bg-gold-500 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            {submitting ? "กำลังบันทึก..." : "เพิ่มลงไทม์ไลน์"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="font-code text-sm text-ink-300 uppercase tracking-widest px-2">ไทม์ไลน์ (Timeline Reports)</h3>

                {loading ? (
                    <p className="text-ink-400 text-sm p-4">Loading Data...</p>
                ) : events.length === 0 ? (
                    <div className="text-center p-8 bg-ink-800/50 border border-ink-700/50 border-dashed rounded text-ink-500">
                        ยังไม่มีข้อมูลไทม์ไลน์ เริ่มเพิ่มง่ายๆ ด้านบน
                    </div>
                ) : (
                    <div className="relative border-l border-ink-700 ml-4 pl-6 pb-6 space-y-8 mt-6">
                        {events.map(event => (
                            <div key={event.id} className="relative">
                                <div className="absolute w-3 h-3 bg-gold-500 rounded-full -left-[1.95rem] top-1.5 ring-4 ring-ink-900" />
                                <div className="bg-ink-800 border border-ink-600 p-4 relative group">
                                    <div className="flex flex-wrap justify-between gap-4 mb-2">
                                        <div>
                                            <span className="text-[10px] font-code uppercase tracking-widest text-gold-500 font-bold mb-1 block">
                                                {new Date(event.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                {event.location && ` · ${event.location}`}
                                            </span>
                                            <h4 className="text-lg font-bold text-cream-100 inline-block">{event.title}</h4>
                                            <span className="ml-3 text-[10px] px-2 py-0.5 rounded bg-ink-700 text-ink-300 border border-ink-600">{event.category}</span>
                                        </div>
                                        <button onClick={() => handleDelete(event.id)} className="text-ink-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {event.description && (
                                        <p className="text-sm text-ink-300 mt-2 whitespace-pre-wrap">{event.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
