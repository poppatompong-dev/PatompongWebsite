import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog, loadSourcePortfolioData, writeJson, manifestPath, qaReportPath, readJson, exists, toPublicAssetPath, buildProjectSlides } from "./shared.mjs";

export async function buildManifestData() {
  const source = await loadSourcePortfolioData();
  const catalog = await loadCatalog();
  const qaReport = await readJson(qaReportPath, null);
  const catalogMap = new Map((catalog?.projects || []).map((project) => [project.id, project]));
  const qaMap = new Map((qaReport?.projects || []).map((project) => [project.id, project]));

  const projects = source.projects.map((project) => {
    const catalogRecord = catalogMap.get(project.id) || null;
    const qaRecord = qaMap.get(project.id) || null;
    const assetPaths = project.absoluteOutput;
    const coverExists = exists(assetPaths.coverAbsolutePath);
    const desktopExists = exists(assetPaths.desktopScreenshotAbsolutePath);
    const heroExists = exists(assetPaths.heroScreenshotAbsolutePath);
    const mobileExists = exists(assetPaths.mobileScreenshotAbsolutePath);
    const slideshowExists = exists(assetPaths.slideshowHtmlAbsolutePath);
    const slideshowDataExists = exists(assetPaths.slideshowDataAbsolutePath);

    const assets = {
      cover: coverExists ? toPublicAssetPath(assetPaths.coverAbsolutePath) : null,
      screenshots: {
        desktop: desktopExists ? toPublicAssetPath(assetPaths.desktopScreenshotAbsolutePath) : null,
        hero: heroExists ? toPublicAssetPath(assetPaths.heroScreenshotAbsolutePath) : null,
        mobile: mobileExists ? toPublicAssetPath(assetPaths.mobileScreenshotAbsolutePath) : null,
      },
      slideshow: slideshowExists ? toPublicAssetPath(assetPaths.slideshowHtmlAbsolutePath) : null,
      slideshowData: slideshowDataExists ? toPublicAssetPath(assetPaths.slideshowDataAbsolutePath) : null,
    };

    const slides = buildProjectSlides(project, {
      cover: assets.cover,
      desktop: assets.screenshots.desktop,
      hero: assets.screenshots.hero,
      mobile: assets.screenshots.mobile,
    });

    return {
      id: project.id,
      projectId: project.id,
      projectNumber: project.projectNumber,
      slug: project.slug,
      projectName: project.projectName,
      englishTitle: project.englishTitle,
      clientId: project.clientId,
      clientName: project.clientName,
      clientSlug: project.clientSlug,
      category: project.category,
      categoryId: project.categoryId,
      categoryColor: project.categoryColor,
      subcategory: project.subcategory,
      type: project.type,
      status: project.status,
      url: project.url,
      description: project.description,
      preparedDescription: project.preparedDescription,
      tags: Array.isArray(project.tags) ? project.tags : [],
      keywords: Array.isArray(project.keywords) ? project.keywords : [],
      startDate: project.startDate,
      completedDate: project.completedDate,
      accessMode: catalogRecord?.accessMode || project.accessMode,
      accessReason: catalogRecord?.accessReason || project.accessReason,
      captureStatus: catalogRecord?.capture?.status || "pending",
      theme: project.theme,
      assets,
      slides,
      qa: qaRecord,
    };
  });

  const manifest = {
    generatedAt: new Date().toISOString(),
    totals: {
      projects: projects.length,
      coversReady: projects.filter((project) => project.assets.cover).length,
      screenshotSetsReady: projects.filter((project) => project.assets.screenshots.hero || project.assets.screenshots.desktop || project.assets.screenshots.mobile).length,
      slideshowsReady: projects.filter((project) => project.assets.slideshow).length,
    },
    metadata: source.metadata,
    statistics: source.statistics,
    outputs: {
      standaloneShelf: "/portfolio-showcase/portfolio-shelf.html",
      portfolioPdf: "/portfolio-showcase/Portfolio-Complete.pdf",
      portfolioHtml: "/portfolio-showcase/Portfolio-Complete.html",
      qaReport: "/portfolio-showcase/qa-report.json",
    },
    projects,
  };

  await writeJson(manifestPath, manifest);
  return manifest;
}

const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedAsScript) {
  buildManifestData()
    .then((manifest) => {
      console.log(`Manifest generated for ${manifest.totals.projects} projects`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
