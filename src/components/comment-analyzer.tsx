"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, MessageSquare, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/app-header";
import { VideoInput } from "@/components/video-input";
import { FiltersBar } from "@/components/filters-bar";
import { CommentsList } from "@/components/comments-list";
import { StatsPanel } from "@/components/stats-panel";
import { WordCloud } from "@/components/word-cloud";
import { fetchMockComments } from "@/lib/mock-data";
import {
  DEFAULT_FILTERS,
  filterComments,
  computeStats,
} from "@/lib/filters";
import { extractWordFrequencies } from "@/lib/word-cloud";
import type { Comment, CommentFilters, VideoInfo } from "@/types";

export function CommentAnalyzer() {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filters, setFilters] = useState<CommentFilters>(DEFAULT_FILTERS);

  async function handleAnalyze(_url: string) {
    setLoading(true);
    try {
      const data = await fetchMockComments();
      setVideo(data.video);
      setComments(data.comments);
      setAnalyzed(true);
      setFilters(DEFAULT_FILTERS);
    } finally {
      setLoading(false);
    }
  }

  const filteredComments = useMemo(
    () => filterComments(comments, filters),
    [comments, filters]
  );

  const stats = useMemo(
    () => computeStats(comments, filteredComments),
    [comments, filteredComments]
  );

  const wordFrequencies = useMemo(
    () => extractWordFrequencies(filteredComments),
    [filteredComments]
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Analise os comentários do seu vídeo
          </h2>
          <p className="text-muted-foreground">
            Cole a URL de qualquer vídeo do YouTube para filtrar, ordenar e
            entender o feedback da sua audiência — sem precisar ler centenas de
            comentários manualmente.
          </p>
        </section>

        <Link
          href="/live"
          className="flex items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
            <Radio className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">Nuvem de palavras em lives</p>
              <Badge className="bg-red-600 hover:bg-red-600">Novo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Conecte o chat de uma live e veja os assuntos em alta, perguntas e
              o recap por bloco — overlay pronto para o OBS.
            </p>
          </div>
        </Link>

        <VideoInput
          onAnalyze={handleAnalyze}
          loading={loading}
          analyzed={analyzed}
        />

        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              Carregando comentários do vídeo...
            </p>
          </div>
        )}

        {analyzed && video && !loading && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="aspect-video w-full rounded-lg object-cover sm:w-48"
              />
              <div className="flex flex-1 flex-col justify-center gap-2">
                <h3 className="font-semibold leading-snug">{video.title}</h3>
                <div className="flex items-center gap-2">
                  <img
                    src={video.channelAvatar}
                    alt={video.channelName}
                    className="size-6 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {video.channelName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="size-4" />
                    {video.viewCount.toLocaleString("pt-BR")} views
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="size-4" />
                    {video.commentCount.toLocaleString("pt-BR")} comentários
                  </span>
                </div>
              </div>
            </div>

            <StatsPanel stats={stats} />

            <WordCloud words={wordFrequencies} />

            <FiltersBar
              filters={filters}
              onChange={setFilters}
              resultCount={filteredComments.length}
            />

            <CommentsList comments={filteredComments} />
          </div>
        )}

        {!analyzed && !loading && (
          <div className="rounded-xl border border-dashed py-20 text-center">
            <MessageSquare className="mx-auto mb-4 size-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Cole a URL de um vídeo e clique em &quot;Analisar comentários&quot; para
              começar.
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              Esta POC usa dados mockados — nenhuma API externa é necessária.
            </p>
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        CommentIQ POC — dados de demonstração · Plano SaaS completo em{" "}
        <code className="rounded bg-muted px-1 py-0.5">docs/PLAN.md</code>
      </footer>
    </div>
  );
}
