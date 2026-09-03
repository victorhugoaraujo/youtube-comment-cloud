import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { hasMinPlan, type PlanId } from "@/lib/plans";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withUser():
  Promise<
    | { user: SessionUser; error: null }
    | { user: null; error: NextResponse }
  > {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: jsonError("Faça login para continuar.", 401) };
  }
  return { user, error: null };
}

export function requirePlan(user: SessionUser, min: PlanId) {
  if (!hasMinPlan(user.plan, min)) {
    return jsonError(`Disponível a partir do plano ${min === "pro" ? "Pro" : "Business"}.`, 403);
  }
  return null;
}
