"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAN_PRICES } from "@/lib/plans";
import { api } from "@/lib/client";
import type { PlanId, PlanInterval } from "@/lib/plans";

const PLANS: Array<{
  id: PlanId;
  name: string;
  blurb: string;
  features: string[];
}> = [
  {
    id: "free",
    name: "Free",
    blurb: "Para testar com vídeos pontuais.",
    features: [
      "5 vídeos por mês",
      "Até 500 comentários",
      "Filtros, sentimento e nuvem VOD",
      "Detecção de perguntas",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Para quem publica toda semana.",
    features: [
      "Vídeos ilimitados",
      "Todos os comentários (até 5 mil)",
      "Lives: nuvem ao vivo + recap",
      "Resumo AI, ideias e 5 roteiros/mês",
      "Spam/haters e exportação CSV/PDF",
      "Histórico de 30 dias",
    ],
  },
  {
    id: "business",
    name: "Business",
    blurb: "Para studios e multi-canais.",
    features: [
      "Tudo do Pro",
      "Overlay OBS da nuvem",
      "Até 10 canais",
      "Comparar vídeos",
      "Calendário editorial",
      "Roteiros ilimitados + variações",
      "Histórico ilimitado",
    ],
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<PlanInterval>("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(plan: PlanId) {
    if (plan === "free") {
      window.location.href = "/register";
      return;
    }
    setLoading(plan);
    try {
      const res = await api<{ url: string }>("/api/billing", {
        method: "POST",
        body: JSON.stringify({ action: "checkout", plan, interval }),
      });
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Faça login para assinar.");
      window.location.href = `/login?next=/pricing`;
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-3xl font-bold">Planos mensais e anuais</h1>
        <p className="mt-2 text-muted-foreground">
          No anual você paga 10 meses e leva 12.
        </p>

        <div className="mt-6 inline-flex rounded-full border p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm",
              interval === "monthly" && "bg-primary text-primary-foreground"
            )}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm",
              interval === "yearly" && "bg-primary text-primary-foreground"
            )}
          >
            Anual
          </button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => {
            const price =
              p.id === "free"
                ? "R$ 0"
                : interval === "monthly"
                  ? `R$ ${PLAN_PRICES[p.id].monthly}/mês`
                  : `R$ ${PLAN_PRICES[p.id].yearly}/ano`;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-6",
                  p.id === "pro" && "border-red-600 shadow-sm"
                )}
              >
                {p.id === "pro" && (
                  <p className="mb-2 text-xs font-semibold text-red-600">Mais escolhido</p>
                )}
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="text-sm text-muted-foreground">{p.blurb}</p>
                <p className="mt-4 text-3xl font-bold">{price}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-muted-foreground">
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <Button
                  className="mt-6"
                  variant={p.id === "pro" ? "default" : "outline"}
                  disabled={loading === p.id}
                  onClick={() => checkout(p.id)}
                >
                  {p.id === "free" ? "Criar conta" : "Assinar"}
                </Button>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Sem chave Stripe, o checkout ativa o plano localmente para desenvolvimento.{" "}
          <Link href="/login" className="underline">
            Já tem conta?
          </Link>
        </p>
      </main>
    </div>
  );
}
