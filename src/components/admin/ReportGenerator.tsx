"use client";

import { useState, useEffect, useRef } from "react";
import {
    FileText, Download, Shield, Code, Calendar, FolderOpen,
    Paperclip, Share2, TrendingUp, CheckCircle, AlertTriangle,
    Globe, Database, Printer, BarChart3,
} from "lucide-react";
import {
    getPortfolioProjects,
    getTimelineEvents,
    getSystemStats,
} from "@/app/admin/(protected)/actions";

type ReportType = "executive" | "portfolio" | "timeline" | "system";

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

interface ReportData {
    portfolioCount: number;
    timelineCount: number;
    totalAttachments: number;
    sharedLinks: number;
    portfolioProjects: any[];
    timelineEvents: any[];
    generatedAt: string;
    securityGrade: string;
    sysStats: any | null;
}

const REPORT_TYPES: { id: ReportType; label: string; desc: string; icon: any }[] = [
    { id: "executive", label: "สรุปผู้บริหาร", desc: "ภาพรวมผลงาน ความปลอดภัย เทคโนโลยี", icon: BarChart3 },
    { id: "portfolio", label: "รายงานผลงาน", desc: "รายละเอียดผลงาน/ระบบทั้งหมด", icon: FolderOpen },
    { id: "timeline", label: "รายงานกิจกรรม", desc: "ประวัติการอบรม กิจกรรม ไทม์ไลน์", icon: Calendar },
    { id: "system", label: "รายงานระบบ", desc: "สถานะเซิร์ฟเวอร์ Storage เทคโนโลยี", icon: Database },
];

export default function ReportGenerator() {
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<ReportType>("executive");
    const printRef = useRef<HTMLDivElement>(null);

    async function generateReport() {
        setLoading(true);
        try {
            const [projects, events] = await Promise.all([
                getPortfolioProjects(),
                getTimelineEvents(),
            ]);

            const totalAtt = (projects as any[]).reduce((s: number, p: any) => s + (p.attachments?.length || 0), 0)
                + (events as any[]).reduce((s: number, e: any) => s + (e.attachments?.length || 0), 0);
            const shared = (projects as any[]).filter((p: any) => p.shareSlug).length
                + (events as any[]).filter((e: any) => e.shareSlug).length;

            let sysStats = null;
            try { sysStats = await getSystemStats(); } catch {}

            setReport({
                portfolioCount: projects.length,
                timelineCount: events.length,
                totalAttachments: totalAtt,
                sharedLinks: shared,
                portfolioProjects: projects as any[],
                timelineEvents: events as any[],
                generatedAt: new Date().toLocaleString("th-TH", {
                    year: "numeric", month: "long", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                }),
                securityGrade: "A",
                sysStats,
            });
        } catch {
            /* DB error */
        } finally {
            setLoading(false);
        }
    }

    function handlePrint() {
        window.print();
    }

    useEffect(() => { generateReport(); }, []);

    if (!report) {
        return (
            <div className="flex items-center justify-center p-12 text-ink-400">
                <BarChart3 className="w-5 h-5 animate-pulse mr-2" />
                <span className="font-code text-sm">กำลังสร้างรายงาน...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gold-400" />
                        <h2 className="font-heading text-lg font-bold text-cream-100">รายงานอัจฉริยะ</h2>
                        <span className="font-code text-[10px] text-ink-500 bg-ink-800 px-2 py-0.5 border border-ink-700">
                            สร้างเมื่อ: {report.generatedAt}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={generateReport} className="flex items-center gap-2 px-3 py-2 border border-ink-600 text-ink-300 hover:text-gold-400 hover:border-gold-400/30 text-xs font-code transition-colors">
                            <TrendingUp className="w-3.5 h-3.5" /> รีเฟรช
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white text-xs font-code font-bold hover:bg-gold-400 transition-colors">
                            <Printer className="w-3.5 h-3.5" /> พิมพ์ / ส่งออก PDF
                        </button>
                    </div>
                </div>

                {/* Report Type Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {REPORT_TYPES.map(rt => (
                        <button
                            key={rt.id}
                            onClick={() => setReportType(rt.id)}
                            className={`flex items-center gap-2 px-3 py-3 border text-left transition-all ${reportType === rt.id ? 'border-gold-400 bg-gold-500/10 text-gold-400' : 'border-ink-600 text-ink-400 hover:border-ink-500 hover:text-ink-300'}`}
                        >
                            <rt.icon className="w-4 h-4 shrink-0" />
                            <div>
                                <p className="font-code text-xs font-bold">{rt.label}</p>
                                <p className="font-code text-[9px] opacity-60">{rt.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Printable Report */}
            <div ref={printRef} id="executive-report" className="bg-white text-ink-900 shadow-lg border border-cream-300 print:shadow-none print:border-none" style={{ fontFamily: "'Noto Sans Thai', 'Prompt', sans-serif" }}>

                {/* Cover Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 pb-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-amber-500 flex items-center justify-center rounded">
                                    <span className="font-bold text-white text-lg">PT</span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {reportType === "executive" && "รายงานสรุปผลงานและระบบ"}
                                        {reportType === "portfolio" && "รายงานรายละเอียดผลงาน/ระบบ"}
                                        {reportType === "timeline" && "รายงานกิจกรรมและการฝึกอบรม"}
                                        {reportType === "system" && "รายงานสถานะระบบและเซิร์ฟเวอร์"}
                                    </h1>
                                    <p className="text-sm text-slate-300 mt-0.5">
                                        {reportType === "executive" && "Executive Summary Report"}
                                        {reportType === "portfolio" && "Portfolio & Systems Detail Report"}
                                        {reportType === "timeline" && "Training & Activities Report"}
                                        {reportType === "system" && "System & Infrastructure Report"}
                                        {" — Patompong Tech Consultant"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right text-xs text-slate-400 space-y-1">
                            <p>วันที่ออกรายงาน: {report.generatedAt}</p>
                            <p>ระดับ: Confidential</p>
                            <div className="mt-2 inline-flex items-center gap-1.5 bg-green-500/20 text-green-300 px-3 py-1 rounded text-[11px] font-bold">
                                <Shield className="w-3.5 h-3.5" /> Security Grade: {report.securityGrade}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview — show on executive & system */}
                {(reportType === "executive" || reportType === "system") && (
                    <div className="px-8 -mt-6">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: "ผลงาน/ระบบ", value: report.portfolioCount, icon: FolderOpen, color: "bg-blue-500" },
                                { label: "กิจกรรม/อบรม", value: report.timelineCount, icon: Calendar, color: "bg-emerald-500" },
                                { label: "ไฟล์ประกอบ", value: report.totalAttachments, icon: Paperclip, color: "bg-purple-500" },
                                { label: "ลิงก์แชร์", value: report.sharedLinks, icon: Share2, color: "bg-amber-500" },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white border border-slate-200 shadow-md p-4 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-8 h-8 ${stat.color} rounded flex items-center justify-center`}>
                                            <stat.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-xs text-slate-500">{stat.label}</span>
                                    </div>
                                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Status — executive only */}
                {reportType === "executive" && (
                    <div className="px-8 py-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-amber-500 pb-2 inline-block">
                            Security Assessment
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {[
                                { label: "Security Headers", status: "Grade A", desc: "CSP, HSTS, X-Frame-Options" },
                                { label: "Authentication", status: "Secure", desc: "JWT + bcrypt + HttpOnly cookies" },
                                { label: "Data Protection", status: "Active", desc: "Prisma ORM (SQL Injection prevention)" },
                                { label: "Rate Limiting", status: "Enabled", desc: "Login: 5/min, Upload: 20/min" },
                                { label: "File Upload", status: "Validated", desc: "MIME whitelist + filename sanitization" },
                                { label: "HTTPS/TLS", status: "TLS 1.3", desc: "HSTS preload enabled" },
                            ].map(item => (
                                <div key={item.label} className="flex items-start gap-3 bg-green-50 border border-green-200 p-3 rounded">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-slate-700">{item.label}: <span className="text-green-700">{item.status}</span></p>
                                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* System & Storage — system report type */}
                {reportType === "system" && report.sysStats && (
                    <div className="px-8 py-8 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-purple-500 pb-2 inline-block">
                            Server & Storage Status
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            {[
                                { label: "Node.js", value: report.sysStats.node },
                                { label: "OS", value: report.sysStats.os },
                                { label: "RAM", value: `${report.sysStats.memory.percentage}% (${formatBytes(report.sysStats.memory.used)} / ${formatBytes(report.sysStats.memory.total)})` },
                                { label: "Storage", value: `${report.sysStats.storage.percentage}% (${formatBytes(report.sysStats.storage.used)} / ${formatBytes(report.sysStats.storage.total)})` },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-50 border border-slate-200 p-4 rounded">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-700">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Storage Bar */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Storage Capacity (GitHub Repo Limit: {formatBytes(report.sysStats.storage.total)})</p>
                            <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div className={`h-full rounded-full ${report.sysStats.storage.percentage < 70 ? 'bg-green-500' : report.sysStats.storage.percentage < 90 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${report.sysStats.storage.percentage}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Used: {formatBytes(report.sysStats.storage.used)} ({report.sysStats.storage.percentage}%)</span>
                                <span>Free: {formatBytes(report.sysStats.storage.total - report.sysStats.storage.used)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div className="bg-white border border-slate-200 p-2 rounded text-xs">
                                    <span className="text-slate-500">temp_photos:</span> <strong>{formatBytes(report.sysStats.storage.tempPhotosSize)}</strong>
                                </div>
                                <div className="bg-white border border-slate-200 p-2 rounded text-xs">
                                    <span className="text-slate-500">public + other:</span> <strong>{formatBytes(report.sysStats.storage.used - report.sysStats.storage.tempPhotosSize)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Portfolio List — executive & portfolio */}
                {(reportType === "executive" || reportType === "portfolio") && report.portfolioProjects.length > 0 && (
                    <div className="px-8 py-6 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-blue-500 pb-2 inline-block">
                            รายการผลงานและระบบทั้งหมด ({report.portfolioCount} รายการ)
                        </h2>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-700 text-white">
                                    <th className="text-left py-2.5 px-3 w-8">#</th>
                                    <th className="text-left py-2.5 px-3">ชื่อผลงาน/ระบบ</th>
                                    <th className="text-left py-2.5 px-3">เทคโนโลยี</th>
                                    <th className="text-center py-2.5 px-3 w-16">ไฟล์แนบ</th>
                                    <th className="text-center py-2.5 px-3 w-16">แชร์</th>
                                    <th className="text-center py-2.5 px-3 w-16">แสดงเว็บ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.portfolioProjects.map((p: any, i: number) => (
                                    <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                                        <td className="py-2 px-3">
                                            <p className="font-semibold text-slate-700">{p.title}</p>
                                            {reportType === "portfolio" && p.description && <p className="text-xs text-slate-400 mt-0.5">{p.description}</p>}
                                        </td>
                                        <td className="py-2 px-3">
                                            <div className="flex flex-wrap gap-1">
                                                {p.tags?.split(",").map((t: string) => (
                                                    <span key={t} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">{t.trim()}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-2 px-3 text-center text-slate-600">{p.attachments?.length || 0}</td>
                                        <td className="py-2 px-3 text-center">{p.shareSlug ? "Yes" : "—"}</td>
                                        <td className="py-2 px-3 text-center">{p.isFeatured ? "Yes" : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Timeline List — executive & timeline */}
                {(reportType === "executive" || reportType === "timeline") && report.timelineEvents.length > 0 && (
                    <div className="px-8 py-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-emerald-500 pb-2 inline-block">
                            ประวัติการฝึกอบรมและกิจกรรม ({report.timelineCount} รายการ)
                        </h2>
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-700 text-white">
                                    <th className="text-left py-2.5 px-3 w-8">#</th>
                                    <th className="text-left py-2.5 px-3 w-28">วันที่</th>
                                    <th className="text-left py-2.5 px-3">ชื่อกิจกรรม</th>
                                    <th className="text-left py-2.5 px-3 w-24">หมวดหมู่</th>
                                    <th className="text-left py-2.5 px-3">สถานที่</th>
                                    <th className="text-center py-2.5 px-3 w-16">ไฟล์แนบ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.timelineEvents.map((e: any, i: number) => (
                                    <tr key={e.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                                        <td className="py-2 px-3 text-xs text-slate-600">{new Date(e.date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}</td>
                                        <td className="py-2 px-3">
                                            <p className="font-semibold text-slate-700">{e.title}</p>
                                            {reportType === "timeline" && e.description && <p className="text-xs text-slate-400 mt-0.5">{e.description}</p>}
                                        </td>
                                        <td className="py-2 px-3"><span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200">{e.category}</span></td>
                                        <td className="py-2 px-3 text-xs text-slate-500">{e.location || "—"}</td>
                                        <td className="py-2 px-3 text-center text-slate-600">{e.attachments?.length || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Tech Stack — executive & system */}
                {(reportType === "executive" || reportType === "system") && (
                    <div className="px-8 py-6 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b-2 border-purple-500 pb-2 inline-block">
                            Technology Stack
                        </h2>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                            {[
                                { cat: "Frontend", items: "Next.js 16, React 19, TypeScript, Tailwind CSS" },
                                { cat: "3D/Animation", items: "Three.js, Framer Motion" },
                                { cat: "Database", items: "SQLite (Prisma ORM)" },
                                { cat: "Authentication", items: "JWT (jose), bcrypt.js" },
                                { cat: "Deployment", items: "Netlify, Vercel, GitHub Actions" },
                                { cat: "Security", items: "CSP, HSTS, Rate Limiting, Input Validation" },
                            ].map(item => (
                                <div key={item.cat} className="bg-white border border-slate-200 p-3 rounded">
                                    <p className="font-semibold text-slate-600 text-xs uppercase tracking-wider mb-1">{item.cat}</p>
                                    <p className="text-xs text-slate-500">{item.items}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-800 text-white flex items-center justify-between text-xs">
                    <div>
                        <p className="font-semibold">Patompong Tech Consultant</p>
                        <p className="text-slate-400">นักวิชาการคอมพิวเตอร์ — หน่วยงานภาคท้องถิ่น — นครสวรรค์</p>
                    </div>
                    <div className="text-right text-slate-400">
                        <p>เอกสารนี้สร้างโดยระบบรายงานอัตโนมัติ</p>
                        <p>หน้า 1/1 — {report.generatedAt}</p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #executive-report, #executive-report * { visibility: visible; }
                    #executive-report { position: fixed; inset: 0; width: 100%; overflow: auto; }
                    @page { margin: 0; size: A4; }
                }
            `}</style>
        </div>
    );
}
