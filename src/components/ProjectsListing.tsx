"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
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
  tags: string | null;
  keywords: string | null;
  client: { clientName: string };
  category: { categoryId: string; name: string; color: string | null };
}

interface ProjectsListingProps {
  projects: Project[];
  showcaseBySlug: Map<string, ShowcaseProjectRecord>;
  totalProjects: number;
  anonymizeText: (text: string) => string;
  parseTags: (tags: string | null) => string[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed: { label: "เสร็จสิ้น", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  in_progress: { label: "กำลังดำเนิน", color: "text-sky-700 bg-sky-50 border-sky-200" },
  planning: { label: "วางแผน", color: "text-amber-700 bg-amber-50 border-amber-200" },
};

export default function ProjectsListing({
  projects,
  showcaseBySlug,
  totalProjects,
  anonymizeText,
  parseTags,
}: ProjectsListingProps) {
  const [view, setView] = useState<"grid" | "table">("grid");

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

      {/* ── Grid View ── */}
      {view === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                client: { clientName: anonymizeText(project.client.clientName) },
              }}
              showcase={showcaseBySlug.get(project.slug) || null}
              tags={parseTags(project.tags)}
            />
          ))}
        </div>
      )}

      {/* ── Table View ── */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-2xl border border-cream-300 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50">
                <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-ink-400">#</th>
                <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-ink-400">โครงการ</th>
                <th className="hidden px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-ink-400 sm:table-cell">ประเภท</th>
                <th className="hidden px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-ink-400 lg:table-cell">หน่วยงาน</th>
                <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-ink-400">สถานะ</th>
                <th className="px-4 py-3 text-left font-code text-[10px] uppercase tracking-wider text-ink-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {projects.map((project) => {
                const statusInfo = STATUS_LABEL[project.status] || STATUS_LABEL.planning;
                return (
                  <tr key={project.id} className="group transition-colors hover:bg-cream-50">
                    <td className="px-4 py-3 font-code text-[11px] text-ink-400">
                      #{String(project.projectNumber).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink-800 group-hover:text-gold-600 transition-colors">
                        {project.projectName}
                      </p>
                      {project.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{project.description}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="rounded-md border border-gold-200 bg-gold-50 px-2 py-0.5 font-code text-[10px] uppercase tracking-wide text-gold-700">
                        {project.type}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-ink-500 lg:table-cell">
                      {anonymizeText(project.client.clientName)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          className="rounded-lg border border-cream-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-500 transition-colors hover:border-gold-400 hover:text-gold-600"
                        >
                          รายละเอียด
                        </Link>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-cream-300 bg-white p-1.5 text-ink-400 transition-colors hover:border-gold-400 hover:text-gold-600"
                            title="เปิดระบบจริง"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {projects.length === 0 && (
        <div className="card-retro mt-6 rounded-[28px] p-10 text-center">
          <h3 className="font-heading text-2xl font-bold text-ink-800">ไม่พบโครงการตามตัวกรองที่เลือก</h3>
          <p className="mt-3 text-ink-500">ลองล้างตัวกรองหรือเปลี่ยนคำค้นหาแล้วค้นหาใหม่อีกครั้ง</p>
        </div>
      )}
    </section>
  );
}
