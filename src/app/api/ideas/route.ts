import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, withUser } from "@/lib/api";
import { generateIdeas } from "@/lib/openai";
import type { Comment } from "@/types";

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  if (user.limits.aiIdeas === 0) {
    return jsonError("Ideias de vídeo entram no plano Pro.", 403);
  }
  if (user.limits.aiIdeas !== null && user.ideasUsedMonth >= user.limits.aiIdeas) {
    return jsonError("Você usou as 5 gerações de ideias deste mês.", 402);
  }

  const body = (await req.json().catch(() => ({}))) as {
    comments?: Comment[];
    videoTitle?: string;
  };
  if (!body.comments?.length) return jsonError("Analise um vídeo antes de gerar ideias.");

  try {
    const result = await generateIdeas(body.comments, body.videoTitle);
    await prisma.user.update({
      where: { id: user.id },
      data: { ideasUsedMonth: { increment: 1 } },
    });
    return NextResponse.json({
      ...result,
      remaining:
        user.limits.aiIdeas === null
          ? null
          : user.limits.aiIdeas - user.ideasUsedMonth - 1,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao gerar ideias.";
    return jsonError(message, 502);
  }
}
