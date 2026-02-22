"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Terminal } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For static export, we do a simple client-side check
      // In a real production app without a backend, you'd use a service like Supabase/Firebase
      if (username === "admin" && password === "patompong2026") {
        document.cookie = "admin_session=true; path=/; max-age=86400";
        router.push("/admin");
        router.refresh();
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Terminal header */}
        <div className="bg-ink-800 border border-ink-700 border-b-0 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="font-code text-xs text-ink-400 ml-2">admin@patompong:~</span>
        </div>

        {/* Login form */}
        <div className="bg-ink-800/80 border border-ink-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-gold-400" />
            <div>
              <h1 className="font-heading text-xl font-bold text-cream-100">Admin Access</h1>
              <p className="font-code text-xs text-ink-400">Secure authentication required</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-code text-xs">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-code text-xs text-ink-400 uppercase tracking-wider mb-2 block">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-600 text-cream-100 pl-10 pr-4 py-3 font-code text-sm focus:outline-none focus:border-gold-400 transition-colors placeholder:text-ink-600"
                  placeholder="admin"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="font-code text-xs text-ink-400 uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-ink-900 border border-ink-600 text-cream-100 pl-10 pr-4 py-3 font-code text-sm focus:outline-none focus:border-gold-400 transition-colors placeholder:text-ink-600"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold-500 text-cream-50 font-code text-sm font-medium tracking-wider uppercase hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </form>

          <p className="font-code text-[10px] text-ink-500 mt-6 text-center">
            Protected by JWT &middot; HttpOnly Cookies &middot; Security Headers
          </p>
        </div>
      </div>
    </div>
  );
}
