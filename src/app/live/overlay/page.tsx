"use client";

import Link from "next/link";
import { LiveWordCloud } from "@/components/live-word-cloud";
import { Badge } from "@/components/ui/badge";
import { useLiveChatSimulation } from "@/hooks/use-live-chat";

export default function LiveOverlayPage() {
  const liveChat = useLiveChatSimulation({ autoStart: true, intervalMs: 550 });

  return (
    <div className="flex min-h-screen flex-col bg-black px-8 py-6 text-white">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {liveChat.ended ? (
            <Badge variant="secondary">ENCERRADA</Badge>
          ) : (
            <Badge className="gap-1.5 bg-red-600 px-3 py-1 text-sm hover:bg-red-600">
              <span className="size-2 animate-pulse rounded-full bg-white" />
              AO VIVO
            </Badge>
          )}
          <p className="text-sm font-medium text-white/80">
            {liveChat.live.title}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span>{liveChat.viewerCount.toLocaleString("pt-BR")} assistindo</span>
          <Link
            href="/live"
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>

      {liveChat.trending.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-red-400">
            Em alta
          </span>
          {liveChat.trending.map((w) => (
            <span
              key={w.word}
              className="rounded-full bg-red-600 px-3 py-1 text-sm font-semibold"
            >
              {w.word}
            </span>
          ))}
        </div>
      )}

      <LiveWordCloud
        words={liveChat.words}
        trending={liveChat.trending}
        variant="overlay"
        className="min-h-[70vh] flex-1"
      />

      <p className="mt-4 text-center text-xs text-white/40">
        Overlay CommentIQ · cole esta URL como Browser Source no OBS
      </p>
    </div>
  );
}
