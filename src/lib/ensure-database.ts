import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { DatabaseNotConfiguredError, resolveDatabaseUrl } from "@/lib/database-url";
import { currentUsageMonth } from "@/lib/plans";

const INIT_SQL = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "planInterval" TEXT,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "overlayToken" TEXT NOT NULL,
    "liveVideoId" TEXT,
    "videosUsedMonth" INTEGER NOT NULL DEFAULT 0,
    "ideasUsedMonth" INTEGER NOT NULL DEFAULT 0,
    "scriptsUsedMonth" INTEGER NOT NULL DEFAULT 0,
    "usageMonth" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "Channel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'vod',
    "videoId" TEXT NOT NULL,
    "videoTitle" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelId" TEXT,
    "thumbnailUrl" TEXT,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL DEFAULT 'demo',
    "statsJson" TEXT NOT NULL,
    "commentsJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "Script" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisId" TEXT,
    "ideaTitle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Script_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_overlayToken_key" ON "User"("overlayToken")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Channel_userId_youtubeId_key" ON "Channel"("userId", "youtubeId")`,
  `CREATE INDEX IF NOT EXISTS "Analysis_userId_createdAt_idx" ON "Analysis"("userId", "createdAt")`,
  `DO $$ BEGIN ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Script" ADD CONSTRAINT "Script_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "Script" ADD CONSTRAINT "Script_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY ("id")
  )`,
  `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count")
   SELECT '0f7c2c3a-6a1e-4c4d-9c0f-8a9b1d2e3f40', '1ffba8f77ddb93d77f30b99c0b165376fabe5e88355d303f86c28b0bc176a51b', NOW(), '20260907120000_init', NULL, NULL, NOW(), 1
   WHERE NOT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = '20260907120000_init')`,
];

let ensured: Promise<void> | null = null;

async function seedDemoUser(prisma: PrismaClient) {
  const email = "demo@commentiq.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;
  await prisma.user.create({
    data: {
      email,
      name: "Canal Demo",
      passwordHash: await bcrypt.hash("demo12345", 10),
      plan: "pro",
      planInterval: "monthly",
      overlayToken: randomBytes(16).toString("hex"),
      usageMonth: currentUsageMonth(),
    },
  });
}

export async function ensureDatabase(prisma: PrismaClient) {
  if (!ensured) {
    ensured = (async () => {
      if (!resolveDatabaseUrl()) throw new DatabaseNotConfiguredError();
      try {
        await prisma.user.findFirst({ select: { id: true } });
      } catch {
        for (const sql of INIT_SQL) {
          await prisma.$executeRawUnsafe(sql);
        }
      }
      await seedDemoUser(prisma);
    })().catch((error) => {
      ensured = null;
      throw error;
    });
  }
  await ensured;
}

export function prismaFailureMessage(error: unknown): string | null {
  if (error instanceof DatabaseNotConfiguredError) return error.message;
  if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
    return "AUTH_SECRET não está definido na Vercel (Settings → Environment Variables).";
  }
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: string }).code)
      : "";
  if (
    code === "P1001" ||
    code === "P1012" ||
    code === "P2021" ||
    (error instanceof Error && /database|datasource|empty string|can't reach/i.test(error.message))
  ) {
    return new DatabaseNotConfiguredError().message;
  }
  return null;
}
