-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ownerUserId" TEXT;

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN IF NOT EXISTS "youtubeCommentTotal" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Analysis" ADD COLUMN IF NOT EXISTS "ingestedCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MemberInvite" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemberInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MemberInvite_ownerId_email_key" ON "MemberInvite"("ownerId", "email");

DO $$ BEGIN ALTER TABLE "User" ADD CONSTRAINT "User_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "MemberInvite" ADD CONSTRAINT "MemberInvite_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
