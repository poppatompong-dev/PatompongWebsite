import { ensureShowcaseDirectories, loadCredentialProfiles, loadSourcePortfolioData, matchCredentialProfiles, writeJson, dataCatalogPath } from "./shared.mjs";

async function main() {
  await ensureShowcaseDirectories();
  const source = await loadSourcePortfolioData();
  const credentialProfiles = await loadCredentialProfiles();

  const catalog = {
    generatedAt: new Date().toISOString(),
    metadata: source.metadata,
    statistics: source.statistics,
    credentialsConfigured: credentialProfiles.length > 0,
    totals: {
      projects: source.projects.length,
      public: 0,
      conditional: 0,
      login_required: 0,
      unknown: 0,
    },
    projects: source.projects.map((project) => {
      const matchedProfiles = matchCredentialProfiles(project.url, credentialProfiles);
      const matchedProfile = matchedProfiles[0] || null;
      const captureStrategy = project.accessMode === "public"
        ? "capture"
        : matchedProfiles.length > 0
          ? "capture_with_credentials"
          : project.accessMode === "conditional"
            ? "try_then_fallback"
            : "cover_only";

      return {
        id: project.id,
        slug: project.slug,
        projectNumber: project.projectNumber,
        projectName: project.projectName,
        englishTitle: project.englishTitle,
        clientId: project.clientId,
        clientName: project.clientName,
        type: project.type,
        category: project.category,
        categoryId: project.categoryId,
        categoryColor: project.categoryColor,
        subcategory: project.subcategory,
        url: project.url,
        description: project.description,
        preparedDescription: project.preparedDescription,
        tags: Array.isArray(project.tags) ? project.tags : [],
        keywords: Array.isArray(project.keywords) ? project.keywords : [],
        status: project.status,
        startDate: project.startDate,
        completedDate: project.completedDate,
        accessMode: project.accessMode,
        accessReason: project.accessReason,
        credentialProfileId: matchedProfile?.id || null,
        credentialProfileIds: matchedProfiles.map((profile) => profile.id),
        captureStrategy,
        output: project.output,
        capture: {
          status: "pending",
          credentialProfile: matchedProfile?.label || null,
          credentialProfiles: matchedProfiles.map((profile) => profile.label),
          attemptedAt: null,
          error: null,
        },
        theme: project.theme,
      };
    }),
  };

  for (const project of catalog.projects) {
    catalog.totals[project.accessMode] += 1;
  }

  await writeJson(dataCatalogPath, catalog);
  console.log(`Catalog generated at ${dataCatalogPath}`);
  console.log(`Projects: ${catalog.totals.projects}`);
  console.log(`Public: ${catalog.totals.public}`);
  console.log(`Conditional: ${catalog.totals.conditional}`);
  console.log(`Login required: ${catalog.totals.login_required}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
