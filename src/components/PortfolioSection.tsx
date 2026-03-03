import { PrismaClient } from "@prisma/client";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import Image from "next/image";

export default async function PortfolioSection() {
    let projects: any[] = [];
    try {
        const prisma = new PrismaClient();
        projects = await prisma.portfolioProject.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch { /* DB unavailable during CI build */ }

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
                        รวบรวมผลงานการพัฒนาระบบ ซอฟต์แวร์ และแอปพลิเคชันต่างๆ ที่นำไปใช้งานจริง
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <div key={project.id} className="group bg-ink-800 border border-ink-700 hover:border-gold-500/50 transition-all duration-300 overflow-hidden flex flex-col h-full">
                            {project.imageUrl ? (
                                <div className="relative h-48 w-full overflow-hidden border-b border-ink-700">
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-ink-900/20 group-hover:bg-transparent transition-colors" />
                                </div>
                            ) : (
                                <div className="h-2 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-cream-100 mb-2 font-heading">{project.title}</h3>
                                <p className="text-sm text-ink-300 mb-6 flex-1 whitespace-pre-wrap">{project.description}</p>

                                {project.tags && (
                                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                        {project.tags.split(",").map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-code px-2 py-0.5 border border-ink-600 text-gold-400 rounded-sm uppercase tracking-wider bg-ink-900/50">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {project.url && (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-code text-xs uppercase tracking-widest font-bold group/link mt-auto transition-colors"
                                    >
                                        View Project
                                        <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
