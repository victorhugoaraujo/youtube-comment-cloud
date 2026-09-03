"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/client";

interface Saved {
  id: string;
  title: string;
  scheduledFor: string | null;
}

export default function CalendarPage() {
  const [scripts, setScripts] = useState<Saved[]>([]);

  async function load() {
    const data = await api<{ scripts: Saved[] }>("/api/scripts");
    setScripts(data.scripts);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Calendário editorial</h1>
      <p className="text-muted-foreground">
        Agende roteiros gerados a partir dos comentários. Exclusivo Business.
      </p>
      {scripts.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <p className="flex-1 font-medium">{s.title}</p>
          <Input
            type="date"
            className="w-40"
            defaultValue={s.scheduledFor ? s.scheduledFor.slice(0, 10) : ""}
            onChange={async (e) => {
              try {
                await api("/api/scripts/schedule", {
                  method: "PATCH",
                  body: JSON.stringify({
                    id: s.id,
                    scheduledFor: e.target.value || null,
                  }),
                });
                toast.success("Data salva");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Upgrade para Business");
              }
            }}
          />
        </div>
      ))}
    </div>
  );
}
