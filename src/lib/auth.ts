import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { currentUsageMonth, isPlanId, type PlanId } from "@/lib/plans";
import { ensureDatabase } from "@/lib/ensure-database";
import type { PlanLimits } from "@/lib/plans";
import { PLAN_LIMITS } from "@/lib/plans";
import { SESSION_COOKIE } from "@/lib/session-cookie";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  plan: PlanId;
  planInterval: string | null;
  overlayToken: string;
  liveVideoId: string | null;
  videosUsedMonth: number;
  ideasUsedMonth: number;
  scriptsUsedMonth: number;
  usageMonth: string;
  limits: PlanLimits;
  role: "criador" | "membro";
  billingOwnerId: string;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readUserIdFromCookie(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

async function resetMonthIfNeeded(user: {
  id: string;
  usageMonth: string;
  videosUsedMonth: number;
  ideasUsedMonth: number;
  scriptsUsedMonth: number;
  plan: string;
  planInterval: string | null;
  overlayToken: string;
  liveVideoId: string | null;
}) {
  const month = currentUsageMonth();
  if (user.usageMonth === month) return user;
  return prisma.user.update({
    where: { id: user.id },
    data: {
      usageMonth: month,
      videosUsedMonth: 0,
      ideasUsedMonth: 0,
      scriptsUsedMonth: 0,
    },
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await readUserIdFromCookie();
  if (!userId) return null;

  await ensureDatabase(prisma);
  const actor = await prisma.user.findUnique({ where: { id: userId } });
  if (!actor) return null;

  const billing = actor.ownerUserId
    ? await prisma.user.findUnique({ where: { id: actor.ownerUserId } })
    : actor;
  if (!billing) return null;

  const billed = await resetMonthIfNeeded(billing);
  const plan: PlanId = isPlanId(billed.plan) ? billed.plan : "free";

  return {
    id: actor.id,
    email: actor.email,
    name: actor.name,
    plan,
    planInterval: billed.planInterval,
    overlayToken: billed.overlayToken,
    liveVideoId: billed.liveVideoId,
    videosUsedMonth: billed.videosUsedMonth,
    ideasUsedMonth: billed.ideasUsedMonth,
    scriptsUsedMonth: billed.scriptsUsedMonth,
    usageMonth: billed.usageMonth,
    limits: PLAN_LIMITS[plan],
    role: actor.ownerUserId ? "membro" : "criador",
    billingOwnerId: billed.id,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("UNAUTHORIZED");
    err.name = "UNAUTHORIZED";
    throw err;
  }
  return user;
}
