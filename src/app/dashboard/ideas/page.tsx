"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ScriptDocument } from "@/components/script-document";
import { api } from "@/lib/client";
import type { VideoScript } from "@/lib/openai";

interface Saved {
  id: string;
  title: string;
  ideaTitle: string;
  createdAt: string;
  content: VideoScript;
}

export default function IdeasPage() {
  const [scripts, setScripts] = useState<Saved[]>([]);

  useEffect(() => {
    api<{ scripts: Saved[] }>("/api/scripts")
      .then((d) => setScripts(d.scripts))
      .catch((e) => toast.error(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ideias e roteiros</h1>
      <p className="text-muted-foreground">
        Roteiro completo para ler na câmera, gerado a partir dos comentários. Não é só o gancho.
      </p>
      {scripts.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum roteiro ainda.</p>
      )}
      <div className="space-y-6">
        {scripts.map((s) => (
          <article key={s.id} className="rounded-xl border p-4">
            <p className="mb-3 text-xs text-muted-foreground">A partir de: {s.ideaTitle}</p>
            {s.content ? (
              <ScriptDocument script={s.content} />
            ) : (
              <p className="text-sm">{s.title}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
