import Link from "next/link";
import type { ShowcaseProjectRecord } from "@/lib/portfolio-showcase";

interface ProjectCardProps {
  project: {
    category: {
      color?: string | null;
      name: string;
    };
    client: {
      clientName: string;
    };
    completedDate?: Date | null;
    description?: string | null;
    projectName: string;
    projectNumber: number;
    slug: string;
    startDate?: Date | null;
    status: string;
    subcategory: string;
    type: string;
    url?: string | null;
  };
  showcase?: ShowcaseProjectRecord | null;
  tags: string[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  completed: { label: "เสร็จสิ้น", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  in_progress: { label: "กำลังพัฒนา", color: "bg-sky-100 text-sky-700 border-sky-200" },
  planning: { label: "วางแผน", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function ProjectCard({ project, showcase, tags }: ProjectCardProps) {
  const coverImage = showcase?.assets.cover || null;
  const heroImage = showcase?.assets.screenshots.hero || showcase?.assets.screenshots.desktop || null;
  const detailHref = `/projects/${project.slug}`;
  const categoryColor = showcase?.categoryColor || project.category.color || "#D97706";
  const headerStyle = showcase?.theme?.gradient
    ? { background: showcase.theme.gradient }
    : { background: `linear-gradient(135deg, ${categoryColor} 0%, #111827 100%)` };
  const statusInfo = STATUS_LABEL[project.status] || STATUS_LABEL.planning;

  const techTags = tags.length > 0 ? tags.slice(0, 5) : project.type.split("/").slice(0, 3);

  return (
    <Link href={detailHref} className="group block">
      <article className="overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:border-gold-400/50">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden" style={headerStyle}>
          {coverImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={coverImage}
              alt={project.projectName}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full flex-col items-start justify-end p-5 text-cream-50">
              <span className="mb-2 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-code uppercase tracking-wider backdrop-blur-sm">{project.type}</span>
              <h3 className="font-heading text-xl font-bold leading-snug drop-shadow-md">{project.projectName}</h3>
            </div>
          )}

          {/* Number badge */}
          <span className="absolute top-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-code font-bold tracking-wider text-white backdrop-blur-sm">
            #{String(project.projectNumber).padStart(2, "0")}
          </span>

          {/* Status badge */}
          <span className={`absolute top-3 right-3 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Title + Category */}
          <div>
            <h3 className="text-base font-bold text-ink-800 leading-snug group-hover:text-gold-600 transition-colors line-clamp-2">
              {project.projectName}
            </h3>
            <p className="mt-1 text-xs text-ink-400">{project.category.name} · {project.client.clientName}</p>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-xs leading-relaxed text-ink-500 line-clamp-2">{project.description}</p>
          )}

          {/* Technology Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-gold-100 border border-gold-300 px-2 py-0.5 text-[10px] font-code font-semibold uppercase tracking-wider text-gold-700">
              {project.type}
            </span>
            {techTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-cream-100 border border-cream-300 px-2 py-0.5 text-[10px] font-code tracking-wider text-ink-500"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Screenshot Thumbnails */}
          {heroImage && (
            <div className="flex gap-2 pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt="Screenshot"
                loading="lazy"
                className="h-14 w-24 rounded-md border border-cream-300 object-cover"
              />
              {showcase?.assets.screenshots.mobile && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={showcase.assets.screenshots.mobile}
                  alt="Mobile"
                  loading="lazy"
                  className="h-14 w-8 rounded-md border border-cream-300 object-cover"
                />
              )}
              <div className="flex flex-1 items-center justify-end">
                <span className="text-[10px] font-code text-gold-500 group-hover:text-gold-600 transition-colors">
                  ดูรายละเอียด →
                </span>
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
