"use client";

import { formatDate, getStatusLabel } from "@/types/portfolio";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Project {
    id: string;
    projectNumber: number;
    projectName: string;
    description: string | null;
    type: string;
    url: string | null;
    status: string;
    startDate: Date | null;
    completedDate: Date | null;
    slug: string;
    client: { clientName: string };
}

interface Props {
    projects: Project[];
}

const ITEMS_PER_PAGE = 7;

export default function PortfolioSectionClient({ projects }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentProjects = projects.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        setCurrentPage(prev => Math.max(1, Math.min(page, totalPages)));
    };

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-ink-700 bg-ink-800/60 shadow-xl">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-ink-700 bg-ink-900/80">
                            <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-gold-400">#</th>
                            <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-gold-400">โครงการ</th>
                            <th className="hidden px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-gold-400 sm:table-cell">ประเภท</th>
                            <th className="hidden px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-gold-400 lg:table-cell">หน่วยงาน</th>
                            <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-gold-400">สถานะ</th>
                            <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-gold-400"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700/50">
                        {currentProjects.map(project => (
                            <tr key={project.id} className="group transition-colors hover:bg-ink-700/30">
                                <td className="px-4 py-3 font-code text-[11px] text-gold-500">
                                    #{String(project.projectNumber).padStart(2, "0")}
                                </td>
                                <td className="px-4 py-3">
                                    <p className="font-semibold text-cream-100 group-hover:text-gold-400 transition-colors">
                                        {project.projectName}
                                    </p>
                                    {project.description && (
                                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-300">{project.description}</p>
                                    )}
                                </td>
                                <td className="hidden px-4 py-3 sm:table-cell">
                                    <span className="rounded-md border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 font-code text-[10px] uppercase tracking-wide text-gold-400">
                                        {project.type}
                                    </span>
                                </td>
                                <td className="hidden px-4 py-3 text-xs text-ink-300 lg:table-cell">
                                    {project.client.clientName}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                        {getStatusLabel(project.status as any)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/projects/${project.slug}`}
                                            className="rounded-lg border border-ink-600 bg-ink-900/50 px-2.5 py-1.5 text-[11px] font-semibold text-cream-200 transition-colors hover:border-gold-500/40 hover:text-gold-400"
                                        >
                                            รายละเอียด
                                        </Link>
                                        {project.url && (
                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-lg border border-ink-600 bg-ink-900/50 p-1.5 text-ink-300 transition-colors hover:border-gold-500/40 hover:text-gold-400"
                                                title="เปิดระบบจริง"
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-ink-300">
                        แสดง {startIndex + 1}-{Math.min(endIndex, projects.length)} จาก {projects.length} โครงการ
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 rounded-lg border border-ink-600 bg-ink-900/50 px-3 py-2 text-sm font-semibold text-cream-200 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-ink-600 disabled:hover:text-cream-200"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            ก่อนหน้า
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${
                                        page === currentPage
                                            ? "border-gold-500 bg-gold-500/20 text-gold-400"
                                            : "border-ink-600 bg-ink-900/50 text-cream-200 hover:border-gold-500/40 hover:text-gold-400"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 rounded-lg border border-ink-600 bg-ink-900/50 px-3 py-2 text-sm font-semibold text-cream-200 transition-colors hover:border-gold-500/40 hover:text-gold-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-ink-600 disabled:hover:text-cream-200"
                        >
                            ถัดไป
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-12 text-center">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gold-500/40 text-gold-400 hover:text-gold-300 hover:border-gold-400 bg-gold-500/5 transition-colors font-semibold"
                >
                    ดูผลงานทั้งหมด
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </>
    );
}
