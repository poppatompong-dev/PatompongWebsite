import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

export interface ShowcaseTheme {
  gradient: string;
  accent: string;
  icon: string;
  surface: string;
}

export interface ShowcaseSlide {
  id: string;
  kind: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  description?: string | null;
  items?: string[];
  buttonLabel?: string | null;
  href?: string | null;
  badge?: string | null;
  meta?: string | null;
}

export interface ShowcaseProjectAssets {
  cover: string | null;
  screenshots: {
    desktop: string | null;
    hero: string | null;
    mobile: string | null;
  };
  slideshow: string | null;
  slideshowData: string | null;
}

export interface ShowcaseProjectRecord {
  id: string;
  projectId: string;
  projectNumber: number;
  slug: string;
  projectName: string;
  englishTitle: string;
  clientId: string;
  clientName: string;
  clientSlug?: string | null;
  category: string;
  categoryId?: string | null;
  categoryColor: string;
  subcategory: string;
  type: string;
  status: string;
  url?: string | null;
  description?: string | null;
  preparedDescription?: string | null;
  tags: string[];
  keywords: string[];
  startDate?: string | null;
  completedDate?: string | null;
  accessMode: string;
  accessReason?: string | null;
  captureStatus?: string | null;
  theme: ShowcaseTheme;
  assets: ShowcaseProjectAssets;
  slides: ShowcaseSlide[];
  qa?: Record<string, unknown> | null;
}

export interface ShowcaseManifest {
  generatedAt: string;
  totals: {
    projects: number;
    coversReady: number;
    screenshotSetsReady: number;
    slideshowsReady: number;
  };
  metadata?: Record<string, unknown> | null;
  statistics?: Record<string, unknown> | null;
  outputs: {
    standaloneShelf: string | null;
    portfolioPdf: string | null;
    portfolioHtml?: string | null;
    qaReport: string | null;
  };
  projects: ShowcaseProjectRecord[];
}

const manifestFilePath = path.join(process.cwd(), "public", "portfolio-showcase", "manifest.json");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

function withBasePath(value?: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return basePath ? `${basePath}${normalizedPath}` : normalizedPath;
}

function hydrateShowcaseProject(project: ShowcaseProjectRecord): ShowcaseProjectRecord {
  return {
    ...project,
    assets: {
      cover: withBasePath(project.assets.cover),
      screenshots: {
        desktop: withBasePath(project.assets.screenshots.desktop),
        hero: withBasePath(project.assets.screenshots.hero),
        mobile: withBasePath(project.assets.screenshots.mobile),
      },
      slideshow: withBasePath(project.assets.slideshow),
      slideshowData: withBasePath(project.assets.slideshowData),
    },
    slides: project.slides.map((slide) => ({
      ...slide,
      image: withBasePath(slide.image),
      href: slide.href && slide.href.startsWith("/") ? withBasePath(slide.href) : slide.href || null,
    })),
  };
}

const cachedManifestReader = cache(async (): Promise<ShowcaseManifest | null> => {
  try {
    const raw = await fs.readFile(manifestFilePath, "utf8");
    const manifest = JSON.parse(raw) as ShowcaseManifest;

    return {
      ...manifest,
      outputs: {
        standaloneShelf: withBasePath(manifest.outputs?.standaloneShelf),
        portfolioPdf: withBasePath(manifest.outputs?.portfolioPdf),
        portfolioHtml: withBasePath(manifest.outputs?.portfolioHtml),
        qaReport: withBasePath(manifest.outputs?.qaReport),
      },
      projects: Array.isArray(manifest.projects) ? manifest.projects.map(hydrateShowcaseProject) : [],
    };
  } catch {
    return null;
  }
});

export async function loadShowcaseManifest() {
  return cachedManifestReader();
}

export async function getShowcaseProjectBySlug(slug: string) {
  const manifest = await loadShowcaseManifest();
  return manifest?.projects.find((project) => project.slug === slug) || null;
}

export function getShowcasePreviewImage(project?: ShowcaseProjectRecord | null) {
  if (!project) return null;
  return project.assets.cover || project.assets.screenshots.hero || project.assets.screenshots.desktop || project.assets.screenshots.mobile || null;
}

export function getShowcaseScreenshotEntries(project?: ShowcaseProjectRecord | null) {
  if (!project) return [] as Array<{ key: string; label: string; src: string }>;

  return [
    { key: "hero", label: "Hero View", src: project.assets.screenshots.hero || "" },
    { key: "desktop", label: "Desktop Full", src: project.assets.screenshots.desktop || "" },
    { key: "mobile", label: "Mobile View", src: project.assets.screenshots.mobile || "" },
  ].filter((item) => Boolean(item.src));
}

export function getShowcaseSitePath(pathname: string) {
  if (!pathname.startsWith("/")) {
    return basePath ? `${basePath}/${pathname}` : `/${pathname}`;
  }

  return basePath ? `${basePath}${pathname}` : pathname;
}
