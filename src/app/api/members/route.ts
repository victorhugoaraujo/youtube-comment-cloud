import { NextRequest, NextResponse } from "next/server";
import { jsonError, withUser } from "@/lib/api";
import { AnaliseHttpError } from "@/lib/video-alvo";
import { inviteMembro, listMembros, revokeMembro, assertCanManageMembros } from "@/lib/members";

export async function GET() {
  const { user, error } = await withUser();
  if (error) return error;
  try {
    assertCanManageMembros(user);
    const data = await listMembros(user.id);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AnaliseHttpError) return jsonError(error.message, error.status);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  try {
    const result = await inviteMembro(user, body.email || "");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AnaliseHttpError) return jsonError(error.message, error.status);
    throw error;
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("Informe o id.");
  try {
    await revokeMembro(user, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AnaliseHttpError) return jsonError(error.message, error.status);
    throw error;
  }
}
