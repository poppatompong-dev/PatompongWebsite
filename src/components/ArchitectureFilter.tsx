"use client";

import { BarChart3, Bot, Database, Globe, Grid3X3, Layers, LayoutList } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface ArchLayer {
  label: string;
  desc: string;
  techs: string[];
  color: string;
  categoryId: string;
}

const ARCH_LAYERS: ArchLayer[] = [
  {
    label: "Presentation Layer",
    desc: "ส่วนติดต่อผู้ใช้ — เว็บแอป, Dashboard, Mobile-ready UI",
    techs: ["React", "Firebase", "Netlify", "Vercel"],
    color: "from-cyan-500 to-blue-600",
    categoryId: "cat_web",
  },
  {
    label: "Analytics Layer",
    desc: "วิเคราะห์และแสดงผลข้อมูล — รายงาน Real-time",
    techs: ["Google Looker Studio", "Charts", "KPI Monitors"],
    color: "from-pink-500 to-rose-600",
    categoryId: "cat_analytics",
  },
  {
    label: "Data & Logic Layer",
    desc: "จัดเก็บ ประมวลผล และจัดการข้อมูลหลัก",
    techs: ["AppSheet", "Google Sheets", "Cloud SQL"],
    color: "from-violet-500 to-purple-600",
    categoryId: "cat_database",
  },
  {
    label: "Automation Layer",
    desc: "ระบบอัตโนมัติ — สร้างเอกสาร, แจ้งเตือน, Sync",
    techs: ["Google Apps Script", "LINE API", "Webhooks"],
    color: "from-amber-500 to-orange-600",
    categoryId: "cat_automation",
  },
  {
    label: "Infrastructure Layer",
    desc: "โครงสร้างพื้นฐาน — แผนที่, เครือข่าย, ระบบกายภาพ",
    techs: ["Google Earth", "CCTV", "Fiber Optic", "Wireless"],
    color: "from-emerald-500 to-green-600",
    categoryId: "cat_mapping",
  },
];

const ICONS = [Globe, BarChart3, Database, Bot, Layers];

interface Props {
  activeCategoryId: string;
}

export default function ArchitectureFilter({ activeCategoryId }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCategory = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (categoryId && categoryId !== activeCategoryId) {
        params.set("categoryId", categoryId);
      } else {
        params.delete("categoryId");
      }
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(`${nextUrl}#project-listing`, { scroll: false });
    },
    [pathname, router, searchParams, activeCategoryId],
  );

  return (
    <div className="mt-8 space-y-2">
      {ARCH_LAYERS.map((layer, i) => {
        const IconComponent = ICONS[i];
        const isActive = activeCategoryId === layer.categoryId;
        return (
          <button
            key={layer.label}
            type="button"
            onClick={() => setCategory(layer.categoryId)}
            className={`group w-full overflow-hidden rounded-xl border text-left transition-all duration-200 ${
              isActive
                ? "border-gold-400 bg-gold-50 shadow-md ring-1 ring-gold-400/30"
                : "card-retro card-retro-hover border-cream-300"
            }`}
          >
            <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${layer.color} text-white shadow-sm`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-sm font-bold transition-colors ${isActive ? "text-gold-700" : "text-ink-800"}`}>
                  {layer.label}
                </h3>
                <p className="truncate text-xs text-ink-500">{layer.desc}</p>
              </div>
              <div className="hidden flex-wrap gap-1.5 sm:flex sm:justify-end">
                {layer.techs.map((tech) => (
                  <span
                    key={tech}
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-code uppercase tracking-wide transition-colors ${
                      isActive
                        ? "border-gold-300 bg-gold-100 text-gold-700"
                        : "border-cream-300 bg-cream-50 text-ink-400"
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
              {isActive && (
                <span className="ml-2 shrink-0 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  กำลังกรอง
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface ViewToggleProps {
  view: "grid" | "table";
  onViewChange: (v: "grid" | "table") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-cream-300 bg-white p-0.5">
      <button
        type="button"
        onClick={() => onViewChange("grid")}
        title="Grid view"
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
          view === "grid" ? "bg-gold-500 text-white shadow-sm" : "text-ink-400 hover:text-ink-700"
        }`}
      >
        <Grid3X3 className="h-3.5 w-3.5" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onViewChange("table")}
        title="Table view"
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
          view === "table" ? "bg-gold-500 text-white shadow-sm" : "text-ink-400 hover:text-ink-700"
        }`}
      >
        <LayoutList className="h-3.5 w-3.5" />
        ตาราง
      </button>
    </div>
  );
}
