import fs from "node:fs/promises";
import path from "node:path";
import { buildManifestData } from "./build-manifest.mjs";
import {
  ensureShowcaseDirectories,
  exists,
  loadManifest,
  portfolioHtmlPath,
  portfolioPdfPath,
  publicDir,
  qaReportPath,
  standaloneShelfPath,
  writeJson,
} from "./shared.mjs";

function publicAssetToAbsolute(assetPath) {
  if (!assetPath || /^https?:\/\//i.test(assetPath)) return null;
  return path.join(publicDir, ...assetPath.replace(/^\/+/, "").split("/"));
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function createCheck(name, status, details) {
  return { name, status, details };
}

function getProjectStatus(checks) {
  if (checks.some((check) => check.status === "fail")) return "fail";
  if (checks.some((check) => check.status === "warn")) return "warn";
  return "pass";
}

async function evaluateProject(project) {
  const screenshotAssets = [
    project.assets?.screenshots?.hero,
    project.assets?.screenshots?.desktop,
    project.assets?.screenshots?.mobile,
  ].filter(Boolean);
  const slideshowAbsolutePath = publicAssetToAbsolute(project.assets?.slideshow);
  const slideshowSource = slideshowAbsolutePath ? await readTextIfExists(slideshowAbsolutePath) : "";
  const checks = [];

  checks.push(
    createCheck(
      "cover_asset",
      project.assets?.cover ? "pass" : "warn",
      project.assets?.cover ? "Cover file present" : "Cover file missing"
    )
  );

  if (screenshotAssets.length > 0) {
    checks.push(createCheck("screenshots", "pass", `${screenshotAssets.length} screenshot asset(s) found`));
  } else if (project.accessMode === "login_required" || project.captureStatus === "fallback") {
    checks.push(createCheck("screenshots", "warn", "No public screenshots available for protected or fallback capture project"));
  } else {
    checks.push(createCheck("screenshots", "fail", "No screenshots found"));
  }

  if (project.assets?.slideshow) {
    const slideshowValid = slideshowSource.includes("slide-pane") && slideshowSource.includes("function next") && slideshowSource.includes("render()");
    checks.push(createCheck("slideshow_html", slideshowValid ? "pass" : "fail", slideshowValid ? "Slideshow HTML looks valid" : "Slideshow HTML missing expected viewer structure"));
  } else {
    checks.push(createCheck("slideshow_html", "fail", "Slideshow HTML missing"));
  }

  const slideCount = Array.isArray(project.slides) ? project.slides.length : 0;
  checks.push(createCheck("slide_data", slideCount >= 5 ? "pass" : "warn", `${slideCount} slide record(s)`));

  checks.push(
    createCheck(
      "live_url",
      project.url ? "pass" : "warn",
      project.url ? "Live URL present" : "No public live URL"
    )
  );

  checks.push(
    createCheck(
      "capture_status",
      project.captureStatus === "captured" ? "pass" : project.captureStatus === "fallback" ? "warn" : "warn",
      `Capture status: ${project.captureStatus || "pending"}`
    )
  );

  return {
    id: project.id,
    slug: project.slug,
    projectName: project.projectName,
    status: getProjectStatus(checks),
    screenshotCount: screenshotAssets.length,
    checks,
  };
}

async function main() {
  await ensureShowcaseDirectories();
  await buildManifestData();
  const manifest = await loadManifest();

  if (!manifest) {
    throw new Error("Manifest not found. Run earlier phases first.");
  }

  const [standaloneSource, portfolioHtmlSource, pdfSize, standaloneSize, portfolioHtmlSize] = await Promise.all([
    readTextIfExists(standaloneShelfPath),
    readTextIfExists(portfolioHtmlPath),
    getFileSize(portfolioPdfPath),
    getFileSize(standaloneShelfPath),
    getFileSize(portfolioHtmlPath),
  ]);

  const projects = [];
  for (const project of manifest.projects) {
    projects.push(await evaluateProject(project));
  }

  const outputChecks = [
    createCheck(
      "standalone_shelf",
      exists(standaloneShelfPath) && standaloneSource.includes("projectGrid") && standaloneSource.includes("viewerModal") ? "pass" : "fail",
      exists(standaloneShelfPath) ? `Standalone shelf size ${standaloneSize} bytes` : "Standalone shelf file missing"
    ),
    createCheck(
      "portfolio_html",
      exists(portfolioHtmlPath) && portfolioHtmlSource.includes("Portfolio Complete Book") ? "pass" : "fail",
      exists(portfolioHtmlPath) ? `Portfolio HTML size ${portfolioHtmlSize} bytes` : "Portfolio HTML file missing"
    ),
    createCheck(
      "portfolio_pdf",
      exists(portfolioPdfPath) && pdfSize > 0 ? "pass" : "fail",
      exists(portfolioPdfPath) ? `Portfolio PDF size ${pdfSize} bytes` : "Portfolio PDF file missing"
    ),
  ];

  const summary = {
    projects: manifest.projects.length,
    passProjects: projects.filter((project) => project.status === "pass").length,
    warnProjects: projects.filter((project) => project.status === "warn").length,
    failProjects: projects.filter((project) => project.status === "fail").length,
    outputFailures: outputChecks.filter((check) => check.status === "fail").length,
    coversReady: manifest.totals.coversReady,
    screenshotSetsReady: manifest.totals.screenshotSetsReady,
    slideshowsReady: manifest.totals.slideshowsReady,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    outputs: outputChecks,
    projects,
  };

  await writeJson(qaReportPath, report);
  await buildManifestData();

  console.log(`QA report generated at ${qaReportPath}`);
  console.log(`Projects: ${summary.projects} | pass=${summary.passProjects} warn=${summary.warnProjects} fail=${summary.failProjects}`);
  console.log(`Output failures: ${summary.outputFailures}`);

  if (summary.failProjects > 0 || summary.outputFailures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
