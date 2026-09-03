"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LiveWordCloud } from "@/components/live-word-cloud";
import { Badge } from "@/components/ui/badge";
import type { LiveSnapshot } from "@/lib/live-cache";

export default function OverlayPage() {
  const params = useParams<{ token: string }>();
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      const res = await fetch(`/api/overlay/${params.token}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) {
        setError(data.error || "Overlay indisponível");
        return;
      }
      setSnapshot(data.snapshot);
    }
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [params.token]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-8 text-center text-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black px-8 py-6 text-white">
      <div className="mb-4 flex items-center gap-3">
        <Badge className="bg-red-600 hover:bg-red-600">AO VIVO</Badge>
        <p className="text-sm text-white/80">{snapshot?.videoTitle ?? "Aguardando chat..."}</p>
      </div>
      {snapshot?.trending?.length ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {snapshot.trending.map((w) => (
            <span key={w.word} className="rounded-full bg-red-600 px-3 py-1 text-sm">
              {w.word}
            </span>
          ))}
        </div>
      ) : null}
      <LiveWordCloud
        words={snapshot?.words ?? []}
        trending={snapshot?.trending ?? []}
        variant="overlay"
        className="min-h-[70vh] flex-1"
      />
    </div>
  );
}
