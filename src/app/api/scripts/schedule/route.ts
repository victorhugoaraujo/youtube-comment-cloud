import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requirePlan, withUser } from "@/lib/api";

export async function PATCH(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const gated = requirePlan(user, "business");
  if (gated) return gated;

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    scheduledFor?: string | null;
  };
  if (!body.id) return jsonError("Informe o roteiro.");

  const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
  const updated = await prisma.script.updateMany({
    where: { id: body.id, userId: user.id },
    data: { scheduledFor },
  });
  if (!updated.count) return jsonError("Roteiro não encontrado.", 404);
  return NextResponse.json({ ok: true });
}
