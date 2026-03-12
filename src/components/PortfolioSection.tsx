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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <div key={project.id} className="group bg-ink-800 border border-ink-700 hover:border-gold-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                            <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

                            <div className="p-6 flex-1 flex flex-col">
                                <p className="font-code text-[11px] text-gold-500 tracking-[0.18em] uppercase">
                                    Project #{String(project.projectNumber).padStart(2, "0")}
                                </p>
                                <h3 className="text-xl font-bold text-cream-100 mb-3 mt-3 font-heading leading-snug">{project.projectName}</h3>

                                <div className="space-y-2 text-sm text-ink-300 mb-5">
                                    <div className="flex items-start gap-2">
                                        <Building2 className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                                        <span>{project.client.clientName}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Layers3 className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                                        <span>{project.category.name} / {project.subcategory}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CalendarDays className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                                        <span>{formatDate(project.startDate)} - {formatDate(project.completedDate)}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-ink-300 mb-6 flex-1 whitespace-pre-wrap leading-7">{project.description}</p>

                                {parseTags(project.tags).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                        {parseTags(project.tags).slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-code px-2 py-0.5 border border-ink-600 text-gold-400 rounded-sm uppercase tracking-wider bg-ink-900/50">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 mt-auto">
                                    <span className="text-[10px] font-code px-2 py-1 border border-gold-500/20 text-gold-400 uppercase tracking-wider bg-gold-500/5">
                                        {getStatusLabel(project.status)}
                                    </span>
                                    <Link
                                        href={`/projects/${project.slug}`}
                                        className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-code text-xs uppercase tracking-widest font-bold group/link transition-colors"
                                    >
                                        View Details
                                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                    {project.url && (
                                        <a
                                            href={project.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 text-ink-300 hover:text-gold-300 font-code text-xs uppercase tracking-widest font-bold transition-colors"
                                        >
                                            Open Link
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
