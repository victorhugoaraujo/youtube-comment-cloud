"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/client";

interface Item {
  id: string;
  videoTitle: string;
  channelName: string;
  commentCount: number;
  createdAt: string;
  kind: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    api<{ items: Item[]; locked?: boolean }>("/api/history")
      .then((d) => {
        setItems(d.items);
        setLocked(Boolean(d.locked));
      })
      .catch((e) => toast.error(e.message));
  }, []);

  if (locked) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="mt-2 text-muted-foreground">
          O histórico de 30 dias entra no Pro.{" "}
          <a className="underline" href="/pricing">
            Fazer upgrade
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Histórico de análises</h1>
      {items.length === 0 && (
        <p className="text-muted-foreground">Nenhuma análise salva ainda.</p>
      )}
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{i.videoTitle}</p>
              <p className="text-xs text-muted-foreground">
                {i.channelName} · {i.commentCount} comentários ·{" "}
                {new Date(i.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                await api(`/api/history?id=${i.id}`, { method: "DELETE" });
                setItems((prev) => prev.filter((x) => x.id !== i.id));
              }}
            >
              Excluir
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
