"use client";

import { useState, useEffect } from "react";
import { getPortfolioProjects, createPortfolioProject, deletePortfolioProject } from "@/app/admin/(protected)/actions";
import { Plus, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";
import type { PortfolioProject } from "@prisma/client";

export default function PortfolioManager() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getPortfolioProjects();
        setProjects(data as any); // Type workaround
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        await createPortfolioProject(formData);
        e.currentTarget.reset();
        await fetchData();
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        if (!confirm("ลบผลงานชิ้นนี้อย่างถาวร?")) return;
        await deletePortfolioProject(id);
        await fetchData();
    }

    return (
        <div className="space-y-6">
            <div className="bg-ink-800 border border-ink-700 p-6">
                <h2 className="font-heading text-lg font-bold text-gold-400 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    เพิ่มผลงานใหม่ (Portfolio Link)
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
                        <label className="text-xs text-ink-400 font-code uppercase">รายละเอียด หรือเทคโนโลยีที่ใช้</label>
                        <textarea name="description" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400 h-20" placeholder="พัฒนาด้วย Next.js, ใช้งานจริงกว่า 2 ปี..." />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ป้ายกำกับ (Tags) ใช้อ่านง่ายๆ ขั้นด้วยลูกน้ำ</label>
                        <input name="tags" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="Next.js, Tailwind, API" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-ink-400 font-code uppercase">ลิงก์ภาพประกอบ (Thumbnail ถ้ามี)</label>
                        <input name="imageUrl" type="url" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-3 py-2 text-sm focus:border-gold-400" placeholder="https://..." />
                    </div>

                    <div className="md:col-span-2 mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 bg-gold-600 text-ink-900 px-6 py-2 font-bold uppercase text-xs tracking-wider hover:bg-gold-500 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            {submitting ? "กำลังบันทึก..." : "เพิ่มผลงาน"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="font-code text-sm text-ink-300 uppercase tracking-widest px-2">รายการผลงาน (Portfolio Links)</h3>

                {loading ? (
                    <p className="text-ink-400 text-sm p-4">Loading Data...</p>
                ) : projects.length === 0 ? (
                    <div className="text-center p-8 bg-ink-800/50 border border-ink-700/50 border-dashed rounded text-ink-500">
                        ยังไม่มีข้อมูลผลงาน เพิ่มผลงานแรกของคุณด้านบน
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {projects.map(project => (
                            <div key={project.id} className="bg-ink-800 border border-ink-600 p-4 flex flex-col sm:flex-row justify-between gap-4">
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
                                        <div className="flex gap-2 mt-3">
                                            {project.tags.split(",").map((t: string) => (
                                                <span key={t} className="text-[10px] font-code bg-ink-900 px-2 py-0.5 text-gold-500 rounded-sm border border-gold-500/20">{t.trim()}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start sm:items-center">
                                    <button onClick={() => handleDelete(project.id)} className="text-ink-500 hover:text-red-400 p-2 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
