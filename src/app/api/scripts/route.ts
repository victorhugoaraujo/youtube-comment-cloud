import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, withUser } from "@/lib/api";
import { generateScript, type VideoIdea } from "@/lib/openai";

export async function GET() {
  const { user, error } = await withUser();
  if (error) return error;
  const scripts = await prisma.script.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    scripts: scripts.map((s) => ({
      ...s,
      content: JSON.parse(s.contentJson),
    })),
  });
}

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  if (user.limits.aiScripts === 0) {
    return jsonError("Roteiros AI entram no plano Pro.", 403);
  }
  if (user.limits.aiScripts !== null && user.scriptsUsedMonth >= user.limits.aiScripts) {
    return jsonError("Você usou os 5 roteiros deste mês.", 402);
  }

  const body = (await req.json().catch(() => ({}))) as {
    idea?: VideoIdea;
    analysisId?: string;
  };
  if (!body.idea?.title) return jsonError("Escolha uma ideia para gerar o roteiro.");

  try {
    const result = await generateScript(body.idea, user.limits.scriptVariations);
    await prisma.user.update({
      where: { id: user.id },
      data: { scriptsUsedMonth: { increment: 1 } },
    });
    const saved = await prisma.script.create({
      data: {
        userId: user.id,
        analysisId: body.analysisId,
        ideaTitle: body.idea.title,
        title: result.script.title,
        contentJson: JSON.stringify(result.script),
      },
    });
    return NextResponse.json({
      id: saved.id,
      ...result,
      remaining:
        user.limits.aiScripts === null
          ? null
          : user.limits.aiScripts - user.scriptsUsedMonth - 1,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao gerar roteiro.";
    return jsonError(message, 502);
  }
}
