"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/client";
import { PLAN_LABEL } from "@/lib/plans";
import type { SessionUser } from "@/lib/auth";

export function AccountClient({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function upgrade(plan: "pro" | "business") {
    setBusy(true);
    try {
      const res = await api<{ url: string }>("/api/billing", {
        method: "POST",
        body: JSON.stringify({ action: "checkout", plan, interval: "monthly" }),
      });
      window.location.href = res.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Conta</h1>
      <p>
        {user.name} · {user.email}
      </p>
      <p>
        Plano atual: <Badge>{PLAN_LABEL[user.plan]}</Badge>
      </p>
      <p className="text-sm text-muted-foreground">
        Uso no mês: {user.videosUsedMonth} vídeos · {user.ideasUsedMonth} ideias ·{" "}
        {user.scriptsUsedMonth} roteiros
      </p>
      {user.limits.overlay && (
        <p className="break-all text-sm">
          Overlay OBS:{" "}
          <a className="underline" href={`/overlay/${user.overlayToken}`} target="_blank">
            /overlay/{user.overlayToken}
          </a>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={() => upgrade("pro")}>
          Ativar Pro
        </Button>
        <Button disabled={busy} variant="outline" onClick={() => upgrade("business")}>
          Ativar Business
        </Button>
        <Button
          variant="ghost"
          onClick={async () => {
            await fetch("/api/auth", { method: "DELETE" });
            router.push("/");
          }}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
