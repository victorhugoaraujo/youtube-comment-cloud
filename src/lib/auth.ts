import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { currentUsageMonth, isPlanId, type PlanId } from "@/lib/plans";
import { ensureDatabase } from "@/lib/ensure-database";
import type { PlanLimits } from "@/lib/plans";
import { PLAN_LIMITS } from "@/lib/plans";

const COOKIE = "commentiq_session";

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
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function readUserIdFromCookie(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await readUserIdFromCookie();
  if (!userId) return null;

  await ensureDatabase(prisma);
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const month = currentUsageMonth();
  if (user.usageMonth !== month) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        usageMonth: month,
        videosUsedMonth: 0,
        ideasUsedMonth: 0,
        scriptsUsedMonth: 0,
      },
    });
  }

  const plan: PlanId = isPlanId(user.plan) ? user.plan : "free";

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan,
    planInterval: user.planInterval,
    overlayToken: user.overlayToken,
    liveVideoId: user.liveVideoId,
    videosUsedMonth: user.videosUsedMonth,
    ideasUsedMonth: user.ideasUsedMonth,
    scriptsUsedMonth: user.scriptsUsedMonth,
    usageMonth: user.usageMonth,
    limits: PLAN_LIMITS[plan],
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
