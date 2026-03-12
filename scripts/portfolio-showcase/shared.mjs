import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.resolve(__dirname, "..", "..");
export const prismaJsonPath = path.join(rootDir, "prisma", "projects_optimized.json");
export const publicDir = path.join(rootDir, "public");
export const showcaseDir = path.join(publicDir, "portfolio-showcase");
export const coversDir = path.join(showcaseDir, "covers");
export const screenshotsDir = path.join(showcaseDir, "screenshots");
export const slideshowsDir = path.join(showcaseDir, "slideshows");
export const reportsDir = path.join(showcaseDir, "reports");
export const dataCatalogPath = path.join(showcaseDir, "data-catalog.json");
export const manifestPath = path.join(showcaseDir, "manifest.json");
export const qaReportPath = path.join(showcaseDir, "qa-report.json");
export const portfolioPdfPath = path.join(showcaseDir, "Portfolio-Complete.pdf");
export const portfolioHtmlPath = path.join(showcaseDir, "Portfolio-Complete.html");
export const standaloneShelfPath = path.join(showcaseDir, "portfolio-shelf.html");
export const credentialConfigPath = path.join(rootDir, "portfolio-showcase.credentials.local.json");
export const baseUrl = process.env.PORTFOLIO_SHOWCASE_BASE_URL || "http://127.0.0.1:3000";
export const siteBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export async function ensureDir(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function ensureShowcaseDirectories() {
  await Promise.all([
    ensureDir(showcaseDir),
    ensureDir(coversDir),
    ensureDir(screenshotsDir),
    ensureDir(slideshowsDir),
    ensureDir(reportsDir),
  ]);
}

export function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

export function toPublicAssetPath(absolutePath) {
  const relativePath = path.relative(publicDir, absolutePath);
  return `/${toPosixPath(relativePath)}`;
}

export function toSitePath(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return siteBasePath ? `${siteBasePath}${normalizedPath}` : normalizedPath;
}

export function toAbsoluteSiteUrl(pathname = "/") {
  return new URL(toSitePath(pathname), `${baseUrl.replace(/\/$/, "")}/`).toString();
}

export async function readJson(filePath, fallback = null) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export function exists(filePath) {
  return existsSync(filePath);
}

export function titleCaseSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseThaiDate(value) {
  if (!value) return null;
  const [yearRaw, monthRaw, dayRaw] = String(value).split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!year || !month || !day) return null;
  const normalizedYear = year > 2400 ? year - 543 : year;
  return new Date(Date.UTC(normalizedYear, month - 1, day));
}

export function formatThaiDate(value) {
  const date = value instanceof Date ? value : parseThaiDate(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateRange(project) {
  const start = formatThaiDate(project.startDate);
  const end = formatThaiDate(project.completedDate);
  if (start === "-" && end === "-") return "ไม่ระบุช่วงเวลา";
  return `${start} - ${end}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function projectOutputPaths(projectId) {
  const screenshotProjectDir = path.join(screenshotsDir, projectId);
  const slideshowProjectDir = path.join(slideshowsDir, projectId);

  return {
    screenshotProjectDir,
    slideshowProjectDir,
    coverAbsolutePath: path.join(coversDir, `${projectId}-cover.png`),
    desktopScreenshotAbsolutePath: path.join(screenshotProjectDir, "desktop-full.png"),
    heroScreenshotAbsolutePath: path.join(screenshotProjectDir, "desktop-hero.png"),
    mobileScreenshotAbsolutePath: path.join(screenshotProjectDir, "mobile-hero.png"),
    screenshotMetadataAbsolutePath: path.join(screenshotProjectDir, "metadata.json"),
    slideshowHtmlAbsolutePath: path.join(slideshowProjectDir, "presentation.html"),
    slideshowDataAbsolutePath: path.join(slideshowProjectDir, "slides.json"),
  };
}

export function inferAccessMode(project) {
  const type = project.type || "";
  const url = project.url || "";

  if (["Google Earth Map", "React/Netlify", "React/Netlify - Public View", "React/Vercel", "Firebase"].includes(type)) {
    return {
      mode: "public",
      screenshotEligible: true,
      reason: "Public URL type",
    };
  }

  if (type === "Google Looker Studio") {
    return {
      mode: "conditional",
      screenshotEligible: true,
      reason: "May require Google authentication depending on sharing settings",
    };
  }

  if (type === "AppSheet" || type === "Google Apps Script" || url.includes("accounts.google.com")) {
    return {
      mode: "login_required",
      screenshotEligible: true,
      reason: "Likely protected by sign-in",
    };
  }

  return {
    mode: "unknown",
    screenshotEligible: Boolean(url),
    reason: "Unknown URL type",
  };
}

export function getTypeTheme(project) {
  const color = project.categoryColor || "#D97706";

  const paletteByType = {
    "Google Earth Map": {
      gradient: "linear-gradient(135deg, #2563EB 0%, #0F172A 100%)",
      accent: "#60A5FA",
      icon: "🗺️",
      surface: "rgba(37,99,235,0.18)",
    },
    "AppSheet": {
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #1F2937 100%)",
      accent: "#C4B5FD",
      icon: "🧩",
      surface: "rgba(139,92,246,0.18)",
    },
    "Google Looker Studio": {
      gradient: "linear-gradient(135deg, #EC4899 0%, #1F2937 100%)",
      accent: "#F9A8D4",
      icon: "📊",
      surface: "rgba(236,72,153,0.18)",
    },
    "React/Netlify": {
      gradient: "linear-gradient(135deg, #06B6D4 0%, #0F172A 100%)",
      accent: "#67E8F9",
      icon: "⚛️",
      surface: "rgba(6,182,212,0.18)",
    },
    "React/Netlify - Public View": {
      gradient: "linear-gradient(135deg, #0EA5E9 0%, #082F49 100%)",
      accent: "#7DD3FC",
      icon: "🖥️",
      surface: "rgba(14,165,233,0.18)",
    },
    "React/Vercel": {
      gradient: "linear-gradient(135deg, #111827 0%, #2563EB 100%)",
      accent: "#93C5FD",
      icon: "▲",
      surface: "rgba(37,99,235,0.18)",
    },
    "Google Apps Script": {
      gradient: "linear-gradient(135deg, #F59E0B 0%, #1F2937 100%)",
      accent: "#FCD34D",
      icon: "⚙️",
      surface: "rgba(245,158,11,0.18)",
    },
    Firebase: {
      gradient: "linear-gradient(135deg, #F97316 0%, #1F2937 100%)",
      accent: "#FDBA74",
      icon: "🔥",
      surface: "rgba(249,115,22,0.18)",
    },
  };

  return paletteByType[project.type] || {
    gradient: `linear-gradient(135deg, ${color} 0%, #111827 100%)`,
    accent: color,
    icon: "◆",
    surface: `${color}22`,
  };
}

export function buildPreparedDescription(project) {
  const lead = project.description || `${project.projectName} เป็นระบบสำหรับ ${project.clientName}`;
  return `${lead} อยู่ในหมวด ${project.category} ประเภทย่อย ${project.subcategory} และพัฒนาสำหรับ ${project.clientName}`;
}

export async function loadSourcePortfolioData() {
  const source = await readJson(prismaJsonPath, null);
  if (!source) {
    throw new Error(`Unable to read source data from ${prismaJsonPath}`);
  }

  const clientsById = Object.fromEntries((source.clients || []).map((client) => [client.clientId, client]));
  const categoriesByName = Object.fromEntries((source.categories || []).map((category) => [category.name, category]));

  return {
    metadata: source.metadata,
    statistics: source.statistics,
    projects: (source.projects || []).map((project) => {
      const access = inferAccessMode(project);
      const paths = projectOutputPaths(project.id);
      const client = clientsById[project.clientId] || null;
      const category = categoriesByName[project.category] || null;
      const theme = getTypeTheme({ ...project, categoryColor: category?.color });

      return {
        ...project,
        clientName: client?.clientName || project.client,
        clientSlug: client?.slug || null,
        categoryId: category?.id || null,
        categoryColor: category?.color || "#D97706",
        englishTitle: titleCaseSlug(project.slug),
        preparedDescription: buildPreparedDescription({ ...project, clientName: client?.clientName || project.client }),
        accessMode: access.mode,
        accessReason: access.reason,
        screenshotEligible: access.screenshotEligible,
        theme,
        output: {
          cover: toPublicAssetPath(paths.coverAbsolutePath),
          screenshotsDirectory: toPublicAssetPath(paths.screenshotProjectDir),
          screenshots: [
            toPublicAssetPath(paths.desktopScreenshotAbsolutePath),
            toPublicAssetPath(paths.heroScreenshotAbsolutePath),
            toPublicAssetPath(paths.mobileScreenshotAbsolutePath),
          ],
          slideshow: toPublicAssetPath(paths.slideshowHtmlAbsolutePath),
          slideshowData: toPublicAssetPath(paths.slideshowDataAbsolutePath),
        },
        absoluteOutput: paths,
      };
    }),
  };
}

export function normalizeCredentialProfiles(rawProfiles) {
  if (!Array.isArray(rawProfiles)) return [];

  return rawProfiles
    .map((profile, index) => ({
      id: profile.id || `profile_${index + 1}`,
      label: profile.label || `Profile ${index + 1}`,
      domains: Array.isArray(profile.domains) ? profile.domains : [],
      loginUrl: profile.loginUrl || null,
      username: profile.username || null,
      email: profile.email || null,
      password: profile.password || null,
    }))
    .filter((profile) => profile.password && (profile.username || profile.email));
}

export async function loadCredentialProfiles() {
  const localConfig = await readJson(credentialConfigPath, null);
  const localProfiles = normalizeCredentialProfiles(localConfig?.profiles || []);
  const envProfiles = [];

  if (process.env.PORTFOLIO_SHOWCASE_EMAIL && process.env.PORTFOLIO_SHOWCASE_PASSWORD) {
    envProfiles.push({
      id: "env_google",
      label: "Environment Google Profile",
      domains: ["appsheet.com", "script.google.com", "lookerstudio.google.com", "google.com"],
      email: process.env.PORTFOLIO_SHOWCASE_EMAIL,
      password: process.env.PORTFOLIO_SHOWCASE_PASSWORD,
    });
  }

  if (process.env.PORTFOLIO_SHOWCASE_USERNAME && process.env.PORTFOLIO_SHOWCASE_PASSWORD) {
    envProfiles.push({
      id: "env_basic",
      label: "Environment Basic Profile",
      domains: ["*"],
      username: process.env.PORTFOLIO_SHOWCASE_USERNAME,
      password: process.env.PORTFOLIO_SHOWCASE_PASSWORD,
    });
  }

  return [...localProfiles, ...envProfiles];
}

export function matchCredentialProfiles(url, profiles) {
  if (!url) return [];
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return [];
  }
  return profiles.filter((profile) => profile.domains.some((domain) => domain === "*" || hostname === domain || hostname.endsWith(`.${domain}`)));
}

export function matchCredentialProfile(url, profiles) {
  return matchCredentialProfiles(url, profiles)[0] || null;
}

export function buildProjectSlides(project, assetRecord = {}) {
  const screenshots = [assetRecord.hero, assetRecord.desktop, assetRecord.mobile].filter(Boolean);
  const tags = Array.isArray(project.tags) ? project.tags : project.tags || [];
  const keywords = Array.isArray(project.keywords) ? project.keywords : project.keywords || [];

  return [
    {
      id: `${project.id}-cover`,
      kind: "cover",
      title: project.projectName,
      subtitle: project.englishTitle,
      image: assetRecord.cover || null,
      badge: project.type,
      meta: project.clientName,
    },
    {
      id: `${project.id}-screenshot-1`,
      kind: screenshots[0] ? "image" : "text",
      title: screenshots[0] ? "Desktop Hero" : "Project Snapshot",
      subtitle: project.subcategory,
      image: screenshots[0] || assetRecord.cover || null,
      description: project.preparedDescription,
    },
    {
      id: `${project.id}-screenshot-2`,
      kind: screenshots[1] ? "image" : "text",
      title: screenshots[1] ? "Desktop Full" : "Key Details",
      subtitle: project.category,
      image: screenshots[1] || screenshots[0] || assetRecord.cover || null,
      description: formatDateRange(project),
    },
    {
      id: `${project.id}-features`,
      kind: "text",
      title: "Features & Description",
      subtitle: project.type,
      description: project.preparedDescription,
      items: tags.length > 0 ? tags : [project.subcategory, project.category, project.clientName],
    },
    {
      id: `${project.id}-info`,
      kind: "text",
      title: "Project Info",
      subtitle: `Project #${String(project.projectNumber).padStart(2, "0")}`,
      items: [
        `หน่วยงาน: ${project.clientName}`,
        `หมวดงาน: ${project.category}`,
        `ประเภทย่อย: ${project.subcategory}`,
        `ช่วงเวลา: ${formatDateRange(project)}`,
      ],
    },
    {
      id: `${project.id}-cta`,
      kind: "cta",
      title: "View Live",
      subtitle: project.url ? "เปิดดูระบบจริง" : "ไม่มีลิงก์สาธารณะ",
      description: project.url || "โปรเจกต์นี้ไม่มีลิงก์สำหรับเปิดดูจากภายนอก",
      buttonLabel: project.url ? "Open Project" : "View Details",
      href: project.url || `/projects/${project.slug}`,
    },
    {
      id: `${project.id}-thanks`,
      kind: "thanks",
      title: "Thank You",
      subtitle: "Patompong Tech Consultant",
      description: keywords.length > 0 ? keywords.join(" • ") : `${project.clientName} • ${project.type}`,
      image: assetRecord.mobile || assetRecord.cover || null,
    },
  ];
}

export async function loadCatalog() {
  return readJson(dataCatalogPath, null);
}

export async function loadManifest() {
  return readJson(manifestPath, null);
}

export function summarizeExecution(label, value) {
  console.log(`${label}: ${typeof value === "string" ? value : JSON.stringify(value)}`);
}
