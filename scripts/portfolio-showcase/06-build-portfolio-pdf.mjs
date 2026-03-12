import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { buildManifestData } from "./build-manifest.mjs";
import {
  ensureShowcaseDirectories,
  escapeHtml,
  formatThaiDate,
  loadManifest,
  portfolioHtmlPath,
  portfolioPdfPath,
  publicDir,
  toAbsoluteSiteUrl,
} from "./shared.mjs";

function publicAssetToFileUrl(assetPath) {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  const normalized = assetPath.replace(/^\/+/, "");
  const absolutePath = path.join(publicDir, ...normalized.split("/"));
  return pathToFileURL(absolutePath).toString();
}

function buildScreenshotList(project) {
  return [
    { key: "hero", label: "Hero View", src: project.assets?.screenshots?.hero || null },
    { key: "desktop", label: "Desktop Full", src: project.assets?.screenshots?.desktop || null },
    { key: "mobile", label: "Mobile View", src: project.assets?.screenshots?.mobile || null },
  ].filter((item) => item.src);
}

function renderProjectSection(project, index) {
  const previewAsset = publicAssetToFileUrl(project.assets?.cover || project.assets?.screenshots?.hero || project.assets?.screenshots?.desktop || project.assets?.screenshots?.mobile);
  const screenshots = buildScreenshotList(project);
  const tags = Array.isArray(project.tags) ? project.tags : [];
  const keywords = Array.isArray(project.keywords) ? project.keywords : [];
  const liveUrl = project.url || null;
  const detailUrl = toAbsoluteSiteUrl(`/projects/${project.slug}`);
  const slideshowUrl = project.assets?.slideshow ? toAbsoluteSiteUrl(project.assets.slideshow) : null;
  const gradient = project.theme?.gradient || `linear-gradient(135deg, ${project.categoryColor || "#D97706"} 0%, #111827 100%)`;

  return `
    <section class="project-sheet">
      <div class="project-hero" style="background:${escapeHtml(gradient)}">
        <div class="project-hero-copy">
          <div class="project-index">Project #${String(project.projectNumber).padStart(2, "0")}</div>
          <h2>${escapeHtml(project.projectName)}</h2>
          <p class="project-client">${escapeHtml(project.clientName)} • ${escapeHtml(project.type)}</p>
          <p class="project-description">${escapeHtml(project.preparedDescription || project.description || "ไม่มีคำอธิบายเพิ่มเติม")}</p>
          <div class="project-pills">
            <span>${escapeHtml(project.category)}</span>
            <span>${escapeHtml(project.subcategory)}</span>
            <span>${escapeHtml(project.status || "unknown")}</span>
            <span>${escapeHtml(project.accessMode || "unknown")}</span>
          </div>
        </div>
        <div class="project-hero-visual">
          ${previewAsset ? `<img src="${escapeHtml(previewAsset)}" alt="${escapeHtml(project.projectName)}" />` : `<div class="fallback-card"><strong>${escapeHtml(project.projectName)}</strong><span>${escapeHtml(project.clientName)}</span></div>`}
        </div>
      </div>

      <div class="content-grid">
        <article class="panel">
          <h3>Project Overview</h3>
          <div class="info-grid">
            <div><span>Client</span><strong>${escapeHtml(project.clientName)}</strong></div>
            <div><span>Category</span><strong>${escapeHtml(project.category)}</strong></div>
            <div><span>Subcategory</span><strong>${escapeHtml(project.subcategory)}</strong></div>
            <div><span>Type</span><strong>${escapeHtml(project.type)}</strong></div>
            <div><span>Start Date</span><strong>${escapeHtml(formatThaiDate(project.startDate))}</strong></div>
            <div><span>Completed</span><strong>${escapeHtml(formatThaiDate(project.completedDate))}</strong></div>
          </div>
          <div class="links">
            <a href="${escapeHtml(detailUrl)}">Project Detail</a>
            ${slideshowUrl ? `<a href="${escapeHtml(slideshowUrl)}">Slideshow HTML</a>` : ""}
            ${liveUrl ? `<a href="${escapeHtml(liveUrl)}">Live System</a>` : ""}
          </div>
        </article>

        <article class="panel">
          <h3>Showcase Assets</h3>
          <div class="check-grid">
            <div><span>Cover</span><strong>${project.assets?.cover ? "Ready" : "Missing"}</strong></div>
            <div><span>Screenshots</span><strong>${screenshots.length}</strong></div>
            <div><span>Slides</span><strong>${Array.isArray(project.slides) ? project.slides.length : 0}</strong></div>
            <div><span>Capture Status</span><strong>${escapeHtml(project.captureStatus || "pending")}</strong></div>
          </div>
          ${tags.length > 0 ? `<div class="token-block"><label>Tags</label><div class="token-row">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div></div>` : ""}
          ${keywords.length > 0 ? `<div class="token-block"><label>Keywords</label><div class="token-row">${keywords.slice(0, 8).map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}</div></div>` : ""}
        </article>
      </div>

      <div class="panel screenshot-panel">
        <div class="section-head">
          <h3>Screenshot Gallery</h3>
          <span>${screenshots.length > 0 ? `${screenshots.length} asset(s)` : "No screenshots"}</span>
        </div>
        ${screenshots.length > 0 ? `
          <div class="screenshot-grid">
            ${screenshots.map((item) => `
              <figure class="shot-card">
                <img src="${escapeHtml(publicAssetToFileUrl(item.src))}" alt="${escapeHtml(project.projectName)} ${escapeHtml(item.label)}" />
                <figcaption>${escapeHtml(item.label)}</figcaption>
              </figure>
            `).join("")}
          </div>
        ` : `<div class="placeholder">ยังไม่มี screenshot สำหรับโครงการนี้</div>`}
      </div>

      <footer class="project-footer">
        <span>${escapeHtml(project.slug)}</span>
        <span>${index + 1}</span>
      </footer>
    </section>
  `;
}

function renderPortfolioHtml(manifest) {
  const categoryCounts = new Map();
  const typeCounts = new Map();

  for (const project of manifest.projects) {
    categoryCounts.set(project.category, (categoryCounts.get(project.category) || 0) + 1);
    typeCounts.set(project.type, (typeCounts.get(project.type) || 0) + 1);
  }

  const categorySummary = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);
  const typeSummary = [...typeCounts.entries()].sort((a, b) => b[1] - a[1]);

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Portfolio Complete | Patompong Tech Consultant</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #f8fafc;
      font-family: Inter, Arial, sans-serif;
    }
    body {
      counter-reset: page;
    }
    .cover-page {
      page-break-after: always;
    }
    .project-sheet {
      page-break-before: always;
      page-break-inside: auto;
    }
    .cover-page {
      min-height: calc(297mm - 24mm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16mm;
      color: white;
      background: linear-gradient(135deg, #111827 0%, #0f172a 45%, #d97706 100%);
      border-radius: 28px;
    }
    .cover-eyebrow {
      display: inline-flex;
      width: fit-content;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.08);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 11px;
    }
    .cover-page h1 {
      margin: 24px 0 0;
      font-size: 54px;
      line-height: 1.02;
      max-width: 680px;
    }
    .cover-page p {
      margin: 18px 0 0;
      max-width: 720px;
      font-size: 17px;
      line-height: 1.8;
      color: rgba(255,255,255,0.84);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 28px;
    }
    .summary-card {
      border-radius: 22px;
      padding: 18px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .summary-card span {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: rgba(255,255,255,0.72);
    }
    .summary-card strong {
      display: block;
      margin-top: 12px;
      font-size: 34px;
    }
    .summary-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 28px;
    }
    .summary-panel {
      border-radius: 24px;
      padding: 20px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .summary-panel h2 {
      margin: 0 0 14px;
      font-size: 22px;
    }
    .summary-list {
      display: grid;
      gap: 10px;
      font-size: 13px;
      color: rgba(255,255,255,0.84);
    }
    .summary-list div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 10px;
    }
    .summary-list div:last-child {
      border-bottom: 0;
      padding-bottom: 0;
    }
    .project-sheet {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 0;
    }
    .project-hero {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 18px;
      min-height: 80mm;
      padding: 18px;
      border-radius: 26px;
      color: white;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .project-index {
      display: inline-flex;
      width: fit-content;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(0,0,0,0.22);
      border: 1px solid rgba(255,255,255,0.14);
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .project-hero-copy h2 {
      margin: 16px 0 0;
      font-size: 34px;
      line-height: 1.08;
    }
    .project-client {
      margin: 12px 0 0;
      font-size: 14px;
      color: rgba(255,255,255,0.82);
    }
    .project-description {
      margin: 14px 0 0;
      font-size: 13px;
      line-height: 1.75;
      color: rgba(255,255,255,0.88);
    }
    .project-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    .project-pills span {
      padding: 7px 11px;
      border-radius: 999px;
      background: rgba(0,0,0,0.24);
      border: 1px solid rgba(255,255,255,0.14);
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .project-hero-visual {
      overflow: hidden;
      border-radius: 22px;
      background: rgba(0,0,0,0.18);
      border: 1px solid rgba(255,255,255,0.12);
      min-height: 100%;
    }
    .project-hero-visual img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: end;
      padding: 22px;
      background: linear-gradient(135deg, rgba(15,23,42,0.22), rgba(255,255,255,0.08));
    }
    .fallback-card strong {
      font-size: 26px;
      line-height: 1.1;
    }
    .fallback-card span {
      margin-top: 12px;
      font-size: 14px;
      color: rgba(255,255,255,0.82);
    }
    .content-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .panel {
      border-radius: 22px;
      padding: 18px;
      background: white;
      border: 1px solid rgba(15,23,42,0.08);
      box-shadow: 0 18px 42px rgba(15,23,42,0.06);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .panel h3 {
      margin: 0 0 14px;
      font-size: 18px;
    }
    .info-grid,
    .check-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .info-grid div,
    .check-grid div {
      border-radius: 16px;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid rgba(15,23,42,0.08);
    }
    .info-grid span,
    .check-grid span,
    .token-block label,
    .section-head span {
      display: block;
      font-size: 10px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #64748b;
    }
    .info-grid strong,
    .check-grid strong {
      display: block;
      margin-top: 9px;
      font-size: 14px;
      line-height: 1.5;
      color: #0f172a;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }
    .links a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 10px 14px;
      border-radius: 999px;
      text-decoration: none;
      border: 1px solid rgba(217,119,6,0.24);
      background: rgba(245,158,11,0.08);
      color: #b45309;
      font-size: 12px;
      font-weight: 700;
    }
    .token-block {
      margin-top: 16px;
    }
    .token-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .token-row span {
      display: inline-flex;
      align-items: center;
      min-height: 30px;
      padding: 7px 10px;
      border-radius: 999px;
      background: #fff7ed;
      border: 1px solid rgba(217,119,6,0.14);
      color: #9a3412;
      font-size: 11px;
    }
    .screenshot-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .section-head h3 {
      margin: 0;
    }
    .screenshot-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
    .shot-card {
      margin: 0;
      border-radius: 18px;
      overflow: hidden;
      border: 1px solid rgba(15,23,42,0.08);
      background: #f8fafc;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .shot-card img {
      display: block;
      width: 100%;
      height: 132px;
      object-fit: cover;
      background: #e2e8f0;
    }
    .shot-card figcaption {
      padding: 10px 12px;
      font-size: 12px;
      color: #334155;
    }
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 160px;
      border-radius: 18px;
      border: 1px dashed rgba(15,23,42,0.14);
      color: #64748b;
      font-size: 13px;
      background: #f8fafc;
    }
    .project-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 6px;
      color: #64748b;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <section class="cover-page">
    <div>
      <span class="cover-eyebrow">Portfolio Showcase System</span>
      <h1>Portfolio Complete Book</h1>
      <p>เอกสารรวมผลงานแบบ self-contained ที่สร้างจาก pipeline เดียวกันกับ cover, screenshots, slideshow และ manifest เพื่อใช้พรีเซนต์ผลงานทั้งหมดของ Patompong Tech Consultant</p>
      <div class="summary-grid">
        <div class="summary-card"><span>Total Projects</span><strong>${manifest.totals.projects}</strong></div>
        <div class="summary-card"><span>Covers Ready</span><strong>${manifest.totals.coversReady}</strong></div>
        <div class="summary-card"><span>Screenshots Ready</span><strong>${manifest.totals.screenshotSetsReady}</strong></div>
        <div class="summary-card"><span>Slideshows Ready</span><strong>${manifest.totals.slideshowsReady}</strong></div>
      </div>
      <div class="summary-columns">
        <div class="summary-panel">
          <h2>Top Categories</h2>
          <div class="summary-list">
            ${categorySummary.slice(0, 8).map(([name, count]) => `<div><span>${escapeHtml(name)}</span><strong>${count}</strong></div>`).join("")}
          </div>
        </div>
        <div class="summary-panel">
          <h2>System Types</h2>
          <div class="summary-list">
            ${typeSummary.slice(0, 8).map(([name, count]) => `<div><span>${escapeHtml(name)}</span><strong>${count}</strong></div>`).join("")}
          </div>
        </div>
      </div>
    </div>
    <div>
      <p>Generated at ${escapeHtml(new Date(manifest.generatedAt).toLocaleString("th-TH"))}</p>
      <p>Next.js Showcase: ${escapeHtml(toAbsoluteSiteUrl("/projects"))}</p>
    </div>
  </section>

  ${manifest.projects.map((project, index) => renderProjectSection(project, index)).join("\n")}
</body>
</html>`;
}

async function main() {
  await ensureShowcaseDirectories();
  await buildManifestData();
  const manifest = await loadManifest();

  if (!manifest) {
    throw new Error("Manifest not found. Run earlier phases first.");
  }

  const html = renderPortfolioHtml(manifest);
  await fs.writeFile(portfolioHtmlPath, html, "utf8");

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(portfolioHtmlPath).toString(), { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");
    await page.pdf({
      path: portfolioPdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }

  console.log(`Portfolio HTML generated at ${portfolioHtmlPath}`);
  console.log(`Portfolio PDF generated at ${portfolioPdfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
