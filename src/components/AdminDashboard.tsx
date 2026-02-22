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
  { label: "Google Photos API", value: "Connected", status: "online", icon: ImageIcon },
  { label: "Gemini AI Engine", value: "Active", status: "online", icon: Activity },
  { label: "Security Layer", value: "JWT + HttpOnly", status: "online", icon: Shield },
  { label: "Storage", value: "Cloud-based", status: "online", icon: HardDrive },
];

const galleryStats = [
  { label: "CCTV / Security", count: 0, icon: Camera, color: "text-red-400" },
  { label: "Network / Infra", count: 0, icon: Network, color: "text-blue-400" },
  { label: "Software / Dev", count: 0, icon: Code, color: "text-green-400" },
];

type Tab = "dashboard" | "quotation";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [currentTime, setCurrentTime] = useState("");
  const [uptime, setUptime] = useState("00:00:00");
  const [refreshing, setRefreshing] = useState(false);
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

  async function handleRefreshGallery() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Session Info */}
          <div className="bg-ink-800 border border-ink-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gold-400" />
              <h3 className="font-code text-sm text-gold-400 uppercase tracking-wider">Session</h3>
            </div>

            <div className="space-y-3 font-code text-sm">
              <div className="flex justify-between">
                <span className="text-ink-400">Session Uptime</span>
                <span className="text-green-400 tabular-nums">{uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Auth Method</span>
                <span className="text-cream-200">JWT HS256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Cookie</span>
                <span className="text-cream-200">HttpOnly + Secure</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">CSRF</span>
                <span className="text-cream-200">SameSite: Lax</span>
              </div>
            </div>
          </div>

          {/* Gallery Stats */}
          <div className="bg-ink-800 border border-ink-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold-400" />
                <h3 className="font-code text-sm text-gold-400 uppercase tracking-wider">Gallery</h3>
              </div>
              <button
                onClick={handleRefreshGallery}
                disabled={refreshing}
                className="p-1.5 border border-ink-600 hover:border-gold-400/30 text-ink-400 hover:text-gold-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="space-y-4">
              {galleryStats.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <cat.icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="font-code text-xs text-ink-300">{cat.label}</span>
                  </div>
                  <span className="font-code text-sm text-cream-200 tabular-nums">{cat.count}</span>
                </div>
              ))}
              <hr className="border-ink-700" />
              <div className="flex justify-between">
                <span className="font-code text-xs text-ink-400">Total</span>
                <span className="font-code text-sm text-gold-400 font-bold tabular-nums">
                  {galleryStats.reduce((a, b) => a + b.count, 0)}
                </span>
              </div>
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
                onClick={handleRefreshGallery}
                className="w-full flex items-center gap-3 p-3 border border-ink-600 hover:border-gold-400/30 text-ink-300 hover:text-gold-400 transition-colors text-left"
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-code text-xs">Sync Google Photos</p>
                  <p className="font-code text-[10px] text-ink-500">Fetch & classify new images</p>
                </div>
              </button>

              <a
                href="/"
                target="_blank"
                className="w-full flex items-center gap-3 p-3 border border-ink-600 hover:border-gold-400/30 text-ink-300 hover:text-gold-400 transition-colors"
              >
                <Activity className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-code text-xs">View Public Site</p>
                  <p className="font-code text-[10px] text-ink-500">Open in new tab</p>
                </div>
              </a>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 border border-ink-600 hover:border-red-400/30 text-ink-300 hover:text-red-400 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <div>
                  <p className="font-code text-xs">End Session</p>
                  <p className="font-code text-[10px] text-ink-500">Logout & clear cookies</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-gold-400" />
            <h2 className="font-code text-sm text-gold-400 uppercase tracking-wider">Activity Log</h2>
          </div>

          <div className="bg-ink-800 border border-ink-700 p-4 font-code text-xs space-y-1.5 max-h-48 overflow-auto">
            <p className="text-green-400">[SYSTEM] Session authenticated successfully</p>
            <p className="text-ink-400">[INFO] Dashboard loaded</p>
            <p className="text-ink-400">[INFO] Security headers active: X-Frame-Options, X-Content-Type-Options, Referrer-Policy</p>
            <p className="text-yellow-400">[WARN] Google Photos API — Refresh token may need scope update</p>
            <p className="text-ink-400">[INFO] Gemini AI classifier standby</p>
            <p className="text-ink-500">[SYS] Awaiting commands...</p>
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  );
}
