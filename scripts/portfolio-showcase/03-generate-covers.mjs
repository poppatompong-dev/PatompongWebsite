import puppeteer from "puppeteer";
import { buildManifestData } from "./build-manifest.mjs";
import { ensureShowcaseDirectories, escapeHtml, loadSourcePortfolioData } from "./shared.mjs";

function renderCoverHtml(project) {
  const tags = Array.isArray(project.tags) ? project.tags.slice(0, 4) : [];
  const summary = escapeHtml(project.preparedDescription).slice(0, 220);

  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0f172a; }
  .frame {
    width: 1200px;
    height: 630px;
    position: relative;
    overflow: hidden;
    background: ${project.theme.gradient};
    color: #fefce8;
  }
  .noise {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 22%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08), transparent 20%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08), transparent 24%);
    opacity: 0.8;
  }
  .orb {
    position: absolute;
    border-radius: 999px;
    background: ${project.theme.surface};
    filter: blur(12px);
  }
  .orb.one { width: 280px; height: 280px; top: -60px; right: -40px; }
  .orb.two { width: 340px; height: 340px; bottom: -110px; left: -80px; }
  .bar {
    position: absolute;
    left: 54px;
    top: 54px;
    width: 6px;
    height: 180px;
    background: ${project.theme.accent};
    border-radius: 999px;
    box-shadow: 0 0 30px ${project.theme.accent}66;
  }
  .content {
    position: absolute;
    inset: 0;
    padding: 56px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 12px 18px;
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    font-size: 15px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #fde68a;
  }
  .num {
    font-size: 120px;
    line-height: 0.85;
    font-weight: 800;
    color: rgba(255,255,255,0.14);
    letter-spacing: -0.06em;
  }
  .mid {
    max-width: 860px;
    margin-left: 26px;
  }
  .eyebrow {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #fcd34d;
  }
  h1 {
    margin: 16px 0 10px;
    font-size: 54px;
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.04em;
  }
  .english {
    font-size: 24px;
    color: rgba(255,255,255,0.82);
    letter-spacing: 0.03em;
  }
  .desc {
    margin-top: 20px;
    max-width: 760px;
    color: rgba(255,255,255,0.82);
    font-size: 21px;
    line-height: 1.55;
  }
  .bottom {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }
  .client {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .client .label {
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.62);
  }
  .client .value {
    font-size: 28px;
    font-weight: 700;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 10px;
    max-width: 460px;
  }
  .tag {
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(15,23,42,0.24);
    font-size: 14px;
    color: rgba(255,255,255,0.9);
  }
  .icon {
    font-size: 32px;
  }
</style>
</head>
<body>
  <div class="frame">
    <div class="noise"></div>
    <div class="orb one"></div>
    <div class="orb two"></div>
    <div class="bar"></div>
    <div class="content">
      <div class="top">
        <div class="badge"><span class="icon">${escapeHtml(project.theme.icon)}</span><span>${escapeHtml(project.type)}</span></div>
        <div class="num">${String(project.projectNumber).padStart(2, "0")}</div>
      </div>
      <div class="mid">
        <div class="eyebrow">Patompong Tech Consultant</div>
        <h1>${escapeHtml(project.projectName)}</h1>
        <div class="english">${escapeHtml(project.englishTitle)}</div>
        <div class="desc">${summary}</div>
      </div>
      <div class="bottom">
        <div class="client">
          <div class="label">Client</div>
          <div class="value">${escapeHtml(project.clientName)}</div>
        </div>
        <div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  await ensureShowcaseDirectories();
  const source = await loadSourcePortfolioData();
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const project of source.projects) {
    console.log(`Generating cover ${project.id}`);
    await page.setContent(renderCoverHtml(project), { waitUntil: "load", timeout: 10000 });
    await page.screenshot({ path: project.absoluteOutput.coverAbsolutePath, type: "png" });
  }

  await browser.close();
  await buildManifestData();
  console.log("Cover generation completed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
