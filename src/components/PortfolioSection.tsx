import { prisma } from "@/lib/prisma";
import { formatDate, getStatusLabel, parseTags } from "@/types/portfolio";
import { ArrowRight, Building2, CalendarDays, ExternalLink, Layers3 } from "lucide-react";
import Link from "next/link";

export default async function PortfolioSection() {
    let projects: any[] = [];
    try {
        projects = await prisma.project.findMany({
            include: {
                client: true,
                category: true,
            },
            orderBy: { projectNumber: "asc" },
            take: 6,
        });
    } catch { }

    if (projects.length === 0) return null;

    return (
        <section id="portfolio-links" className="relative py-24 lg:py-32 bg-ink-900 border-t border-ink-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-24">
                    <span className="font-code text-xs text-gold-500 tracking-[0.15em] uppercase">
                        ผลงานที่ผ่านมา (Our Work)
                    </span>
                    <h2 className="mt-3 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-cream-50">
                        ระบบและซอฟต์แวร์
                    </h2>
                    <div className="divider-gold mx-auto mt-4" />
                    <p className="mt-6 text-cream-200/80 text-lg max-w-2xl mx-auto">
                        รวบรวมผลงานการพัฒนาระบบ ซอฟต์แวร์ และแอปพลิเคชันที่นำไปใช้งานจริงในหน่วยงานและองค์กร
                    </p>
                </div>

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
                            {projects.map(project => (
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
                                            {getStatusLabel(project.status)}
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

                <div className="mt-12 text-center">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-gold-500/40 text-gold-400 hover:text-gold-300 hover:border-gold-400 bg-gold-500/5 transition-colors font-semibold"
                    >
                        ดูผลงานทั้งหมด
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
