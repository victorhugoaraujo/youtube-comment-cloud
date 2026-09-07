"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Radio, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoInput } from "@/components/video-input";
import { LiveWordCloud } from "@/components/live-word-cloud";
import { LiveChatFeed } from "@/components/live-chat-feed";
import { LiveQuestions } from "@/components/live-questions";
import { LiveRecap } from "@/components/live-recap";
import { extractWordFrequenciesFromTexts, trendingWords } from "@/lib/word-cloud";
import { api } from "@/lib/client";
import type { SessionUser } from "@/lib/auth";
import type { LiveChatMessage } from "@/types";
import type { RecapBlock } from "@/hooks/use-live-chat";

interface LiveMsg {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  isQuestion: boolean;
  isSuperChat: boolean;
  superChatAmount?: string;
}

export function LiveWorkspace({
  user,
  youtubeReady,
}: {
  user: SessionUser;
  youtubeReady: boolean;
}) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState<LiveMsg[]>([]);
  const [overlayUrl, setOverlayUrl] = useState("");
  const [source, setSource] = useState<"youtube" | "demo">("demo");
  const cursor = useRef(0);
  const pageToken = useRef<string | null>(null);
  const videoId = useRef("");
  const timer = useRef<number | null>(null);

  const liveMessages: LiveChatMessage[] = messages.map((m, i) => ({
    ...m,
    block: Math.min(5, Math.floor(i / 10)),
  }));

  const words = useMemo(
    () => extractWordFrequenciesFromTexts(messages.map((m) => m.text), 36),
    [messages]
  );
  const trending = useMemo(
    () =>
      trendingWords(
        messages.slice(-20).map((m) => m.text),
        messages.map((m) => m.text),
        5
      ),
    [messages]
  );
  const questions = useMemo(
    () => liveMessages.filter((m) => m.isQuestion).slice(-8).reverse(),
    [liveMessages]
  );
  const recap: RecapBlock[] = useMemo(() => {
    const map = new Map<number, LiveChatMessage[]>();
    for (const m of liveMessages) {
      const list = map.get(m.block) ?? [];
      list.push(m);
      map.set(m.block, list);
    }
    return Array.from(map.entries()).map(([block, list]) => ({
      block,
      messageCount: list.length,
      questionCount: list.filter((x) => x.isQuestion).length,
      topWords: extractWordFrequenciesFromTexts(
        list.map((x) => x.text),
        4
      ),
    }));
  }, [liveMessages]);

  function stop() {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  }

  async function poll() {
    try {
      const params = new URLSearchParams({
        videoId: videoId.current,
        cursor: String(cursor.current),
      });
      if (pageToken.current) params.set("pageToken", pageToken.current);
      const data = await api<{
        messages: LiveMsg[];
        video: { title: string };
        source: "youtube" | "demo";
        cursor?: number;
        ended?: boolean;
        nextPageToken?: string | null;
        pollingIntervalMillis?: number;
        overlayUrl?: string;
        offline?: boolean;
      }>(`/api/live-chat?${params.toString()}`);

      setSource(data.source);
      setTitle(data.video.title);
      if (data.overlayUrl) setOverlayUrl(data.overlayUrl);
      if (data.messages.length) {
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          return [...prev, ...data.messages.filter((m) => !ids.has(m.id))];
        });
      }
      if (typeof data.cursor === "number") cursor.current = data.cursor;
      if (data.nextPageToken) pageToken.current = data.nextPageToken;
      if (data.ended || data.offline) {
        setEnded(true);
        stop();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no chat");
      stop();
    }
  }

  async function connect(url: string) {
    if (!user.limits.liveChat) {
      toast.error("Lives entram no plano Pro.");
      return;
    }
    setConnecting(true);
    cursor.current = 0;
    pageToken.current = null;
    setMessages([]);
    setEnded(false);
    videoId.current = url;
    try {
      setConnected(true);
      setPlaying(true);
      await poll();
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    if (!playing || ended) return;
    timer.current = window.setInterval(() => {
      void poll();
    }, source === "demo" ? 800 : 5000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, ended, source]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuvem de palavras da live</h1>
        <p className="text-muted-foreground">
          Cole a URL de uma live que esteja no ar agora, com o chat ativo.
        </p>
      </div>

      {!youtubeReady && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          Sem <code className="rounded bg-muted px-1">YOUTUBE_API_KEY</code> na Vercel o chat é
          simulado. Para uma live de verdade, adicione a chave e faça Redeploy.
        </div>
      )}

      {!user.limits.liveChat && (
        <div className="rounded-xl border p-4 text-sm">
          Disponível no Pro. <a className="underline" href="/pricing">Ver planos</a>
        </div>
      )}

      <VideoInput
        onAnalyze={connect}
        loading={connecting}
        analyzed={connected}
        source={connected ? source : null}
        placeholder="https://www.youtube.com/watch?v=..."
        buttonLabel="Conectar ao chat"
        loadingLabel="Conectando..."
      />

      {connected && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {ended ? (
              <Badge variant="secondary">Encerrada / sem chat ativo</Badge>
            ) : (
              <Badge className="bg-red-600 hover:bg-red-600">AO VIVO</Badge>
            )}
            <span className="text-sm font-medium">{title}</span>
            <Badge variant="outline">{source === "youtube" ? "YouTube API" : "Demo"}</Badge>
            {playing ? (
              <Button size="sm" variant="outline" onClick={stop}>
                <Pause className="size-3.5" /> Pausar
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setPlaying(true)}>
                <Play className="size-3.5" /> Continuar
              </Button>
            )}
            {user.limits.overlay && overlayUrl && (
              <a
                className="text-sm underline"
                href={overlayUrl}
                target="_blank"
                rel="noreferrer"
              >
                Abrir overlay OBS
              </a>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                stop();
                setConnected(false);
                setMessages([]);
              }}
            >
              <RotateCcw className="size-3.5" /> Desconectar
            </Button>
          </div>

          {trending.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Em alta
              </span>
              {trending.map((w) => (
                <Badge key={w.word} className="bg-red-600 hover:bg-red-600">
                  {w.word}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <LiveWordCloud words={words} trending={trending} />
              <LiveQuestions questions={questions} />
            </div>
            <div className="lg:col-span-2">
              <LiveChatFeed messages={liveMessages} />
            </div>
          </div>
          <LiveRecap blocks={recap} />
        </div>
      )}

      {!connected && (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <Radio className="mx-auto mb-3 size-10 opacity-30" />
          Conecte uma live para ver a nuvem atualizar.
        </div>
      )}
    </div>
  );
}
