import { NextRequest, NextResponse } from "next/server";
import { jsonError, requirePlan, withUser } from "@/lib/api";
import { summarizeComments } from "@/lib/openai";
import type { Comment } from "@/types";

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const gated = requirePlan(user, "pro");
  if (gated) return gated;

  const body = (await req.json().catch(() => ({}))) as { comments?: Comment[] };
  if (!body.comments?.length) return jsonError("Nenhum comentário para analisar.");

  try {
    const result = await summarizeComments(body.comments);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha no resumo.";
    return jsonError(message, 502);
  }
}
