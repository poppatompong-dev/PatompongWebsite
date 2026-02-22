"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Camera,
  Network,
  Code,
  RefreshCw,
  Activity,
  HardDrive,
  Shield,
  Clock,
  Image as ImageIcon,
  Users,
  Terminal,
  FileText,
} from "lucide-react";
import QuotationManager from "@/components/admin/QuotationManager";

interface SystemStatus {
  label: string;
  value: string;
  status: "online" | "warning" | "offline";
  icon: React.ElementType;
}

const systemStatuses: SystemStatus[] = [
  { label: "Security Layer", value: "JWT + HttpOnly", status: "online", icon: Shield },
  { label: "Frontend", value: "Next.js App Router", status: "online", icon: Code },
  { label: "Gallery Engine", value: "Curated JSON", status: "online", icon: ImageIcon },
  { label: "Quotation System", value: "Active", status: "online", icon: FileText },
];

const galleryStats = [
  { label: "CCTV & Security",   count: 7, icon: Camera,  color: "text-blue-400" },
  { label: "Network & Fiber",   count: 7, icon: Network, color: "text-emerald-400" },
  { label: "Software & AI",     count: 7, icon: Code,    color: "text-purple-400" },
  { label: "On-site Work",      count: 7, icon: HardDrive, color: "text-orange-400" },
  { label: "Team & Training",   count: 7, icon: Users,   color: "text-pink-400" },
];

type Tab = "dashboard" | "quotation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentTime, setCurrentTime] = useState("");
  const [uptime, setUptime] = useState("00:00:00");
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

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const statusColor = {
    online: "bg-green-500",
    warning: "bg-yellow-500",
    offline: "bg-red-500",
  };

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
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-code transition-colors border-b-2 ${
                activeTab === "dashboard"
                  ? "border-gold-400 text-gold-400"
                  : "border-transparent text-ink-400 hover:text-ink-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("quotation")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-code transition-colors border-b-2 ${
                activeTab === "quotation"
                  ? "border-gold-400 text-gold-400"
                  : "border-transparent text-ink-400 hover:text-ink-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              ใบเสนอราคา
            </button>
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
        {activeTab !== "quotation" && (
          <>
            {/* System Status Panel */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-gold-400" />
                <h2 className="font-code text-sm text-gold-400 uppercase tracking-wider">System Status</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemStatuses.map((s) => (
                  <div key={s.label} className="bg-ink-800 border border-ink-700 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <s.icon className="w-5 h-5 text-ink-400" />
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${statusColor[s.status]} animate-pulse`} />
                        <span className="font-code text-[10px] text-ink-400 uppercase">{s.status}</span>
                      </div>
                    </div>
                    <p className="font-code text-xs text-ink-400">{s.label}</p>
                    <p className="font-code text-sm text-cream-200 mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Dashboard Grid */}
            <section className="grid md:grid-cols-2 gap-8">
              {/* Gallery Stats */}
              <div className="bg-ink-800 border border-ink-700 p-6">
                <h3 className="font-heading text-lg font-semibold text-cream-100 mb-6 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-gold-400" />
                  ภาพผลงานในระบบ (Curated)
                </h3>
                <div className="space-y-4">
                  {galleryStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-ink-900 border border-ink-700 flex items-center justify-center">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <span className="font-code text-sm text-ink-300">{stat.label}</span>
                      </div>
                      <span className="font-code font-semibold text-cream-200">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-ink-800 border border-ink-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gold-400" />
                  <h3 className="font-code text-sm text-gold-400 uppercase tracking-wider">Quick Actions</h3>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/#portfolio")}
                    className="w-full flex items-center justify-between px-4 py-3 bg-ink-900 border border-ink-700 hover:border-gold-500/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 text-ink-300 group-hover:text-gold-400 transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      <span className="font-code text-sm">View Live Gallery</span>
                    </div>
                    <span className="text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
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
            </section>

            {/* Activity Log */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-4 h-4 text-gold-400" />
                <h2 className="font-code text-sm text-gold-400 uppercase tracking-wider">Activity Log</h2>
              </div>

              <div className="bg-ink-800 border border-ink-700 p-4 font-code text-xs space-y-1.5 max-h-48 overflow-auto">
                <p className="text-green-400">[SYSTEM] Session authenticated successfully</p>
                <p className="text-ink-400">[INFO] Dashboard loaded in static JSON mode</p>
                <p className="text-ink-400">[INFO] Security headers active: X-Frame-Options, X-Content-Type-Options, Referrer-Policy</p>
                <p className="text-ink-500">[SYS] Awaiting commands...</p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
