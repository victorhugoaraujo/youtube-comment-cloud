import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, withUser } from "@/lib/api";
import { parseVideoId, fetchComments } from "@/lib/youtube";
import { computeStats } from "@/lib/filters";
import { integrations } from "@/lib/env";

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { url?: string };
  const videoId = parseVideoId(body.url || "");
  if (!videoId) return jsonError("Cole uma URL ou ID válido de vídeo do YouTube.");

  if (
    user.limits.videosPerMonth !== null &&
    user.videosUsedMonth >= user.limits.videosPerMonth
  ) {
    return jsonError(
      "Você atingiu o limite de 5 vídeos neste mês no plano Free. Faça upgrade para o Pro.",
      402
    );
  }

  try {
    const result = await fetchComments(videoId, user.limits.commentsPerVideo);
    const stats = computeStats(result.comments, result.comments);

    await prisma.user.update({
      where: { id: user.id },
      data: { videosUsedMonth: { increment: 1 } },
    });

    let analysisId: string | null = null;
    if (user.limits.historyDays !== 0) {
      const saved = await prisma.analysis.create({
        data: {
          userId: user.id,
          kind: "vod",
          videoId: result.video.id,
          videoTitle: result.video.title,
          channelName: result.video.channelName,
          channelId: result.video.channelId,
          thumbnailUrl: result.video.thumbnailUrl,
          commentCount: result.comments.length,
          source: result.source,
          statsJson: JSON.stringify(stats),
          commentsJson: JSON.stringify(result.comments),
        },
      });
      analysisId = saved.id;
    }

    return NextResponse.json({
      analysisId,
      video: result.video,
      comments: result.comments,
      stats,
      source: result.source,
      truncated: result.truncated,
      integrations: integrations(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao buscar comentários.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
