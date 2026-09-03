import Stripe from "stripe";
import { appUrl } from "@/lib/env";
import type { PlanId, PlanInterval } from "@/lib/plans";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function priceIdFor(plan: PlanId, interval: PlanInterval): string | null {
  if (plan === "free") return null;
  const map = {
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
    business: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY,
      yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
    },
  } as const;
  return map[plan][interval] || null;
}

export async function createCheckoutSession(opts: {
  userId: string;
  email: string;
  customerId?: string | null;
  plan: Exclude<PlanId, "free">;
  interval: PlanInterval;
}) {
  const stripe = getStripe();
  const price = priceIdFor(opts.plan, opts.interval);
  if (!stripe || !price) return null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: opts.customerId || undefined,
    customer_email: opts.customerId ? undefined : opts.email,
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl()}/dashboard?upgraded=1`,
    cancel_url: `${appUrl()}/pricing?canceled=1`,
    metadata: {
      userId: opts.userId,
      plan: opts.plan,
      interval: opts.interval,
    },
    subscription_data: {
      metadata: {
        userId: opts.userId,
        plan: opts.plan,
        interval: opts.interval,
      },
    },
  });

  return session.url;
}

export async function createPortalSession(customerId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/dashboard/account`,
  });
  return session.url;
}
