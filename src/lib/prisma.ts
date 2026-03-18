import path from "node:path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Resolve DATABASE_URL to an absolute path at runtime so it works both
// locally and inside Netlify serverless functions (process.cwd() differs
// from the build-time /opt/build/repo path).
function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  // Only fix file: URLs that use a relative or build-time absolute path
  const match = url.match(/^file:(.+)$/);
  if (!match) return url;
  const filePath = match[1];
  // If already absolute and exists as-is, keep it; otherwise resolve from cwd
  if (path.isAbsolute(filePath)) return url;
  return `file:${path.resolve(process.cwd(), filePath)}`;
}

function createPrismaClient() {
  const datasourceUrl = resolveDatabaseUrl();
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
    });
  } catch (e) {
    console.error("Failed to create PrismaClient:", e);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
