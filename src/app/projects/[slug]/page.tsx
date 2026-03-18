import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, ExternalLink, FolderKanban, Layers3, MonitorPlay, Tag } from "lucide-react";
import SlideshowViewer from "@/components/SlideshowViewer";
import { getShowcaseProjectBySlug, getShowcaseScreenshotEntries, loadShowcaseManifest } from "@/lib/portfolio-showcase";
import { formatDate, getStatusLabel, parseKeywords, parseTags } from "@/types/portfolio";

type Params = Promise<{ slug: string }>;

function statusClasses(status: string) {
  if (status === "completed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "in_progress") return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;

  // Try Prisma, fallback to manifest
  let projectName: string | null = null;
  let description: string | null = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    const dbProject = await prisma.project.findUnique({ where: { slug } });
    projectName = dbProject?.projectName ?? null;
    description = dbProject?.description ?? null;
  } catch { /* DB unavailable */ }

  const showcase = await getShowcaseProjectBySlug(slug);
  projectName = projectName || showcase?.projectName || null;
  description = description || showcase?.preparedDescription || null;

  if (!projectName) {
    return { title: "Project Not Found | Patompong Tech Consultant" };
  }

  return {
    title: `${projectName} | Patompong Tech Consultant`,
    description: description || "รายละเอียดผลงานและระบบที่นำไปใช้งานจริง",
  };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let project: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedProjects: any[] = [];

  try {
    const { prisma } = await import("@/lib/prisma");
    project = await prisma.project.findUnique({
      where: { slug },
      include: { client: true, category: true },
    });
    if (project) {
      relatedProjects = await prisma.project.findMany({
        where: {
          id: { not: project.id },
          OR: [
            { clientId: project.clientId },
            { categoryId: project.categoryId },
          ],
        },
        include: { client: true, category: true },
        orderBy: { projectNumber: "asc" },
        take: 3,
      });
    }
  } catch { /* DB unavailable — use manifest fallback */ }

  const showcase = await getShowcaseProjectBySlug(slug);

  // Fallback: build project-like object from manifest
  if (!project && showcase) {
    const manifest = await loadShowcaseManifest();
    const manifestRelated = (manifest?.projects || [])
      .filter(p => p.slug !== slug && (p.clientId === showcase.clientId || p.category === showcase.category))
      .slice(0, 3);

    project = {
      id: showcase.id,
      projectId: showcase.projectId,
      projectNumber: showcase.projectNumber,
      projectName: showcase.projectName,
      slug: showcase.slug,
      clientId: showcase.clientId,
      client: { clientId: showcase.clientId, clientName: showcase.clientName, slug: showcase.clientSlug || showcase.clientId },
      type: showcase.type,
      categoryId: showcase.categoryId || showcase.category,
      category: { categoryId: showcase.categoryId || showcase.category, name: showcase.category, color: showcase.categoryColor },
      subcategory: showcase.subcategory,
      url: showcase.url ?? null,
      description: showcase.description ?? showcase.preparedDescription ?? null,
      tags: showcase.tags.join(","),
      keywords: showcase.keywords?.join(",") ?? null,
      status: showcase.status,
      startDate: showcase.startDate ? new Date(showcase.startDate) : null,
      completedDate: showcase.completedDate ? new Date(showcase.completedDate) : null,
    };

    relatedProjects = manifestRelated.map(p => ({
      id: p.id,
      projectNumber: p.projectNumber,
      projectName: p.projectName,
      slug: p.slug,
      description: p.description ?? p.preparedDescription ?? null,
      client: { clientName: p.clientName },
      category: { name: p.category, color: p.categoryColor },
    }));
  }

  if (!project) {
    notFound();
  }

  const tags = parseTags(project.tags);
  const keywords = parseKeywords(project.keywords);
  const screenshotEntries = getShowcaseScreenshotEntries(showcase);
  const previewImage = showcase?.assets.cover || screenshotEntries[0]?.src || null;
  const heroStyle = showcase?.theme?.gradient ? { background: showcase.theme.gradient } : { background: `linear-gradient(135deg, ${project.category?.color || "#D97706"} 0%, #111827 100%)` };

  return (
    <div className="min-h-screen bg-ink-900 text-cream-100">
      <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-900/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-gold-400 transition-colors hover:text-gold-300">
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้ารวมผลงาน
          </Link>
          <Link href="/" className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-500/70 transition-colors hover:text-gold-400">
            Patompong Tech Consultant
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-ink-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-code uppercase tracking-[0.2em] text-gold-400/80">
                <Link href="/" className="transition-colors hover:text-gold-300">หน้าแรก</Link>
                <span>/</span>
                <Link href="/projects" className="transition-colors hover:text-gold-300">ระบบและซอฟต์แวร์</Link>
                <span>/</span>
                <span>{project.slug}</span>
              </div>

              <p className="mt-8 font-code text-xs uppercase tracking-[0.2em] text-gold-400/80">Project #{String(project.projectNumber).padStart(2, "0")}</p>
              <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold leading-tight text-cream-50 sm:text-5xl lg:text-6xl">
                {project.projectName}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className={`border px-3 py-1 text-[11px] font-code uppercase tracking-wider ${statusClasses(project.status)}`}>
                  {getStatusLabel(project.status as "completed" | "in_progress" | "planning")}
                </span>
                <span className="border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-[11px] font-code uppercase tracking-wider text-gold-300">
                  {project.type}
                </span>
                <span className="border border-ink-700 bg-ink-800 px-3 py-1 text-[11px] font-code uppercase tracking-wider text-cream-200">
                  {project.category.name}
                </span>
                {showcase?.captureStatus && (
                  <span className="border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-code uppercase tracking-wider text-cream-100">
                    {showcase.captureStatus}
                  </span>
                )}
              </div>

              <p className="mt-8 max-w-3xl border-l-4 border-gold-500 pl-5 text-base leading-relaxed text-cream-200/80 sm:text-lg">
                {project.description || showcase?.preparedDescription || "โครงการนี้เป็นส่วนหนึ่งของผลงานด้านระบบดิจิทัลและซอฟต์แวร์ที่นำไปใช้งานจริงกับหน่วยงานลูกค้า"}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {showcase?.assets.slideshow && (
                  <a href={showcase.assets.slideshow} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-5 py-3 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/20">
                    เปิดสไลด์โชว์
                    <MonitorPlay className="h-4 w-4" />
                  </a>
                )}
                {project.url && (
                  <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-800 px-5 py-3 text-sm font-semibold text-cream-100 transition-colors hover:border-gold-500/30 hover:text-gold-300">
                    เปิดระบบจริง
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-black/20 shadow-2xl shadow-black/25">
              <div className="aspect-[16/10] w-full" style={heroStyle}>
                {previewImage ? (
                  <div className="relative h-full w-full">
                    <Image src={previewImage} alt={project.projectName} fill unoptimized sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-between p-8 text-cream-50">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-code uppercase tracking-[0.18em]">
                      Portfolio Cover
                    </div>
                    <div>
                      <p className="font-code text-xs uppercase tracking-[0.2em] text-white/75">{project.client.clientName}</p>
                      <h2 className="mt-3 font-heading text-3xl font-bold leading-snug">{project.projectName}</h2>
                      <p className="mt-3 text-sm text-white/80">{project.type}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* ── Project Info Cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <div className="flex items-center gap-2 text-gold-400"><Building2 className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">หน่วยงาน</span></div>
              <p className="mt-3 text-base font-semibold text-cream-100">{project.client.clientName}</p>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <div className="flex items-center gap-2 text-gold-400"><FolderKanban className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">ประเภทระบบ</span></div>
              <p className="mt-3 text-base font-semibold text-cream-100">{project.type}</p>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <div className="flex items-center gap-2 text-gold-400"><Layers3 className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">หมวดงาน</span></div>
              <p className="mt-3 text-base font-semibold text-cream-100">{project.category.name}</p>
              <p className="mt-1 text-xs text-ink-400">{project.subcategory}</p>
            </div>
            <div className="rounded-2xl border border-ink-700 bg-ink-800/60 p-5">
              <div className="flex items-center gap-2 text-gold-400"><CalendarDays className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">ระยะเวลา</span></div>
              <p className="mt-3 text-base font-semibold text-cream-100">{formatDate(project.startDate)}</p>
              {project.completedDate && <p className="mt-1 text-xs text-ink-400">เสร็จ: {formatDate(project.completedDate)}</p>}
            </div>
          </div>

          {/* ── Tags ── */}
          {(tags.length > 0 || keywords.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1.5 text-[11px] font-code uppercase tracking-wide text-gold-300">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
              {keywords.map((kw) => (
                <span key={kw} className="rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1.5 text-[11px] font-code tracking-wide text-cream-300">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* ── Slideshow ── */}
          {showcase?.slides?.length ? (
            <SlideshowViewer
              liveUrl={project.url}
              projectName={project.projectName}
              slideshowUrl={showcase.assets.slideshow}
              slides={showcase.slides}
              theme={showcase.theme}
            />
          ) : null}

          {/* ── Screenshot Gallery ── */}
          {screenshotEntries.length > 0 && (
            <div className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-6 lg:p-8">
              <h2 className="font-heading text-2xl font-bold text-cream-50">ภาพหน้าจอ</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {screenshotEntries.map((item) => (
                  <a
                    key={item.key}
                    href={item.src}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/50 transition-colors hover:border-gold-500/35"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-black/20">
                      <div className="relative h-full w-full">
                        <Image src={item.src} alt={`${project.projectName} ${item.label}`} fill unoptimized sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <span className="text-sm font-medium text-cream-100">{item.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gold-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Link to live system ── */}
          {project.url && (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gold-500/20 bg-gradient-to-r from-gold-500/10 to-transparent p-6">
              <div className="flex-1">
                <h2 className="font-heading text-xl font-bold text-cream-50">เปิดดูระบบจริง</h2>
                <p className="mt-1 break-all font-code text-xs text-gold-300/80">{project.url}</p>
              </div>
              <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold-400">
                เปิดลิงก์
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* ── Related Projects ── */}
          {relatedProjects.length > 0 && (
            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 className="font-heading text-2xl font-bold text-cream-50">โครงการที่เกี่ยวข้อง</h2>
                <Link href="/projects" className="text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300">ดูทั้งหมด</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedProjects.map((item) => (
                  <Link key={item.id} href={`/projects/${item.slug}`} className="rounded-2xl border border-ink-800 bg-ink-800/60 p-5 transition-colors hover:border-gold-500/40 hover:bg-ink-800">
                    <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-500">#{String(item.projectNumber).padStart(2, "0")}</p>
                    <h3 className="mt-2 font-heading text-lg font-bold text-cream-50 leading-snug">{item.projectName}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-300">{item.description || "ไม่มีคำอธิบายเพิ่มเติม"}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400">
                      ดูรายละเอียด <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
