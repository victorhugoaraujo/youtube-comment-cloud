"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";

interface Hist {
  id: string;
  videoTitle: string;
  commentCount: number;
  stats: { sentimentBreakdown: Record<string, number> };
}

export default function ComparePage() {
  const [items, setItems] = useState<Hist[]>([]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<Hist[] | null>(null);

  useEffect(() => {
    api<{ items: Hist[] }>("/api/history")
      .then((d) => setItems(d.items as Hist[]))
      .catch((e) => toast.error(e.message));
  }, []);

  async function compare() {
    try {
      const data = await api<{ items: Hist[] }>(`/api/compare?a=${a}&b=${b}`);
      setResult(data.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Disponível no Business");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Comparar vídeos</h1>
      <p className="text-muted-foreground">
        Compare sentimento e volume entre duas análises salvas.
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={a}
          onChange={(e) => setA(e.target.value)}
        >
          <option value="">Análise A</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.videoTitle}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={b}
          onChange={(e) => setB(e.target.value)}
        >
          <option value="">Análise B</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.videoTitle}
            </option>
          ))}
        </select>
        <Button onClick={compare} disabled={!a || !b}>
          Comparar
        </Button>
      </div>
      {result && (
        <div className="grid gap-4 sm:grid-cols-2">
          {result.map((r) => (
            <div key={r.id} className="rounded-xl border p-4">
              <p className="font-semibold">{r.videoTitle}</p>
              <p className="text-sm text-muted-foreground">{r.commentCount} comentários</p>
              <p className="mt-2 text-sm">
                +{r.stats.sentimentBreakdown.positive} / −
                {r.stats.sentimentBreakdown.negative} / ~
                {r.stats.sentimentBreakdown.neutral}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
