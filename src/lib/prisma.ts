import path from "path";
import { PrismaClient } from "@prisma/client";

const dbUrl = process.env.DATABASE_URL?.startsWith("file:./dev.db")
  ? `file:${path.join(process.cwd(), "prisma", "dev.db")}`
  : process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
