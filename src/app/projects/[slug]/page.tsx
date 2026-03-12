import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, ExternalLink, FolderKanban, ImageIcon, Layers3, MonitorPlay, Tag } from "lucide-react";
import SlideshowViewer from "@/components/SlideshowViewer";
import { getShowcaseProjectBySlug, getShowcaseScreenshotEntries } from "@/lib/portfolio-showcase";
import { prisma } from "@/lib/prisma";
import { formatDate, getStatusLabel, parseKeywords, parseTags } from "@/types/portfolio";

type Params = Promise<{ slug: string }>;

function statusClasses(status: string) {
  if (status === "completed") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (status === "in_progress") return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  return "border-amber-500/30 bg-amber-500/10 text-amber-300";
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [project, showcase] = await Promise.all([
    prisma.project.findUnique({ where: { slug } }),
    getShowcaseProjectBySlug(slug),
  ]);

  if (!project) {
    return {
      title: "Project Not Found | Patompong Tech Consultant",
    };
  }

  return {
    title: `${project.projectName} | Patompong Tech Consultant`,
    description: project.description || showcase?.preparedDescription || "รายละเอียดผลงานและระบบที่นำไปใช้งานจริง",
  };
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  const [project, showcase] = await Promise.all([
    prisma.project.findUnique({
      where: { slug },
      include: {
        client: true,
        category: true,
      },
    }),
    getShowcaseProjectBySlug(slug),
  ]);

  if (!project) {
    notFound();
  }

  const relatedProjects = await prisma.project.findMany({
    where: {
      id: { not: project.id },
      OR: [
        { clientId: project.clientId },
        { categoryId: project.categoryId },
      ],
    },
    include: {
      client: true,
      category: true,
    },
    orderBy: { projectNumber: "asc" },
    take: 3,
  });

  const tags = parseTags(project.tags);
  const keywords = parseKeywords(project.keywords);
  const screenshotEntries = getShowcaseScreenshotEntries(showcase);
  const previewImage = showcase?.assets.cover || screenshotEntries[0]?.src || null;
  const heroStyle = showcase?.theme?.gradient ? { background: showcase.theme.gradient } : { background: `linear-gradient(135deg, ${project.category.color || "#D97706"} 0%, #111827 100%)` };

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

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.45fr_0.9fr] lg:px-8 lg:py-16">
          <div className="space-y-8">
            {showcase?.slides?.length ? (
              <SlideshowViewer
                liveUrl={project.url}
                projectName={project.projectName}
                slideshowUrl={showcase.assets.slideshow}
                slides={showcase.slides}
                theme={showcase.theme}
              />
            ) : null}

            <div className="rounded-[28px] border border-ink-800 bg-ink-800/60 p-6 lg:p-8">
              <h2 className="font-heading text-2xl font-bold text-cream-50 lg:text-3xl">ภาพรวมโครงการ</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink-700 bg-ink-900/50 p-4">
                  <div className="flex items-center gap-2 text-gold-400"><Building2 className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">หน่วยงาน</span></div>
                  <p className="mt-3 text-lg text-cream-100">{project.client.clientName}</p>
                </div>
                <div className="rounded-2xl border border-ink-700 bg-ink-900/50 p-4">
                  <div className="flex items-center gap-2 text-gold-400"><FolderKanban className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">ประเภทระบบ</span></div>
                  <p className="mt-3 text-lg text-cream-100">{project.type}</p>
                </div>
                <div className="rounded-2xl border border-ink-700 bg-ink-900/50 p-4">
                  <div className="flex items-center gap-2 text-gold-400"><Layers3 className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">หมวดงาน</span></div>
                  <p className="mt-3 text-lg text-cream-100">{project.category.name}</p>
                  <p className="mt-1 text-sm text-ink-300">{project.subcategory}</p>
                </div>
                <div className="rounded-2xl border border-ink-700 bg-ink-900/50 p-4">
                  <div className="flex items-center gap-2 text-gold-400"><CalendarDays className="h-4 w-4" /><span className="font-code text-[11px] uppercase tracking-[0.18em]">ช่วงเวลาดำเนินการ</span></div>
                  <p className="mt-3 text-lg text-cream-100">{formatDate(project.startDate)}</p>
                  <p className="mt-1 text-sm text-ink-300">เสร็จสิ้น: {formatDate(project.completedDate)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-ink-800 bg-ink-800/60 p-6 lg:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="font-code text-xs uppercase tracking-[0.15em] text-gold-400">Screenshot Gallery</span>
                  <h2 className="mt-2 font-heading text-2xl font-bold text-cream-50">ภาพหน้าจอของโครงการ</h2>
                </div>
              </div>

              {screenshotEntries.length > 0 ? (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {screenshotEntries.map((item) => (
                    <a
                      key={item.key}
                      href={item.src}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-[24px] border border-ink-700 bg-ink-900/50 transition-colors hover:border-gold-500/35"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-black/20">
                        <div className="relative h-full w-full">
                          <Image src={item.src} alt={`${project.projectName} ${item.label}`} fill unoptimized sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="text-sm font-semibold text-cream-100">{item.label}</span>
                        <ExternalLink className="h-4 w-4 text-gold-400" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-ink-700 bg-ink-900/50 p-5 text-sm leading-7 text-ink-300">
                  {showcase?.accessMode === "login_required" || showcase?.captureStatus === "fallback"
                    ? "โครงการนี้ต้องเข้าสู่ระบบก่อน จึงยังไม่มี screenshot แบบสาธารณะในแกลเลอรี"
                    : "ยังไม่มี screenshot ถูกสร้างสำหรับโครงการนี้"}
                </div>
              )}
            </div>

            {project.url && (
              <div className="rounded-[28px] border border-gold-500/20 bg-gradient-to-r from-gold-500/10 to-transparent p-6 lg:p-8">
                <h2 className="font-heading text-2xl font-bold text-cream-50">ลิงก์ระบบ</h2>
                <p className="mt-3 text-cream-200/75 leading-relaxed">เปิดดูระบบหรือผลงานจริงจากลิงก์ด้านล่าง</p>
                <a href={project.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gold-400">
                  เปิดลิงก์โครงการ
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-4 break-all font-code text-xs text-gold-300/80">{project.url}</p>
              </div>
            )}

            {relatedProjects.length > 0 && (
              <div>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <span className="font-code text-xs text-gold-400 tracking-[0.15em] uppercase">Related Projects</span>
                    <h2 className="mt-2 font-heading text-2xl font-bold text-cream-50">โครงการที่เกี่ยวข้อง</h2>
                  </div>
                  <Link href="/projects" className="text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300">ดูทั้งหมด</Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {relatedProjects.map((item) => (
                    <Link key={item.id} href={`/projects/${item.slug}`} className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-5 transition-colors hover:border-gold-500/40 hover:bg-ink-800">
                      <p className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-500">#{String(item.projectNumber).padStart(2, "0")}</p>
                      <h3 className="mt-3 font-heading text-xl font-bold text-cream-50 leading-snug">{item.projectName}</h3>
                      <p className="mt-3 line-clamp-3 text-sm text-ink-300">{item.description || "ไม่มีคำอธิบายเพิ่มเติม"}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold-400">
                        อ่านต่อ
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            {tags.length > 0 && (
              <div className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-6">
                <h2 className="font-heading text-xl font-bold text-cream-50">Tags</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1.5 text-[11px] font-code uppercase tracking-wide text-gold-300">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-6">
                <h2 className="font-heading text-xl font-bold text-cream-50">Keywords</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1.5 text-[11px] font-code tracking-wide text-cream-200">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-6">
              <h2 className="font-heading text-xl font-bold text-cream-50">Asset Status</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Cover</dt>
                  <dd className="mt-1 text-cream-100">{showcase?.assets.cover ? "พร้อมใช้งาน" : "ยังไม่มี"}</dd>
                </div>
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Screenshots</dt>
                  <dd className="mt-1 text-cream-100">{screenshotEntries.length} รายการ</dd>
                </div>
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Slideshow</dt>
                  <dd className="mt-1 text-cream-100">{showcase?.assets.slideshow ? "พร้อมใช้งาน" : "ยังไม่มี"}</dd>
                </div>
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Access Mode</dt>
                  <dd className="mt-1 text-cream-100">{showcase?.accessMode || "unknown"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-6">
              <h2 className="font-heading text-xl font-bold text-cream-50">ข้อมูลอ้างอิง</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Project ID</dt>
                  <dd className="mt-1 text-cream-100">{project.projectId}</dd>
                </div>
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Slug</dt>
                  <dd className="mt-1 break-all text-cream-100">{project.slug}</dd>
                </div>
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Last Updated</dt>
                  <dd className="mt-1 text-cream-100">{formatDate(project.updatedAt)}</dd>
                </div>
                <div>
                  <dt className="font-code text-[11px] uppercase tracking-[0.18em] text-gold-400/75">Capture Status</dt>
                  <dd className="mt-1 text-cream-100">{showcase?.captureStatus || "pending"}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[24px] border border-ink-800 bg-ink-800/60 p-6">
              <h2 className="font-heading text-xl font-bold text-cream-50">Showcase Notes</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink-300">
                <p>{showcase?.preparedDescription || project.description || "ไม่มีข้อมูลเพิ่มเติม"}</p>
                {showcase?.assets.cover && (
                  <a href={showcase.assets.cover} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-gold-400 transition-colors hover:text-gold-300">
                    เปิดภาพปก
                    <ImageIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
