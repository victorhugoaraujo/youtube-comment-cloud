import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requirePlan, withUser } from "@/lib/api";
import { fetchVideoMeta, parseVideoId } from "@/lib/youtube";

export async function GET() {
  const { user, error } = await withUser();
  if (error) return error;
  const channels = await prisma.channel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ channels, max: user.limits.maxChannels });
}

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const gated = requirePlan(user, "business");
  if (gated) return gated;

  const count = await prisma.channel.count({ where: { userId: user.id } });
  if (count >= user.limits.maxChannels) {
    return jsonError("Limite de 10 canais no plano Business.", 402);
  }

  const body = (await req.json().catch(() => ({}))) as { url?: string };
  const videoId = parseVideoId(body.url || "");
  if (!videoId) return jsonError("Cole a URL de um vídeo do canal.");

  try {
    const meta = await fetchVideoMeta(videoId);
    const channel = await prisma.channel.create({
      data: {
        userId: user.id,
        youtubeId: meta.video.channelId || meta.video.channelName,
        title: meta.video.channelName,
        thumbnail: meta.video.channelAvatar,
      },
    });
    return NextResponse.json({ channel });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao adicionar canal.";
    return jsonError(message, 502);
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("Informe o id.");
  await prisma.channel.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
