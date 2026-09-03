"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  MessageCircleQuestion,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Users,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { VideoInput } from "@/components/video-input";
import { LiveWordCloud } from "@/components/live-word-cloud";
import { LiveChatFeed } from "@/components/live-chat-feed";
import { LiveQuestions } from "@/components/live-questions";
import { LiveRecap } from "@/components/live-recap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveChatSimulation } from "@/hooks/use-live-chat";

export function LiveAnalyzer() {
  const liveChat = useLiveChatSimulation();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Nuvem de palavras da live
          </h2>
          <p className="text-muted-foreground">
            Conecte o chat de uma transmissão e veja, em tempo quase real, o que
            a audiência está repetindo — perguntas, picos de assunto e um recap
            no encerramento.
          </p>
        </section>

        {!liveChat.connected && (
          <VideoInput
            onAnalyze={() => liveChat.connect()}
            loading={liveChat.connecting}
            analyzed={false}
            placeholder="Cole a URL da live do YouTube..."
            defaultValue="https://www.youtube.com/watch?v=live-2026-qa"
            buttonLabel="Conectar ao chat"
            loadingLabel="Conectando..."
          />
        )}

        {liveChat.connecting && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Conectando ao chat da live...
            </p>
          </div>
        )}

        {liveChat.connected && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
              <img
                src={liveChat.live.thumbnailUrl}
                alt={liveChat.live.title}
                className="aspect-video w-full rounded-lg object-cover sm:w-48"
              />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {liveChat.ended ? (
                    <Badge variant="secondary">Live encerrada</Badge>
                  ) : (
                    <Badge className="gap-1 bg-red-600 hover:bg-red-600">
                      <span className="size-1.5 animate-pulse rounded-full bg-white" />
                      AO VIVO
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {liveChat.cursor}/{liveChat.total} mensagens
                  </span>
                </div>
                <h3 className="font-semibold leading-snug">
                  {liveChat.live.title}
                </h3>
                <div className="flex items-center gap-2">
                  <img
                    src={liveChat.live.channelAvatar}
                    alt=""
                    className="size-6 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {liveChat.live.channelName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {liveChat.playing ? (
                    <Button size="sm" variant="outline" onClick={liveChat.pause}>
                      <Pause className="size-3.5" />
                      Pausar
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={liveChat.ended ? liveChat.reset : liveChat.resume}
                    >
                      {liveChat.ended ? (
                        <>
                          <RotateCcw className="size-3.5" />
                          Nova simulação
                        </>
                      ) : (
                        <>
                          <Play className="size-3.5" />
                          Continuar
                        </>
                      )}
                    </Button>
                  )}
                  <div className="flex overflow-hidden rounded-md border">
                    {([1, 2, 3] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => liveChat.setSpeed(s)}
                        className={`px-2.5 py-1.5 text-xs font-medium ${
                          liveChat.speed === s
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                  <Link
                    href="/live/overlay"
                    target="_blank"
                    className="inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
                  >
                    <ExternalLink className="size-3.5" />
                    Overlay OBS
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={liveChat.reset}
                  >
                    <RotateCcw className="size-3.5" />
                    Desconectar
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Eye className="size-4" />}
                label="Assistindo agora"
                value={liveChat.viewerCount.toLocaleString("pt-BR")}
              />
              <StatCard
                icon={<Radio className="size-4" />}
                label="Mensagens"
                value={String(liveChat.messages.length)}
              />
              <StatCard
                icon={<Users className="size-4" />}
                label="Pessoas no chat"
                value={String(liveChat.uniqueAuthors)}
              />
              <StatCard
                icon={<MessageCircleQuestion className="size-4" />}
                label="Perguntas"
                value={String(
                  liveChat.messages.filter((m) => m.isQuestion).length
                )}
              />
            </div>

            {liveChat.trending.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Em alta agora
                </span>
                {liveChat.trending.map((w) => (
                  <Badge key={w.word} className="bg-red-600 hover:bg-red-600">
                    {w.word}
                  </Badge>
                ))}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-5">
              <div className="space-y-4 lg:col-span-3">
                <LiveWordCloud
                  words={liveChat.words}
                  trending={liveChat.trending}
                />
                <LiveQuestions questions={liveChat.questions} />
              </div>
              <div className="lg:col-span-2">
                <LiveChatFeed messages={liveChat.messages} />
              </div>
            </div>

            {(liveChat.ended || liveChat.recapBlocks.length > 1) && (
              <LiveRecap blocks={liveChat.recapBlocks} />
            )}
          </div>
        )}

        {!liveChat.connected && !liveChat.connecting && (
          <div className="rounded-xl border border-dashed py-20 text-center">
            <Radio className="mx-auto mb-4 size-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Cole a URL de uma live e clique em &quot;Conectar ao chat&quot; para
              ver a nuvem atualizar em tempo real.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              Chat simulado — nenhuma API do YouTube é chamada nesta POC.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        CommentIQ POC — nuvem de lives com chat mockado · Overlay em{" "}
        <Link href="/live/overlay" className="underline">
          /live/overlay
        </Link>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
