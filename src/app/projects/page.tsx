import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChevronRight,
  Cloud,
  Database,
  FileText,
  Globe,
  Layers,
  LayoutTemplate,
  Lock,
  Map as MapIcon,
  MonitorSmartphone,
  Settings,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import ArchitectureFilter from "@/components/ArchitectureFilter";
import CoverSlideshow from "@/components/CoverSlideshow";
import ProjectFilterBar from "@/components/ProjectFilterBar";
import ProjectsListing from "@/components/ProjectsListing";
import { loadShowcaseManifest } from "@/lib/portfolio-showcase";
import { formatDate, parseTags } from "@/types/portfolio";

type SearchParams = Promise<{
  q?: string | string[];
  clientId?: string | string[];
  categoryId?: string | string[];
  type?: string | string[];
  status?: string | string[];
}>;

export const metadata: Metadata = {
  title: "ระบบและซอฟต์แวร์ | Patompong Tech Consultant",
  description: "รวมผลงานระบบ ซอฟต์แวร์ และโครงการดิจิทัลที่นำไปใช้งานจริง ทั้งด้านแผนที่ ข้อมูล รายงาน ระบบเว็บ และงานอัตโนมัติ",
};

function firstValue(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function parseRecord(value?: string | null) {
  if (!value) return {} as Record<string, number>;
  try {
    return JSON.parse(value) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
}

function anonymizeText(text: string): string {
  return text
    .replace(/เทศบาลตำบลบ้านคลอง/g, "หน่วยงานส่วนท้องถิ่น ก.")
    .replace(/เทศบาลเมืองอุทัยธานี/g, "หน่วยงานส่วนท้องถิ่น ข.")
    .replace(/เทศบาลนคร/g, "หน่วยงานส่วนท้องถิ่น ค.")
    .replace(/นครสวรรค์/g, "จังหวัด")
    .replace(/อุทัยธานี/g, "จังหวัด")
    .replace(/บ้านคลอง/g, "พื้นที่ ก.");
}

const ARCH_LAYERS = [
  {
    label: "Presentation Layer",
    desc: "ส่วนติดต่อผู้ใช้ — เว็บแอป, Dashboard, Mobile-ready UI",
    techs: ["React", "Firebase", "Netlify", "Vercel"],
    color: "from-cyan-500 to-blue-600",
    icon: Globe,
  },
  {
    label: "Analytics Layer",
    desc: "วิเคราะห์และแสดงผลข้อมูล — รายงาน Real-time",
    techs: ["Google Looker Studio", "Charts", "KPI Monitors"],
    color: "from-pink-500 to-rose-600",
    icon: BarChart3,
  },
  {
    label: "Data & Logic Layer",
    desc: "จัดเก็บ ประมวลผล และจัดการข้อมูลหลัก",
    techs: ["AppSheet", "Google Sheets", "Cloud SQL"],
    color: "from-violet-500 to-purple-600",
    icon: Database,
  },
  {
    label: "Automation Layer",
    desc: "ระบบอัตโนมัติ — สร้างเอกสาร, แจ้งเตือน, Sync",
    techs: ["Google Apps Script", "LINE API", "Webhooks"],
    color: "from-amber-500 to-orange-600",
    icon: Bot,
  },
  {
    label: "Infrastructure Layer",
    desc: "โครงสร้างพื้นฐาน — แผนที่, เครือข่าย, ระบบกายภาพ",
    techs: ["Google Earth", "CCTV", "Fiber Optic", "Wireless"],
    color: "from-emerald-500 to-green-600",
    icon: Layers,
  },
];

const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "สำรวจ & วิเคราะห์",
    desc: "เก็บข้อมูลความต้องการจากหน่วยงาน วิเคราะห์ปัญหาและกำหนดขอบเขต",
    icon: Users,
  },
  {
    step: 2,
    title: "ออกแบบระบบ",
    desc: "เลือก Platform ที่เหมาะสม ออกแบบ UI/UX และโครงสร้างข้อมูล",
    icon: Settings,
  },
  {
    step: 3,
    title: "พัฒนา & ทดสอบ",
    desc: "สร้างระบบ ทดสอบกับผู้ใช้จริง ปรับปรุงจนพร้อมใช้งาน",
    icon: Zap,
  },
  {
    step: 4,
    title: "ส่งมอบ & ดูแล",
    desc: "อบรมผู้ใช้ ส่งมอบระบบ ดูแลบำรุงรักษาอย่างต่อเนื่อง",
    icon: Cloud,
  },
];

const FEATURES = [
  { icon: MapIcon, title: "Mapping & GIS", desc: "ระบุตำแหน่งโครงสร้างพื้นฐานบนแผนที่ดิจิทัล 3 มิติ" },
  { icon: BarChart3, title: "Dashboard & Analytics", desc: "สร้างรายงานเชิงวิเคราะห์แบบ Real-time ดูได้ทุกที่" },
  { icon: MonitorSmartphone, title: "Responsive Design", desc: "ใช้งานได้ทุกอุปกรณ์ทั้ง Desktop, Tablet และ Mobile" },
  { icon: Bot, title: "Automation", desc: "ลดงานซ้ำ สร้างเอกสาร แจ้งเตือน และ Sync อัตโนมัติ" },
  { icon: Users, title: "Multi-tenant", desc: "รองรับหลายหน่วยงาน หลายแผนก ในระบบเดียวกัน" },
  { icon: Lock, title: "Access Control", desc: "จัดการสิทธิ์การเข้าถึงตามบทบาทและระดับความลับ" },
  { icon: FileText, title: "PDF & Report Gen", desc: "สร้างเอกสาร PDF สลิป ใบเสร็จ รายงานอัตโนมัติ" },
  { icon: Smartphone, title: "LINE Integration", desc: "เชื่อมต่อ LINE OA แจ้งเตือน ส่งข้อมูลถึงผู้ใช้ทันที" },
];

export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const q = firstValue(resolvedSearchParams.q).trim();
  const clientId = firstValue(resolvedSearchParams.clientId).trim();
  const categoryId = firstValue(resolvedSearchParams.categoryId).trim();
  const type = firstValue(resolvedSearchParams.type).trim();
  const status = firstValue(resolvedSearchParams.status).trim();

  const manifest = await loadShowcaseManifest();

  // Try Prisma — if unavailable (Netlify serverless), fall back to manifest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let projects: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stats: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let portfolioMetadata: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let clients: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    const where: Record<string, unknown> = {};
    if (clientId) where.clientId = clientId;
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { projectName: { contains: q } },
        { description: { contains: q } },
        { subcategory: { contains: q } },
        { tags: { contains: q } },
        { keywords: { contains: q } },
      ];
    }
    [projects, stats, portfolioMetadata, clients, categories] = await Promise.all([
      prisma.project.findMany({ where, include: { client: true, category: true }, orderBy: [{ projectNumber: "asc" }] }),
      prisma.projectStatistics.findFirst(),
      prisma.portfolioMetadata.findFirst(),
      prisma.client.findMany({ orderBy: { clientName: "asc" } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
  } catch {
    // DB unavailable on Netlify — use manifest fallback below
  }

  // Use manifest as fallback when Prisma fails
  const manifestProjects = manifest?.projects || [];
  const fallbackProjects = projects.length === 0 ? manifestProjects
    .filter(p => {
      if (clientId && p.clientId !== clientId) return false;
      if (categoryId && (p.categoryId || p.category) !== categoryId) return false;
      if (type && p.type !== type) return false;
      if (status && p.status !== status) return false;
      if (q) {
        const qLower = q.toLowerCase();
        const searchable = [p.projectName, p.description, p.subcategory, ...(p.tags || []), ...(p.keywords || [])].join(" ").toLowerCase();
        if (!searchable.includes(qLower)) return false;
      }
      return true;
    })
    .map(p => ({
      id: p.id,
      projectId: p.projectId,
      projectNumber: p.projectNumber,
      projectName: p.projectName,
      slug: p.slug,
      clientId: p.clientId,
      client: { id: "", clientId: p.clientId, clientName: p.clientName, slug: p.clientSlug || p.clientId, projectCount: 0, createdAt: new Date(), updatedAt: new Date() },
      type: p.type,
      categoryId: p.categoryId || p.category,
      category: { id: "", categoryId: p.categoryId || p.category, name: p.category, color: p.categoryColor, projectCount: 0, createdAt: new Date(), updatedAt: new Date() },
      subcategory: p.subcategory,
      url: p.url ?? null,
      description: p.description ?? null,
      tags: p.tags.join(","),
      keywords: p.keywords?.join(",") ?? null,
      status: p.status,
      startDate: p.startDate ? new Date(p.startDate) : null,
      completedDate: p.completedDate ? new Date(p.completedDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effectiveProjects: typeof projects = projects.length > 0 ? projects : (fallbackProjects as any);

  const byType = parseRecord(stats?.byType);
  const typeOptions = (Object.keys(byType).length > 0 ? Object.keys(byType) : Array.from(new Set(effectiveProjects.map((project) => project.type)))).map((value) => ({
    value,
    label: value,
  }));
  const showcaseBySlug = new Map(manifestProjects.map((project) => [project.slug, project]));
  const heroImages = manifestProjects.map((p) => p.assets.cover).filter(Boolean).slice(0, 12) as string[];
  const totalProjects = stats?.totalProjects || manifest?.totals?.projects || effectiveProjects.length;

  return (
    <div className="min-h-screen bg-cream-100 text-ink-700">

      {/* ═══════════════════════════════════════════════════════════════
          PART 1 — System Overview (Hero)
          ═══════════════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden bg-ink-900 text-cream-50">
        {/* Slideshow of cover images behind text */}
        <CoverSlideshow images={heroImages} interval={5000} />
        <div className="absolute inset-0 bg-ink-900/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_35%)]" />
        {/* Dot-grid watermark */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #D97706 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-wrap items-center gap-3 font-code text-xs uppercase tracking-[0.2em] text-gold-400/80">
            <Link href="/" className="transition-colors hover:text-gold-300">หน้าแรก</Link>
            <ChevronRight className="h-3 w-3" />
            <span>ระบบและซอฟต์แวร์</span>
          </div>

          <div className="mt-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-4 py-1.5 font-code text-xs uppercase tracking-[0.15em] text-gold-400">
              <Zap className="h-3.5 w-3.5" />
              Digital Transformation Portfolio
            </div>

            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.15] sm:text-5xl lg:text-6xl">
              ออกแบบ พัฒนา ส่งมอบ
              <span className="mt-2 block bg-gradient-to-r from-gold-300 to-gold-500 bg-clip-text text-transparent">
                ระบบดิจิทัลที่ใช้งานจริง
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream-200/80">
              รวม <span className="font-semibold text-gold-400">{totalProjects} ระบบ</span> ที่ออกแบบและพัฒนาให้หน่วยงานภาครัฐ ครอบคลุมตั้งแต่ระบบข้อมูล แผนที่ GIS
              ไปจนถึง Dashboard วิเคราะห์ เว็บแอปพลิเคชัน และระบบอัตโนมัติ —
              ทุกระบบใช้งานจริงในสภาพแวดล้อมการทำงานจริง
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {manifest?.outputs?.portfolioPdf && (
                <a href={manifest.outputs.portfolioPdf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-5 py-3 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/20">
                  <FileText className="h-4 w-4" />
                  เปิด PDF รวมผลงาน
                </a>
              )}
              {manifest?.outputs?.standaloneShelf && (
                <a href={manifest.outputs.standaloneShelf} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-5 py-3 text-sm font-semibold text-cream-100 transition-colors hover:border-gold-500/30 hover:text-gold-300">
                  <LayoutTemplate className="h-4 w-4" />
                  เปิด Standalone Shelf
                </a>
              )}
              <Link href="#project-listing" className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-transparent px-5 py-3 text-sm font-semibold text-cream-200 transition-colors hover:border-gold-500/30 hover:text-gold-300">
                ดูรายการโครงการ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5 backdrop-blur-sm">
              <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/70">โครงการทั้งหมด</p>
              <div className="mt-2 font-heading text-4xl font-bold text-cream-50">
                <AnimatedCounter value={totalProjects} />
              </div>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5 backdrop-blur-sm">
              <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/70">หมวดหมู่</p>
              <div className="mt-2 font-heading text-4xl font-bold text-cream-50">
                <AnimatedCounter value={categories.length || 5} />
              </div>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5 backdrop-blur-sm">
              <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/70">แพลตฟอร์ม</p>
              <div className="mt-2 font-heading text-4xl font-bold text-cream-50">
                <AnimatedCounter value={Object.keys(byType).length || 7} />
              </div>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5 backdrop-blur-sm">
              <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/70">เริ่มสะสมผลงาน</p>
              <p className="mt-2 font-heading text-lg font-bold text-cream-50">{formatDate(portfolioMetadata?.startDate)}</p>
              <p className="mt-1 text-sm text-cream-200/60">
                อัปเดต {manifest?.generatedAt ? new Date(manifest.generatedAt).toLocaleDateString("th-TH") : formatDate(portfolioMetadata?.lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          PART 2 — System Architecture (clickable layer filters)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-cream-100 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-code text-[11px] uppercase tracking-[0.15em] text-gold-500">System Architecture</span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink-800 sm:text-3xl">สถาปัตยกรรมระบบ 5 ชั้น</h2>
            <p className="mt-2 text-sm text-ink-500">คลิกที่ Layer เพื่อกรองโครงการตามหมวดหมู่</p>
          </div>

          <ArchitectureFilter activeCategoryId={categoryId} />

          <div className="mt-4 text-center">
            <p className="font-code text-[10px] uppercase tracking-[0.15em] text-ink-400">
              ทุกชั้นเชื่อมต่อผ่าน REST API / Webhook / Google Cloud — Zero Server Maintenance
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PART 3 — Operational Workflow
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-ink-900 py-10 text-cream-50 lg:py-14 overflow-hidden">
        {/* Dot-grid watermark */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #D97706 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-code text-[11px] uppercase tracking-[0.15em] text-gold-400">Operational Workflow</span>
            <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">กระบวนการทำงาน 4 ขั้นตอน</h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW_STEPS.map((ws, i) => {
              const StepIcon = ws.icon;
              return (
                <div key={ws.step} className="group relative">
                  <div className="rounded-xl border border-ink-700 bg-ink-800/50 p-4 transition-all group-hover:border-gold-500/30">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-ink-900">
                        {ws.step}
                      </div>
                      <h3 className="text-sm font-bold">{ws.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-cream-200/70">{ws.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PART 4 — Key Feature Highlights
          ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-cream-100 py-10 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-code text-[11px] uppercase tracking-[0.15em] text-gold-500">Key Features</span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink-800 sm:text-3xl">ฟีเจอร์เด่นของระบบ</h2>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feat) => {
              const FeatIcon = feat.icon;
              return (
                <div key={feat.title} className="card-retro card-retro-hover rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-500/20 bg-gold-500/5">
                      <FeatIcon className="h-4 w-4 text-gold-500" />
                    </div>
                    <h3 className="text-sm font-bold text-ink-800">{feat.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-500">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PART 5 — Project Listing (Filter + Cards/Table)
          ═══════════════════════════════════════════════════════════════ */}
      <main id="project-listing" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <ProjectFilterBar
          categories={categories.length > 0 ? categories.map((category) => ({ value: category.categoryId, label: category.name, color: category.color })) : Array.from(new Set(manifestProjects.map(p => p.category))).map(cat => ({ value: cat, label: cat, color: manifestProjects.find(p => p.category === cat)?.categoryColor || '#3B82F6' }))}
          clients={clients.length > 0 ? clients.map((client) => ({ value: client.clientId, label: anonymizeText(client.clientName) })) : Array.from(new Set(manifestProjects.map(p => p.clientId))).map(id => ({ value: id, label: anonymizeText(manifestProjects.find(p => p.clientId === id)?.clientName || id) }))}
          initialCategoryId={categoryId}
          initialClientId={clientId}
          initialQuery={q}
          initialStatus={status}
          initialType={type}
          resultCount={effectiveProjects.length}
          totalCount={totalProjects}
          types={typeOptions}
        />

        <ProjectsListing
          projects={effectiveProjects.map((p) => ({
            ...p,
            clientName: anonymizeText(p.client.clientName),
            tags: parseTags(p.tags),
          }))}
          showcaseBySlug={Object.fromEntries(showcaseBySlug)}
          totalProjects={totalProjects}
        />
      </main>
    </div>
  );
}
