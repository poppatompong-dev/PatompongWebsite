import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient | null };

function createPrismaClient(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  } catch {
    return null;
  }
}

const _prisma = globalForPrisma.prisma !== undefined
  ? globalForPrisma.prisma
  : createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;

// Safe proxy: if no DB, every method returns a rejected promise (caught upstream)
export const prisma = _prisma ?? new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return () => Promise.reject(new Error(`No DATABASE_URL — DB unavailable (${String(prop)})`));
  },
});
