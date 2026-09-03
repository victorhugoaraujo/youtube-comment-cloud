import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLiveSnapshot } from "@/lib/live-cache";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;
  const user = await prisma.user.findUnique({
    where: { overlayToken: token },
    select: { plan: true, liveVideoId: true, overlayToken: true },
  });
  if (!user) return NextResponse.json({ error: "Overlay inválido." }, { status: 404 });
  if (user.plan !== "business") {
    return NextResponse.json(
      { error: "Overlay OBS é exclusivo do plano Business.", locked: true },
      { status: 403 }
    );
  }
  const snapshot = getLiveSnapshot(token);
  return NextResponse.json({ snapshot, liveVideoId: user.liveVideoId });
}
