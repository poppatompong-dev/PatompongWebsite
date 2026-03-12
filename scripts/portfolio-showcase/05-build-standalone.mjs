import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  ensureShowcaseDirectories,
  escapeHtml,
  formatDateRange,
  loadManifest,
  publicDir,
  standaloneShelfPath,
  toAbsoluteSiteUrl,
} from "./shared.mjs";
import { buildManifestData } from "./build-manifest.mjs";

function assetToBase64(assetPath) {
  if (!assetPath) return null;
  const normalized = assetPath.replace(/^\/+/, "");
  const absolutePath = path.join(publicDir, ...normalized.split("/"));
  if (!existsSync(absolutePath)) return null;
  try {
    const buf = require("node:fs").readFileSync(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch { return null; }
}

function renderShelfHtml(manifest) {
  const projects = manifest.projects || [];

  const cards = projects.map((p, i) => {
    const coverSrc = assetToBase64(p.assets?.cover) || assetToBase64(p.assets?.screenshots?.hero) || "";
    const heroSrc = assetToBase64(p.assets?.screenshots?.hero) || assetToBase64(p.assets?.screenshots?.desktop) || "";
    const mobileSrc = assetToBase64(p.assets?.screenshots?.mobile) || "";
    const tags = Array.isArray(p.tags) ? p.tags.slice(0, 4) : [];
    const gradient = p.theme?.gradient || "linear-gradient(135deg,#D97706,#111827)";
    const accent = p.theme?.accent || "#D97706";
    const icon = p.theme?.icon || "◆";
    const liveUrl = p.url || "#";

    return `
    <article class="card" style="--accent:${escapeHtml(accent)}">
      <div class="card-cover" style="background:${escapeHtml(gradient)}">
        ${coverSrc ? `<img src="${escapeHtml(coverSrc)}" alt="${escapeHtml(p.projectName)}" loading="lazy"/>` : `<div class="card-fallback"><span class="card-icon">${escapeHtml(icon)}</span></div>`}
        <span class="card-num">#${String(p.projectNumber).padStart(2, "0")}</span>
        <span class="card-type">${escapeHtml(icon)} ${escapeHtml(p.type)}</span>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(p.projectName)}</h3>
        <p class="card-client">${escapeHtml(p.clientName)}</p>
        <p class="card-desc">${escapeHtml((p.description || "").slice(0, 150))}</p>
        <div class="card-tags">${tags.map(t => `<span>${escapeHtml(t)}</span>`).join("")}</div>
        <div class="card-meta">
          <span>${escapeHtml(p.category)}</span>
          <span>${escapeHtml(formatDateRange(p))}</span>
        </div>
        ${heroSrc ? `<div class="card-screenshots">${heroSrc ? `<img src="${heroSrc}" alt="Screenshot" class="shot-thumb"/>` : ""}${mobileSrc ? `<img src="${mobileSrc}" alt="Mobile" class="shot-thumb-mobile"/>` : ""}</div>` : ""}
        <div class="card-actions">
          ${p.url ? `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener">Open Live</a>` : ""}
          <a href="${escapeHtml(toAbsoluteSiteUrl(`/projects/${p.slug}`))}" target="_blank" rel="noopener">Details</a>
        </div>
      </div>
    </article>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Portfolio Shelf | Patompong Tech Consultant</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,system-ui,sans-serif;background:#0f172a;color:#f1f5f9;min-height:100vh}
.header{padding:48px 32px 32px;text-align:center;background:linear-gradient(135deg,#111827 0%,#0f172a 60%,#d97706 100%);border-bottom:1px solid rgba(255,255,255,.08)}
.header h1{font-size:clamp(28px,4vw,48px);font-weight:800;letter-spacing:-.03em;margin-bottom:8px}
.header p{color:rgba(255,255,255,.7);font-size:15px;max-width:640px;margin:0 auto}
.stats{display:flex;justify-content:center;gap:28px;margin-top:24px;flex-wrap:wrap}
.stat{text-align:center}
.stat strong{display:block;font-size:28px;color:#fcd34d}
.stat span{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:rgba(255,255,255,.6)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;padding:32px;max-width:1400px;margin:0 auto}
.card{border-radius:20px;overflow:hidden;background:#1e293b;border:1px solid rgba(255,255,255,.06);transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-4px);box-shadow:0 20px 50px rgba(0,0,0,.4)}
.card-cover{position:relative;height:200px;overflow:hidden}
.card-cover img{width:100%;height:100%;object-fit:cover}
.card-fallback{height:100%;display:flex;align-items:center;justify-content:center}
.card-icon{font-size:48px;opacity:.6}
.card-num{position:absolute;top:12px;right:12px;padding:5px 10px;border-radius:999px;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);font-size:11px;letter-spacing:.1em;color:rgba(255,255,255,.8)}
.card-type{position:absolute;bottom:12px;left:12px;padding:6px 12px;border-radius:999px;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);font-size:12px;color:rgba(255,255,255,.9)}
.card-body{padding:18px}
.card-body h3{font-size:17px;font-weight:700;line-height:1.3;margin-bottom:6px;color:#f8fafc}
.card-client{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:10px}
.card-desc{font-size:13px;line-height:1.6;color:rgba(255,255,255,.7);margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.card-tags span{padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;color:rgba(255,255,255,.7)}
.card-meta{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.5);padding-top:10px;border-top:1px solid rgba(255,255,255,.06);margin-bottom:12px}
.card-actions{display:flex;gap:8px}
.card-actions a{flex:1;text-align:center;padding:8px 12px;border-radius:10px;text-decoration:none;font-size:12px;font-weight:600;border:1px solid var(--accent,#d97706);color:var(--accent,#d97706);transition:all .15s}
.card-actions a:first-child{background:var(--accent,#d97706);color:#0f172a;border-color:var(--accent,#d97706)}
.card-actions a:hover{opacity:.85}
.card-screenshots{display:flex;gap:6px;margin-bottom:12px}
.shot-thumb{height:56px;width:96px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.1)}
.shot-thumb-mobile{height:56px;width:32px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.1)}
.footer{text-align:center;padding:32px;color:rgba(255,255,255,.4);font-size:12px;border-top:1px solid rgba(255,255,255,.06)}
</style>
</head>
<body>
<div class="header">
  <h1>Portfolio Shelf</h1>
  <p>Standalone portfolio showcase — Patompong Tech Consultant</p>
  <div class="stats">
    <div class="stat"><strong>${projects.length}</strong><span>Projects</span></div>
    <div class="stat"><strong>${manifest.totals?.coversReady || 0}</strong><span>Covers</span></div>
    <div class="stat"><strong>${manifest.totals?.screenshotSetsReady || 0}</strong><span>Screenshots</span></div>
  </div>
</div>
<div class="grid">
${cards}
</div>
<div class="footer">
  Generated ${new Date().toLocaleString("th-TH")} &bull; Patompong Tech Consultant
</div>
</body>
</html>`;
}

async function main() {
  await ensureShowcaseDirectories();
  await buildManifestData();
  const manifest = await loadManifest();
  if (!manifest) throw new Error("Manifest not found. Run earlier phases first.");

  const html = renderShelfHtml(manifest);
  await fs.writeFile(standaloneShelfPath, html, "utf8");
  console.log(`Standalone shelf generated at ${standaloneShelfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
