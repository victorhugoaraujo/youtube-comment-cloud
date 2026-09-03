import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, withUser } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  if (user.limits.historyDays === 0) {
    return NextResponse.json({ items: [], locked: true });
  }

  const since =
    user.limits.historyDays === null
      ? undefined
      : new Date(Date.now() - user.limits.historyDays * 86400000);

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const item = await prisma.analysis.findFirst({
      where: { id, userId: user.id },
    });
    if (!item) return jsonError("Análise não encontrada.", 404);
    return NextResponse.json({
      item: {
        ...item,
        stats: JSON.parse(item.statsJson),
        comments: JSON.parse(item.commentsJson),
      },
    });
  }

  const items = await prisma.analysis.findMany({
    where: {
      userId: user.id,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      kind: true,
      videoId: true,
      videoTitle: true,
      channelName: true,
      thumbnailUrl: true,
      commentCount: true,
      source: true,
      statsJson: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    items: items.map((i) => ({ ...i, stats: JSON.parse(i.statsJson) })),
  });
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("Informe o id.");
  await prisma.analysis.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
