"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Camera,
  Network,
  Code,
  Activity,
  Shield,
  Clock,
  Image as ImageIcon,
  Users,
  Terminal,
  FileText,
  Paperclip,
  Share2,
  Calendar,
  FolderOpen,
  Database,
  Zap,
  Globe,
  TrendingUp,
} from "lucide-react";
import QuotationManager from "@/components/admin/QuotationManager";
import GalleryManager from "@/components/admin/GalleryManager";
import PortfolioManager from "@/components/admin/PortfolioManager";
import TimelineManager from "@/components/admin/TimelineManager";
import ReportGenerator from "@/components/admin/ReportGenerator";
import {
  getPortfolioProjects,
  getTimelineEvents,
  getSystemStats,
} from "@/app/admin/(protected)/actions";
import { logoutAction } from "@/app/admin/login/actions";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i];
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d} วัน ${h} ชม. ${m} นาที`;
  if (h > 0) return `${h} ชม. ${m} นาที`;
  return `${m} นาที`;
}

interface SysStats {
  memory: { used: number; total: number; percentage: number };
  storage: { used: number; total: number; percentage: number; tempPhotosSize: number };
  os: string;
  node: string;
  uptime: number;
}

type Tab = "dashboard" | "quotation" | "gallery" | "portfolio" | "timeline" | "report";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentTime, setCurrentTime] = useState("");
  const [uptime, setUptime] = useState("00:00:00");
  const [stats, setStats] = useState({
    portfolioCount: 0,
    timelineCount: 0,
    totalAttachments: 0,
    sharedLinks: 0,
  });
  const [sysStats, setSysStats] = useState<SysStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString("th-TH", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      setUptime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const [projects, events] = await Promise.all([
          getPortfolioProjects(),
          getTimelineEvents(),
        ]);
        const totalAtt = (projects as any[]).reduce((sum: number, p: any) => sum + (p.attachments?.length || 0), 0)
          + (events as any[]).reduce((sum: number, e: any) => sum + (e.attachments?.length || 0), 0);
        const sharedLinks = (projects as any[]).filter((p: any) => p.shareSlug).length
          + (events as any[]).filter((e: any) => e.shareSlug).length;
        setStats({
          portfolioCount: projects.length,
          timelineCount: events.length,
          totalAttachments: totalAtt,
          sharedLinks,
        });
      } catch { /* DB not available */ }
    }
    loadStats();
  }, [activeTab]);

  useEffect(() => {
    async function loadSysStats() {
      try {
        const data = await getSystemStats();
        setSysStats(data);
      } catch { /* server action unavailable */ }
    }
    loadSysStats();
    const interval = setInterval(loadSysStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  const statusColor = {
    online: "bg-green-500",
    warning: "bg-yellow-500",
    offline: "bg-red-500",
  };

  const dashboardCards = [
    { label: "ผลงาน / ระบบ", value: stats.portfolioCount, icon: FolderOpen, color: "text-gold-400", bg: "from-gold-500/10 to-gold-600/5", tab: "portfolio" as Tab },
    { label: "ไทม์ไลน์ / กิจกรรม", value: stats.timelineCount, icon: Calendar, color: "text-blue-400", bg: "from-blue-500/10 to-blue-600/5", tab: "timeline" as Tab },
    { label: "ไฟล์แนบรวม", value: stats.totalAttachments, icon: Paperclip, color: "text-purple-400", bg: "from-purple-500/10 to-purple-600/5", tab: "portfolio" as Tab },
    { label: "ลิงก์แชร์สาธารณะ", value: stats.sharedLinks, icon: Share2, color: "text-green-400", bg: "from-green-500/10 to-green-600/5", tab: "portfolio" as Tab },
  ];

  return (
    <div className="min-h-screen bg-ink-900 text-cream-100">
      {/* Scanline effect */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {/* Top Bar */}
      <header className="bg-ink-800 border-b border-ink-700 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-gold-400" />
            <span className="font-heading text-lg font-bold text-cream-100">Admin Panel</span>
          </div>
          {/* Tabs */}
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            {([
              { id: "dashboard" as Tab, label: "Dashboard", icon: Activity },
              { id: "quotation" as Tab, label: "ใบเสนอราคา", icon: FileText },
              { id: "gallery" as Tab, label: "รูปภาพ (Claude)", icon: ImageIcon },
              { id: "portfolio" as Tab, label: "ผลงาน/ระบบ", icon: Code },
              { id: "timeline" as Tab, label: "ไทม์ไลน์", icon: Calendar },
              { id: "report" as Tab, label: "รายงาน", icon: TrendingUp },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-code transition-colors border-b-2 ${activeTab === tab.id
                  ? "border-gold-400 text-gold-400"
                  : "border-transparent text-ink-400 hover:text-ink-200"
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-code text-xs text-ink-400 hidden sm:block">{currentTime}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-code text-ink-300 hover:text-red-400 border border-ink-600 hover:border-red-400/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === "quotation" && <QuotationManager />}
        {activeTab === "gallery" && <GalleryManager />}
        {activeTab === "portfolio" && <PortfolioManager />}
        {activeTab === "timeline" && <TimelineManager />}
        {activeTab === "report" && <ReportGenerator />}
        {activeTab === "dashboard" && (
          <>
            {/* Live Stats Cards */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-gold-400" />
                <h2 className="font-code text-sm text-gold-400 uppercase tracking-wider">ภาพรวมข้อมูล (Live)</h2>
                <div className="flex-1 h-px bg-ink-700 ml-2" />
                <span className="font-code text-[10px] text-ink-500">Session: {uptime}</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardCards.map(card => (
                  <button
                    key={card.label}
                    onClick={() => setActiveTab(card.tab)}
                    className={`bg-gradient-to-br ${card.bg} bg-ink-800 border border-ink-700 hover:border-gold-500/30 p-5 text-left transition-all duration-300 group`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                      <span className="text-[10px] font-code text-ink-500 group-hover:text-ink-400 transition-colors">คลิกเพื่อจัดการ →</span>
                    </div>
                    <p className="text-3xl font-heading font-bold text-cream-100">{card.value}</p>
                    <p className="text-xs text-ink-400 mt-1 font-code">{card.label}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Storage Capacity Tracker */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-gold-400" />
                <h2 className="font-code text-sm text-gold-400 uppercase tracking-wider">Storage Capacity (GitHub Repo)</h2>
                <div className="flex-1 h-px bg-ink-700 ml-2" />
                {sysStats && <span className="font-code text-[10px] text-ink-500">อัปเดตทุก 30 วินาที</span>}
              </div>

              {sysStats ? (
                <div className="bg-ink-800 border border-ink-700 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-code text-xs text-ink-400">ใช้งานไปแล้ว</p>
                      <p className="font-heading text-2xl font-bold text-cream-100">{formatBytes(sysStats.storage.used)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-code text-xs text-ink-400">ขีดจำกัด GitHub</p>
                      <p className="font-heading text-2xl font-bold text-cream-100">{formatBytes(sysStats.storage.total)}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-4 bg-ink-900 rounded-full overflow-hidden border border-ink-600 mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        sysStats.storage.percentage < 70 ? "bg-gradient-to-r from-green-600 to-green-400" :
                        sysStats.storage.percentage < 90 ? "bg-gradient-to-r from-yellow-600 to-yellow-400" :
                        "bg-gradient-to-r from-red-600 to-red-400"
                      }`}
                      style={{ width: `${sysStats.storage.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`font-code text-sm font-bold ${
                      sysStats.storage.percentage < 70 ? "text-green-400" :
                      sysStats.storage.percentage < 90 ? "text-yellow-400" :
                      "text-red-400"
                    }`}>{sysStats.storage.percentage}% ใช้งาน</span>
                    <span className="font-code text-xs text-ink-400">เหลือ: {formatBytes(sysStats.storage.total - sysStats.storage.used)}</span>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-ink-900 border border-ink-700 p-3 rounded">
                      <p className="font-code text-[10px] text-ink-500 uppercase">temp_photos</p>
                      <p className="font-code text-sm text-cream-200 font-bold">{formatBytes(sysStats.storage.tempPhotosSize)}</p>
                    </div>
                    <div className="bg-ink-900 border border-ink-700 p-3 rounded">
                      <p className="font-code text-[10px] text-ink-500 uppercase">public + อื่นๆ</p>
                      <p className="font-code text-sm text-cream-200 font-bold">{formatBytes(sysStats.storage.used - sysStats.storage.tempPhotosSize)}</p>
                    </div>
                  </div>

                  {/* Warning */}
                  {sysStats.storage.percentage > 85 && (
                    <div className="bg-red-900/30 border border-red-500/40 p-4 rounded">
                      <p className="font-code text-sm text-red-400 font-bold mb-2">⚠ พื้นที่จัดเก็บใกล้เต็ม!</p>
                      <ul className="font-code text-xs text-red-300/80 space-y-1">
                        <li>• พิจารณาย้ายรูปภาพไปใช้ Cloud Storage (Cloudinary, S3)</li>
                        <li>• บีบอัดรูปภาพก่อนอัปโหลด (ลดขนาด 50-80%)</li>
                        <li>• ลบไฟล์ที่ไม่ใช้แล้วออกจาก repo</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-ink-800 border border-ink-700 p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-400 mx-auto mb-2" />
                  <p className="font-code text-xs text-ink-400">กำลังโหลดข้อมูล Storage...</p>
                </div>
              )}
            </section>

            {/* System Status — Real-time */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-gold-400" />
                <h2 className="font-code text-sm text-gold-400 uppercase tracking-wider">System Status</h2>
                <div className="flex-1 h-px bg-ink-700 ml-2" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {([
                  { label: "Node.js", value: sysStats?.node || "...", status: "online" as const, icon: Terminal },
                  { label: "OS / Arch", value: sysStats?.os?.split(" ").slice(0, 2).join(" ") || "...", status: "online" as const, icon: Shield },
                  { label: "RAM Usage", value: sysStats ? `${sysStats.memory.percentage}% (${formatBytes(sysStats.memory.used)})` : "...", status: (sysStats && sysStats.memory.percentage > 85 ? "warning" : "online") as "online" | "warning" | "offline", icon: Activity },
                  { label: "Server Uptime", value: sysStats ? formatUptime(sysStats.uptime) : "...", status: "online" as const, icon: Clock },
                  { label: "Frontend", value: "Next.js 16 + Turbopack", status: "online" as const, icon: Code },
                  { label: "Database", value: "SQLite + Prisma ORM", status: "online" as const, icon: Database },
                ]).map((s) => (
                  <div key={s.label} className="bg-ink-800 border border-ink-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-4 h-4 text-ink-400" />
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusColor[s.status]} animate-pulse`} />
                        <span className="font-code text-[9px] text-ink-400 uppercase">{s.status}</span>
                      </div>
                    </div>
                    <p className="font-code text-[10px] text-ink-500 leading-tight">{s.label}</p>
                    <p className="font-code text-xs text-cream-200 mt-0.5 leading-tight">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions + Activity Log */}
            <section className="grid md:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <div className="bg-ink-800 border border-ink-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gold-400" />
                  <h3 className="font-code text-sm text-gold-400 uppercase tracking-wider">Quick Actions</h3>
                </div>

                <div className="space-y-2">
                  {([
                    { label: "จัดการผลงาน / ระบบ", desc: "เพิ่ม แก้ไข ลบ แนบไฟล์ แชร์", icon: FolderOpen, tab: "portfolio" as Tab, color: "gold" },
                    { label: "จัดการไทม์ไลน์", desc: "บันทึกกิจกรรม อบรม และเหตุการณ์", icon: Calendar, tab: "timeline" as Tab, color: "blue" },
                    { label: "จัดการรูปภาพ", desc: "กำลัง migrate ไป Claude", icon: ImageIcon, tab: "gallery" as Tab, color: "purple" },
                    { label: "ใบเสนอราคา", desc: "สร้างและจัดการเอกสาร", icon: FileText, tab: "quotation" as Tab, color: "green" },
                  ]).map(action => (
                    <button
                      key={action.label}
                      onClick={() => setActiveTab(action.tab)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-ink-900 border border-ink-700 hover:border-gold-500/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 text-ink-300 group-hover:text-gold-400 transition-colors">
                        <action.icon className="w-4 h-4" />
                        <div className="text-left">
                          <p className="font-code text-sm">{action.label}</p>
                          <p className="font-code text-[10px] text-ink-500">{action.desc}</p>
                        </div>
                      </div>
                      <span className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </button>
                  ))}

                  <button
                    onClick={() => window.open("/", "_blank")}
                    className="w-full flex items-center justify-between px-4 py-3 bg-ink-900 border border-ink-700 hover:border-green-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 text-ink-300 group-hover:text-green-400 transition-colors">
                      <Globe className="w-4 h-4" />
                      <div className="text-left">
                        <p className="font-code text-sm">ดูเว็บไซต์สาธารณะ</p>
                        <p className="font-code text-[10px] text-ink-500">เปิดหน้าแรกในแท็บใหม่</p>
                      </div>
                    </div>
                    <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 bg-ink-900 border border-ink-700 hover:border-red-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 text-ink-300 group-hover:text-red-400 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <div className="text-left">
                        <p className="font-code text-sm">End Session</p>
                        <p className="font-code text-[10px] text-ink-500">Logout & clear cookies</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Activity Log */}
              <div className="bg-ink-800 border border-ink-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-4 h-4 text-gold-400" />
                  <h3 className="font-code text-sm text-gold-400 uppercase tracking-wider">System Log</h3>
                </div>
                <div className="bg-ink-900 border border-ink-700 p-4 font-code text-xs space-y-1.5 max-h-72 overflow-auto">
                  <p className="text-green-400">[OK] Session authenticated via HttpOnly cookie</p>
                  <p className="text-green-400">[OK] Prisma ORM connected — SQLite (local dev.db)</p>
                  {sysStats && <p className="text-green-400">[OK] Node.js {sysStats.node} — {sysStats.os}</p>}
                  {sysStats && <p className="text-green-400">[OK] RAM: {formatBytes(sysStats.memory.used)} / {formatBytes(sysStats.memory.total)} ({sysStats.memory.percentage}%)</p>}
                  {sysStats && <p className={sysStats.storage.percentage > 85 ? "text-red-400" : sysStats.storage.percentage > 70 ? "text-yellow-400" : "text-green-400"}>[STORAGE] {formatBytes(sysStats.storage.used)} / {formatBytes(sysStats.storage.total)} ({sysStats.storage.percentage}%)</p>}
                  {sysStats && <p className="text-blue-400">[SYS] Server uptime: {formatUptime(sysStats.uptime)}</p>}
                  <p className="text-blue-400">[DB] Portfolio records: {stats.portfolioCount}</p>
                  <p className="text-blue-400">[DB] Timeline records: {stats.timelineCount}</p>
                  <p className="text-blue-400">[DB] Attachments: {stats.totalAttachments}</p>
                  <p className="text-blue-400">[DB] Shared links: {stats.sharedLinks}</p>
                  <p className="text-ink-400">[INFO] Share pages enabled at /share/[slug]</p>
                  <p className="text-ink-500">[SYS] Session: {uptime}</p>
                  <p className="text-ink-500">[SYS] Awaiting commands...</p>
                </div>

                {/* Tech Stack */}
                <div className="mt-4 pt-4 border-t border-ink-700">
                  <p className="font-code text-[10px] text-ink-500 uppercase tracking-wider mb-2">Tech Stack</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Next.js 16", "React 19", "TypeScript", "Prisma", "SQLite", "Three.js", "Framer Motion", "Lucide Icons"].map(tech => (
                      <span key={tech} className="text-[9px] font-code px-2 py-0.5 border border-ink-600 text-ink-400 bg-ink-900/50">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
