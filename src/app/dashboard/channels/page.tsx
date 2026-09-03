"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/client";

interface Channel {
  id: string;
  title: string;
  youtubeId: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [max, setMax] = useState(10);

  async function load() {
    const data = await api<{ channels: Channel[]; max: number }>("/api/channels");
    setChannels(data.channels);
    setMax(data.max);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const url = String(new FormData(e.currentTarget).get("url") || "");
    try {
      await api("/api/channels", { method: "POST", body: JSON.stringify({ url }) });
      toast.success("Canal adicionado");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Canais</h1>
      <p className="text-muted-foreground">
        Até {max} canais no Business. Cole a URL de um vídeo do canal para cadastrá-lo.
      </p>
      <form onSubmit={add} className="flex gap-2">
        <Input name="url" placeholder="URL de um vídeo do canal" />
        <Button type="submit">Adicionar</Button>
      </form>
      {channels.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.youtubeId}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await api(`/api/channels?id=${c.id}`, { method: "DELETE" });
              setChannels((prev) => prev.filter((x) => x.id !== c.id));
            }}
          >
            Remover
          </Button>
        </div>
      ))}
    </div>
  );
}
