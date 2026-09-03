import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requirePlan, withUser } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const gated = requirePlan(user, "business");
  if (gated) return gated;

  const a = req.nextUrl.searchParams.get("a");
  const b = req.nextUrl.searchParams.get("b");
  if (!a || !b) return jsonError("Escolha duas análises para comparar.");

  const items = await prisma.analysis.findMany({
    where: { userId: user.id, id: { in: [a, b] } },
  });
  if (items.length !== 2) return jsonError("Análises não encontradas.", 404);

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      videoTitle: i.videoTitle,
      channelName: i.channelName,
      thumbnailUrl: i.thumbnailUrl,
      commentCount: i.commentCount,
      createdAt: i.createdAt,
      stats: JSON.parse(i.statsJson),
    })),
  });
}
