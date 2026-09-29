import { NextRequest, NextResponse } from "next/server";
import { jsonError, withUser } from "@/lib/api";
import { AnaliseHttpError, createAnalise } from "@/lib/analise";

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { url?: string };

  try {
    const result = await createAnalise({ actor: user, url: body.url || "" });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AnaliseHttpError) {
      return jsonError(error.message, error.status);
    }
    const message = error instanceof Error ? error.message : "Falha ao buscar comentários.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
