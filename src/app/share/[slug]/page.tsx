import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink, FileText, Image as ImageIcon, Film, ArrowLeft, Tag, Share2 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Try portfolio
    const portfolio = await prisma.portfolioProject.findUnique({ where: { shareSlug: slug } });
    if (portfolio) {
        return {
            title: `${portfolio.title} — Digital Museum`,
            description: portfolio.description || "ผลงานจากพิพิธภัณฑ์ดิจิทัล",
            openGraph: {
                title: portfolio.title,
                description: portfolio.description || "",
                images: portfolio.imageUrl ? [portfolio.imageUrl] : [],
            },
        };
    }

    // Try timeline
    const timeline = await prisma.timelineEvent.findUnique({ where: { shareSlug: slug } });
    if (timeline) {
        return {
            title: `${timeline.title} — Digital Museum`,
            description: timeline.description || "บันทึกจากพิพิธภัณฑ์ดิจิทัล",
            openGraph: {
                title: timeline.title,
                description: timeline.description || "",
                images: timeline.imageUrl ? [timeline.imageUrl] : [],
            },
        };
    }

    return { title: "Not Found" };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Try portfolio first
    const portfolio = await prisma.portfolioProject.findUnique({
        where: { shareSlug: slug },
        include: { attachments: true },
    });

    if (portfolio) {
        return <MuseumPortfolio item={portfolio} />;
    }

    // Then try timeline
    const timeline = await prisma.timelineEvent.findUnique({
        where: { shareSlug: slug },
        include: { attachments: true },
    });

    if (timeline) {
        return <MuseumTimeline item={timeline} />;
    }

    notFound();
}

// ==================== Museum Portfolio Exhibit ====================

function MuseumPortfolio({ item }: { item: any }) {
    return (
        <div className="min-h-screen bg-ink-900 text-cream-100">
            {/* Museum Header Bar */}
            <div className="bg-ink-800/80 backdrop-blur-sm border-b border-gold-500/20 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-code">
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                    <span className="text-[10px] font-code text-gold-500/60 uppercase tracking-[0.2em]">
                        ⬡ Digital Museum — Exhibit
                    </span>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative">
                {item.imageUrl ? (
                    <div className="relative h-[40vh] min-h-[320px] overflow-hidden">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/60 to-transparent" />
                    </div>
                ) : (
                    <div className="h-32 bg-gradient-to-r from-gold-600/20 via-gold-400/10 to-gold-600/20 border-b border-gold-500/20" />
                )}

                {/* Museum Plaque */}
                <div className="relative max-w-5xl mx-auto px-6 -mt-24">
                    <div className="bg-ink-800/90 backdrop-blur-lg border border-gold-500/30 p-8 lg:p-12 shadow-2xl shadow-gold-500/5">
                        <div className="flex items-start gap-4 mb-2">
                            <div className="w-1 h-12 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full shrink-0 mt-1" />
                            <div>
                                <span className="text-[10px] font-code text-gold-500/80 uppercase tracking-[0.2em] block mb-2">
                                    ผลงาน / ระบบ — Portfolio Exhibit
                                </span>
                                <h1 className="text-3xl lg:text-5xl font-heading font-bold text-cream-50 leading-tight">
                                    {item.title}
                                </h1>
                            </div>
                        </div>

                        {item.tags && (
                            <div className="flex flex-wrap gap-2 mt-6 ml-5">
                                {item.tags.split(",").map((tag: string) => (
                                    <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-code px-3 py-1 border border-gold-500/30 text-gold-400 bg-gold-500/5">
                                        <Tag className="w-3 h-3" />
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description Panel */}
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                {item.description && (
                    <div className="bg-ink-800/50 border-l-2 border-gold-500/40 pl-6 pr-8 py-6">
                        <span className="text-[10px] font-code text-gold-500/60 uppercase tracking-[0.15em] block mb-3">คำอธิบายผลงาน</span>
                        <p className="text-cream-200/90 text-lg leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>
                )}

                {/* Project Link */}
                {item.url && (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-4 bg-gradient-to-r from-gold-600/10 to-transparent border border-gold-500/30 hover:border-gold-400/60 p-6 transition-all duration-300"
                    >
                        <div className="w-12 h-12 bg-gold-500/10 border border-gold-500/30 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                            <ExternalLink className="w-5 h-5 text-gold-400" />
                        </div>
                        <div>
                            <span className="text-[10px] font-code text-gold-500/60 uppercase tracking-wider">เข้าชมผลงาน</span>
                            <p className="text-gold-400 font-code text-sm group-hover:text-gold-300 transition-colors">{item.url}</p>
                        </div>
                    </a>
                )}

                {/* Attachments Gallery */}
                {item.attachments.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-px bg-gold-500/40" />
                            <span className="text-[10px] font-code text-gold-500/60 uppercase tracking-[0.2em]">เอกสารและสื่อประกอบ ({item.attachments.length})</span>
                            <div className="flex-1 h-px bg-gold-500/20" />
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {item.attachments.map((att: any) => (
                                <AttachmentCard key={att.id} attachment={att} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Museum Footer */}
            <MuseumFooter />
        </div>
    );
}

// ==================== Museum Timeline Exhibit ====================

function MuseumTimeline({ item }: { item: any }) {
    return (
        <div className="min-h-screen bg-ink-900 text-cream-100">
            {/* Museum Header Bar */}
            <div className="bg-ink-800/80 backdrop-blur-sm border-b border-gold-500/20 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-code">
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                    <span className="text-[10px] font-code text-gold-500/60 uppercase tracking-[0.2em]">
                        ⬡ Digital Museum — Archive
                    </span>
                </div>
            </div>

            {/* Hero Banner */}
            <div className="relative">
                {item.imageUrl ? (
                    <div className="relative h-[40vh] min-h-[320px] overflow-hidden">
                        <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
                    </div>
                ) : (
                    <div className="h-32 bg-gradient-to-r from-blue-600/15 via-purple-500/10 to-blue-600/15 border-b border-blue-500/20" />
                )}

                {/* Museum Plaque */}
                <div className="relative max-w-5xl mx-auto px-6 -mt-24">
                    <div className="bg-ink-800/90 backdrop-blur-lg border border-gold-500/30 p-8 lg:p-12 shadow-2xl shadow-gold-500/5">
                        <div className="flex items-start gap-4 mb-2">
                            <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full shrink-0 mt-1" />
                            <div>
                                <span className="text-[10px] font-code text-gold-500/80 uppercase tracking-[0.2em] block mb-2">
                                    บันทึก / กิจกรรม — Timeline Archive
                                </span>
                                <h1 className="text-3xl lg:text-5xl font-heading font-bold text-cream-50 leading-tight">
                                    {item.title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 mt-6 ml-5 text-sm text-ink-300">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gold-400" />
                                {new Date(item.date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                            {item.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gold-400" />
                                    {item.location}
                                </div>
                            )}
                            <span className="text-[11px] font-code px-3 py-1 border border-blue-500/30 text-blue-400 bg-blue-500/5">
                                {item.category}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                {item.description && (
                    <div className="bg-ink-800/50 border-l-2 border-blue-500/40 pl-6 pr-8 py-6">
                        <span className="text-[10px] font-code text-blue-400/60 uppercase tracking-[0.15em] block mb-3">รายละเอียดกิจกรรม</span>
                        <p className="text-cream-200/90 text-lg leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>
                )}

                {/* Attachments Gallery */}
                {item.attachments.length > 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-px bg-gold-500/40" />
                            <span className="text-[10px] font-code text-gold-500/60 uppercase tracking-[0.2em]">เอกสารและสื่อประกอบ ({item.attachments.length})</span>
                            <div className="flex-1 h-px bg-gold-500/20" />
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {item.attachments.map((att: any) => (
                                <AttachmentCard key={att.id} attachment={att} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <MuseumFooter />
        </div>
    );
}

// ==================== Shared Components ====================

function AttachmentCard({ attachment }: { attachment: any }) {
    const isImage = attachment.fileType === "image";
    const isVideo = attachment.fileType === "video";
    const icon = isImage ? <ImageIcon className="w-5 h-5" /> : isVideo ? <Film className="w-5 h-5" /> : <FileText className="w-5 h-5" />;

    return (
        <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="group bg-ink-800/60 border border-ink-700 hover:border-gold-500/40 p-4 flex items-center gap-4 transition-all duration-300 hover:bg-ink-800"
        >
            <div className="w-12 h-12 bg-ink-900 border border-ink-600 flex items-center justify-center group-hover:border-gold-500/40 transition-colors text-ink-400 group-hover:text-gold-400 shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-cream-200 group-hover:text-gold-400 truncate transition-colors">{attachment.filename}</p>
                <p className="text-[10px] font-code text-ink-500 uppercase mt-0.5">{attachment.fileType}</p>
            </div>
        </a>
    );
}

function MuseumFooter() {
    return (
        <footer className="border-t border-ink-800 py-8">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <p className="text-[10px] font-code text-ink-500 uppercase tracking-[0.2em]">
                    ⬡ Digital Museum — นิทรรศการผลงานดิจิทัล
                </p>
                <p className="text-[10px] font-code text-ink-600 mt-2">
                    แชร์หน้านี้ให้ผู้สนใจได้โดยคัดลอก URL จากแถบที่อยู่
                </p>
            </div>
        </footer>
    );
}
