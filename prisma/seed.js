// Prisma Seed Script
// Usage: node prisma/seed.js or npx prisma db seed

const { PrismaClient } = require("@prisma/client");
const projectsData = require("./projects_optimized.json");

const prisma = new PrismaClient();

function parseThaiDate(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  const gregorianYear = year > 2400 ? year - 543 : year;
  return new Date(Date.UTC(gregorianYear, month - 1, day));
}

async function main() {
  console.log("🌱 Starting seed process...");

  try {
    // 1. Delete existing data (optional - comment out if you want to keep data)
    console.log("🗑️  Clearing existing data...");
    await prisma.projectStatistics.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.portfolioMetadata.deleteMany({});

    // 2. Seed Portfolio Metadata
    console.log("📝 Seeding portfolio metadata...");
    await prisma.portfolioMetadata.create({
      data: {
        owner: projectsData.metadata.owner,
        position: projectsData.metadata.position,
        startDate: parseThaiDate(projectsData.metadata.startDate),
        description: projectsData.metadata.description,
        totalProjects: projectsData.metadata.totalProjects,
        generatedDate: new Date(projectsData.metadata.generatedDate),
      },
    });

    // 3. Seed Clients
    console.log("🏢 Seeding clients...");
    const clients = {};
    for (const clientData of projectsData.clients) {
      const client = await prisma.client.create({
        data: {
          clientId: clientData.clientId,
          clientName: clientData.clientName,
          slug: clientData.slug,
          projectCount: clientData.projectCount,
        },
      });
      clients[clientData.clientId] = client;
      console.log(`  ✓ Created client: ${clientData.clientName}`);
    }

    // 4. Seed Categories
    console.log("📂 Seeding categories...");
    const categories = {};
    for (const categoryData of projectsData.categories) {
      const category = await prisma.category.create({
        data: {
          categoryId: categoryData.id,
          name: categoryData.name,
          projectCount: categoryData.projectCount,
          color: categoryData.color,
        },
      });
      categories[categoryData.id] = category;
      console.log(`  ✓ Created category: ${categoryData.name}`);
    }

    // 5. Seed Projects
    console.log("📊 Seeding projects...");
    for (const projectData of projectsData.projects) {
      // Find category based on type or use default
      let categoryId = "cat_web";

      if (projectData.type.includes("Google Earth")) {
        categoryId = "cat_mapping";
      } else if (projectData.type.includes("AppSheet")) {
        categoryId = "cat_database";
      } else if (projectData.type.includes("Looker")) {
        categoryId = "cat_analytics";
      } else if (projectData.type.includes("React") || projectData.type.includes("Firebase")) {
        categoryId = "cat_web";
      } else if (projectData.type.includes("Google Apps")) {
        categoryId = "cat_automation";
      }

      const project = await prisma.project.create({
        data: {
          projectId: projectData.id,
          projectNumber: projectData.projectNumber,
          projectName: projectData.projectName,
          slug: projectData.slug,
          clientId: projectData.clientId,
          type: projectData.type,
          categoryId: categoryId,
          subcategory: projectData.subcategory,
          url: projectData.url || null,
          description: projectData.description || null,
          tags: projectData.tags ? JSON.stringify(projectData.tags) : null,
          keywords: projectData.keywords ? JSON.stringify(projectData.keywords) : null,
          status: projectData.status || "completed",
          startDate: parseThaiDate(projectData.startDate),
          completedDate: parseThaiDate(projectData.completedDate),
        },
      });

      console.log(`  ✓ Created project: ${projectData.projectName}`);
    }

    // 6. Seed Statistics
    console.log("📈 Seeding statistics...");
    await prisma.projectStatistics.create({
      data: {
        totalProjects: projectsData.statistics.total,
        byType: JSON.stringify(projectsData.statistics.byType),
        byCategory: JSON.stringify(projectsData.statistics.byCategory),
        byClient: JSON.stringify(projectsData.statistics.byClient),
        byStatus: JSON.stringify(projectsData.statistics.byStatus),
      },
    });

    console.log("✅ Seed completed successfully!");
    console.log(`📊 Total projects seeded: ${projectsData.statistics.total}`);

  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
