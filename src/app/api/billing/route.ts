import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, withUser } from "@/lib/api";
import { createCheckoutSession, createPortalSession, getStripe } from "@/lib/stripe";
import { isPlanId, type PlanId, type PlanInterval } from "@/lib/plans";

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as {
    action?: "checkout" | "portal" | "dev-upgrade";
    plan?: string;
    interval?: PlanInterval;
  };

  if (body.action === "portal") {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.stripeCustomerId) {
      return jsonError("Nenhuma assinatura Stripe nesta conta.");
    }
    const url = await createPortalSession(dbUser.stripeCustomerId);
    if (!url) return jsonError("Stripe não configurado.");
    return NextResponse.json({ url });
  }

  const plan = body.plan && isPlanId(body.plan) ? (body.plan as PlanId) : null;
  const interval: PlanInterval = body.interval === "yearly" ? "yearly" : "monthly";
  if (!plan || plan === "free") return jsonError("Escolha Pro ou Business.");

  if (body.action === "dev-upgrade" || !getStripe()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan, planInterval: interval },
    });
    return NextResponse.json({
      url: "/dashboard?upgraded=1",
      mode: "local",
    });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const url = await createCheckoutSession({
    userId: user.id,
    email: user.email,
    customerId: dbUser?.stripeCustomerId,
    plan,
    interval,
  });
  if (!url) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan, planInterval: interval },
    });
    return NextResponse.json({
      url: "/dashboard?upgraded=1",
      mode: "local",
    });
  }
  return NextResponse.json({ url, mode: "stripe" });
}
