import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, verifyPassword, getCurrentUser, clearSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { currentUsageMonth } from "@/lib/plans";

const creds = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const body = creds.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return jsonError("Email e senha inválidos.");

  if (action === "register") {
    const name = body.data.name?.trim() || body.data.email.split("@")[0];
    const exists = await prisma.user.findUnique({
      where: { email: body.data.email.toLowerCase() },
    });
    if (exists) return jsonError("Já existe uma conta com este email.");

    const user = await prisma.user.create({
      data: {
        email: body.data.email.toLowerCase(),
        name,
        passwordHash: await hashPassword(body.data.password),
        overlayToken: randomBytes(16).toString("hex"),
        usageMonth: currentUsageMonth(),
        plan: "free",
      },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.data.email.toLowerCase() },
  });
  if (!user || !(await verifyPassword(body.data.password, user.passwordHash))) {
    return jsonError("Email ou senha incorretos.", 401);
  }
  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Não autenticado.", 401);
  return NextResponse.json({ user });
}
