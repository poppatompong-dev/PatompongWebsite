"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink, Layers } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import { ViewToggle } from "@/components/ArchitectureFilter";
import type { ShowcaseProjectRecord } from "@/lib/portfolio-showcase";

interface Project {
  id: string;
  slug: string;
  projectId: string;
  projectNumber: number;
  projectName: string;
  description: string | null;
  type: string;
  subcategory: string;
  url: string | null;
  status: string;
  startDate: Date | null;
  completedDate: Date | null;
  tags: string[];
  keywords: string | null;
  clientName: string;
  client: { clientName: string };
  category: { categoryId: string; name: string; color: string | null };
}

interface ProjectsListingProps {
  projects: Project[];
  showcaseBySlug: Record<string, ShowcaseProjectRecord>;
  totalProjects: number;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed: { label: "เสร็จสิ้น", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  in_progress: { label: "กำลังดำเนิน", color: "text-sky-700 bg-sky-50 border-sky-200" },
  planning: { label: "วางแผน", color: "text-amber-700 bg-amber-50 border-amber-200" },
};

type GroupBy = "none" | "category" | "year" | "type" | "status" | "client";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "none", label: "ไม่จัดกลุ่ม" },
  { value: "category", label: "หมวดหมู่" },
  { value: "year", label: "ปีที่เสร็จ" },
  { value: "type", label: "ประเภทระบบ" },
  { value: "status", label: "สถานะ" },
  { value: "client", label: "หน่วยงาน" },
];

function getGroupKey(project: Project, groupBy: GroupBy): string {
  switch (groupBy) {
    case "category": return project.category?.name || "ไม่ระบุหมวดหมู่";
    case "year": {
      const d = project.completedDate || project.startDate;
      return d ? new Date(d).getFullYear().toString() : "ไม่ระบุปี";
    }
    case "type": return project.type || "ไม่ระบุประเภท";
    case "status": return STATUS_LABEL[project.status]?.label || project.status;
    case "client": return project.clientName || "";
    default: return "";
  }
}

function groupProjects(
  projects: Project[],
  groupBy: GroupBy,
): { key: string; projects: Project[] }[] {
  if (groupBy === "none") return [{ key: "", projects }];
  const map = new Map<string, Project[]>();
  for (const p of projects) {
    const key = getGroupKey(p, groupBy);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      if (groupBy === "year") return b.localeCompare(a);
      return a.localeCompare(b);
    })
    .map(([key, projects]) => ({ key, projects }));
}

function AutoScrollTable({ projects }: { projects: Project[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const speedRef = useRef(0.5);
  const rafRef = useRef<number>(0);

  // Duplicate list for seamless loop
  const doubled = [...projects, ...projects];

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!paused) {
      el.scrollTop += speedRef.current;
      // When scrolled past the first copy, jump back seamlessly
      const halfHeight = el.scrollHeight / 2;
      if (el.scrollTop >= halfHeight) {
        el.scrollTop -= halfHeight;
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [paused]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <div
      ref={scrollRef}
      className="relative max-h-[420px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setHoveredId(null); }}
    >
      <div className="divide-y divide-cream-100">
        {doubled.map((project, idx) => {
          const statusInfo = STATUS_LABEL[project.status] || STATUS_LABEL.planning;
          const isHovered = hoveredId === `${project.id}-${idx}`;
          return (
            <div
              key={`${project.id}-${idx}`}
              onMouseEnter={() => setHoveredId(`${project.id}-${idx}`)}
              onMouseLeave={() => setHoveredId(null)}
              className={`flex items-center gap-3 px-4 transition-all duration-300 ease-out cursor-default ${isHovered
                  ? "py-5 bg-gradient-to-r from-gold-50 via-amber-50/80 to-cream-50 border-l-4 border-l-gold-500 shadow-md scale-[1.01] z-10 relative"
                  : hoveredId
                    ? "py-3 bg-white/60 opacity-60"
                    : "py-3 bg-white"
                }`}
            >
              {/* # */}
              <span className={`font-code shrink-0 transition-all duration-300 ${isHovered ? "text-sm font-bold text-gold-600 w-10" : "text-[11px] text-ink-400 w-8"
                }`}>
                #{String(project.projectNumber).padStart(2, "0")}
              </span>

              {/* Project name + description */}
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isHovered ? "pr-2" : ""}`}>
                <p className={`font-semibold transition-all duration-300 truncate ${isHovered ? "text-base text-gold-700" : "text-sm text-ink-800"
                  }`}>
                  {project.projectName}
                </p>
                {isHovered && project.description && (
                  <p className="mt-1 text-xs text-ink-500 line-clamp-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Type badge */}
              <span className={`hidden sm:inline-block shrink-0 rounded-md border font-code uppercase tracking-wide transition-all duration-300 ${isHovered
                  ? "border-gold-400 bg-gold-100 px-2.5 py-1 text-[11px] text-gold-800 font-semibold"
                  : "border-gold-200 bg-gold-50 px-2 py-0.5 text-[10px] text-gold-700"
                }`}>
                {project.type}
              </span>

              {/* Client name */}
              <span className={`hidden lg:inline-block shrink-0 transition-all duration-300 ${isHovered ? "text-sm text-ink-700 font-medium" : "text-xs text-ink-500"
                }`}>
                {project.clientName}
              </span>

              {/* Status */}
              <span className={`shrink-0 rounded-full border font-semibold transition-all duration-300 ${statusInfo.color} ${isHovered ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]"
                }`}>
                {statusInfo.label}
              </span>

              {/* Action */}
              <div className={`shrink-0 flex items-center gap-1.5 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0 sm:opacity-70"}`}>
                <Link
                  href={`/projects/${project.slug}`}
                  className={`rounded-lg border font-semibold transition-all duration-200 ${isHovered
                      ? "border-gold-400 bg-gold-500 text-white px-3 py-1.5 text-xs shadow-sm hover:bg-gold-600"
                      : "border-cream-300 bg-white text-ink-500 px-2.5 py-1.5 text-[11px] hover:border-gold-400 hover:text-gold-600"
                    }`}
                >
                  รายละเอียด
                </Link>
                {project.url && isHovered && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-gold-300 bg-gold-50 p-1.5 text-gold-600 transition-colors hover:bg-gold-100"
                    title="เปิดระบบจริง"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProjectGroup({
  groupKey,
  projects,
  showcaseBySlug,
  view,
  defaultOpen,
}: {
  groupKey: string;
  projects: Project[];
  showcaseBySlug: Record<string, ShowcaseProjectRecord>;
  view: "grid" | "table";
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-cream-200 bg-white shadow-sm">
      {groupKey && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 border-b border-cream-200 bg-cream-50 px-4 py-3 text-left transition-colors hover:bg-cream-100"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-gold-500 shrink-0" />
            <span className="font-heading text-base font-semibold text-ink-800">{groupKey}</span>
            <span className="rounded-full bg-gold-500 px-2 py-0.5 font-code text-[10px] font-bold text-white">
              {projects.length}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      )}

      {open && (
        <>
          {view === "grid" && (
            <div className="grid gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={{ ...project, client: { clientName: project.clientName } }}
                  showcase={showcaseBySlug[project.slug] || null}
                  tags={project.tags}
                />
              ))}
            </div>
          )}

          {view === "table" && (
            <AutoScrollTable projects={projects} />
          )}
        </>
      )}
    </div>
  );
}

export default function ProjectsListing({
  projects,
  showcaseBySlug,
  totalProjects,
}: ProjectsListingProps) {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  const groups = groupProjects(projects, groupBy);

  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-code text-xs uppercase tracking-[0.15em] text-gold-500">Showcase Results</span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink-800 sm:text-3xl">
            พบ {projects.length} โครงการ
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Group By selector */}
          <div className="flex items-center gap-2 rounded-lg border border-cream-300 bg-white px-3 py-2">
            <Layers className="h-3.5 w-3.5 text-gold-500 shrink-0" />
            <span className="font-code text-[10px] uppercase tracking-wider text-ink-400">จัดกลุ่มตาม</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="bg-transparent font-code text-xs font-semibold text-ink-700 outline-none cursor-pointer"
            >
              {GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <ViewToggle view={view} onViewChange={setView} />
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition-colors hover:text-gold-500"
          >
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {projects.length === 0 && (
        <div className="card-retro mt-6 rounded-[28px] p-10 text-center">
          <h3 className="font-heading text-2xl font-bold text-ink-800">ไม่พบโครงการตามตัวกรองที่เลือก</h3>
          <p className="mt-3 text-ink-500">ลองล้างตัวกรองหรือเปลี่ยนคำค้นหาแล้วค้นหาใหม่อีกครั้ง</p>
        </div>
      )}

      {/* Grouped or flat listing */}
      <div className={`space-y-4 ${groupBy === "none" ? "" : ""}`}>
        {groups.map((group, idx) => (
          <ProjectGroup
            key={group.key || "all"}
            groupKey={group.key}
            projects={group.projects}
            showcaseBySlug={showcaseBySlug}
            view={view}
            defaultOpen={idx === 0}
          />
        ))}
      </div>
    </section>
  );
}
