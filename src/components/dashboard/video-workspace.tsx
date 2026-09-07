"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VideoInput } from "@/components/video-input";
import { FiltersBar } from "@/components/filters-bar";
import { CommentsList } from "@/components/comments-list";
import { StatsPanel } from "@/components/stats-panel";
import { WordCloud } from "@/components/word-cloud";
import { DEFAULT_FILTERS, filterComments, computeStats } from "@/lib/filters";
import { extractWordFrequencies } from "@/lib/word-cloud";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import type { Comment, CommentFilters, VideoInfo } from "@/types";
import type { VideoIdea, VideoScript } from "@/lib/openai";

export function VideoWorkspace({
  user,
  youtubeReady,
}: {
  user: SessionUser;
  youtubeReady: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"youtube" | "demo" | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filters, setFilters] = useState<CommentFilters>(DEFAULT_FILTERS);
  const [summary, setSummary] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  const [script, setScript] = useState<VideoScript | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => filterComments(comments, filters), [comments, filters]);
  const stats = useMemo(() => computeStats(comments, filtered), [comments, filtered]);
  const words = useMemo(() => extractWordFrequencies(filtered), [filtered]);

  async function handleAnalyze(url: string) {
    setLoading(true);
    setSummary(null);
    setIdeas([]);
    setScript(null);
    try {
      const data = await api<{
        analysisId: string | null;
        video: VideoInfo;
        comments: Comment[];
        source: "youtube" | "demo";
        truncated?: boolean;
      }>("/api/comments", { method: "POST", body: JSON.stringify({ url }) });
      setAnalysisId(data.analysisId);
      setVideo(data.video);
      setComments(data.comments);
      setSource(data.source);
      setFilters(DEFAULT_FILTERS);
      if (data.source === "demo") {
        toast.message("YouTube API sem chave na Vercel — usando comentários de demonstração.");
      } else if (data.comments.length === 0) {
        toast.message("Vídeo encontrado, mas não há comentários públicos.");
      } else {
        toast.success(
          data.truncated
            ? `Comentários reais carregados (limite do plano: ${data.comments.length}).`
            : `${data.comments.length} comentários reais de “${data.video.title}”.`,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao analisar");
    } finally {
      setLoading(false);
    }
  }

  async function runSummary() {
    if (!user.limits.aiSummary) return toast.error("Resumo AI entra no plano Pro.");
    setBusy("summary");
    try {
      const data = await api<{ summary: string }>("/api/analysis", {
        method: "POST",
        body: JSON.stringify({ comments: filtered.length ? filtered : comments }),
      });
      setSummary(data.summary);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no resumo");
    } finally {
      setBusy(null);
    }
  }

  async function runIdeas() {
    if (!user.limits.aiIdeas) return toast.error("Ideias entram no plano Pro.");
    setBusy("ideas");
    try {
      const data = await api<{ ideas: VideoIdea[]; source?: string }>("/api/ideas", {
        method: "POST",
        body: JSON.stringify({ comments, videoTitle: video?.title }),
      });
      setIdeas(data.ideas);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha nas ideias");
    } finally {
      setBusy(null);
    }
  }

  async function runScript(idea: VideoIdea) {
    setBusy("script");
    try {
      const data = await api<{ script: VideoScript }>("/api/scripts", {
        method: "POST",
        body: JSON.stringify({ idea, analysisId }),
      });
      setScript(data.script);
      toast.success("Roteiro gerado e salvo no calendário.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no roteiro");
    } finally {
      setBusy(null);
    }
  }

  async function exportFile(format: "csv" | "pdf") {
    if (!user.limits.export) return toast.error("Exportação entra no plano Pro.");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          title: video?.title ?? "comentarios",
          comments: filtered,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao exportar");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `commentiq.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao exportar");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analisar comentários</h1>
        <p className="text-muted-foreground">
          Cole a URL de um vídeo público do YouTube com comentários ligados.
        </p>
      </div>

      {!youtubeReady && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          A YouTube Data API não está ligada neste deploy. Sem{" "}
          <code className="rounded bg-muted px-1">YOUTUBE_API_KEY</code> na Vercel (Production) o
          CommentIQ usa um dataset de demo. Adicione a chave, faça Redeploy e cole a URL de novo.
        </div>
      )}

      {youtubeReady && (
        <div className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          YouTube API ligada. Cole qualquer vídeo público — Shorts, lives gravadas ou VOD. Lives
          ao vivo com chat ficam em{" "}
          <Link href="/dashboard/live" className="underline">
            Nuvem da live
          </Link>
          .
        </div>
      )}

      <VideoInput
        onAnalyze={handleAnalyze}
        loading={loading}
        analyzed={Boolean(video)}
        source={source}
        placeholder="https://www.youtube.com/watch?v=..."
      />

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Buscando comentários...</p>
        </div>
      )}

      {video && !loading && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row">
            <img
              src={video.thumbnailUrl}
              alt=""
              className="aspect-video w-full rounded-lg object-cover sm:w-48"
            />
            <div className="flex flex-1 flex-col justify-center gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{source === "youtube" ? "YouTube API" : "Demo"}</Badge>
                {user.plan === "free" && (
                  <Badge variant="outline">
                    {user.videosUsedMonth + 1}/{user.limits.videosPerMonth} vídeos no mês
                  </Badge>
                )}
              </div>
              <h2 className="font-semibold">{video.title}</h2>
              <p className="text-sm text-muted-foreground">{video.channelName}</p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-4" />
                  {video.viewCount.toLocaleString("pt-BR")} views
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-4" />
                  {comments.length.toLocaleString("pt-BR")} analisados
                  {video.commentCount > comments.length
                    ? ` · ${video.commentCount.toLocaleString("pt-BR")} no YouTube`
                    : " comentários"}
                </span>
              </div>
              {video.commentCount > comments.length && (
                <p className="text-xs text-muted-foreground">
                  O YouTube soma respostas no total. Puxamos o primeiro nível e as respostas que a
                  API enviou, até {user.limits.commentsPerVideo.toLocaleString("pt-BR")} no plano.
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={runSummary} disabled={busy === "summary"}>
                  <Sparkles className="size-3.5" />
                  Resumo AI
                </Button>
                <Button size="sm" variant="outline" onClick={runIdeas} disabled={busy === "ideas"}>
                  Gerar ideias de vídeo
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportFile("csv")}>
                  <Download className="size-3.5" />
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => exportFile("pdf")}>
                  PDF
                </Button>
                {user.plan === "free" && (
                  <Link href="/pricing" className={cn(buttonVariants({ size: "sm" }))}>
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>

          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo da audiência</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{summary}</p>
              </CardContent>
            </Card>
          )}

          {ideas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ideias de próximos vídeos</CardTitle>
                <p className="text-xs font-normal text-muted-foreground">
                  Extraídas dos comentários (perguntas e pedidos), não do tema do vídeo atual.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {ideas.map((idea) => (
                  <div key={idea.id} className="rounded-lg border p-3">
                    <p className="font-medium">{idea.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{idea.reason}</p>
                    {idea.sampleComments?.length > 0 && (
                      <ul className="mt-2 space-y-1 border-l-2 border-muted pl-3 text-xs text-muted-foreground">
                        {idea.sampleComments.slice(0, 3).map((sample, index) => (
                          <li key={`${idea.id}-${index}`}>“{sample}”</li>
                        ))}
                      </ul>
                    )}
                    <Button
                      size="sm"
                      className="mt-3"
                      variant="outline"
                      onClick={() => runScript(idea)}
                      disabled={busy === "script"}
                    >
                      Gerar roteiro
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {script && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Roteiro: {script.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">Gancho: </span>
                  {script.hook}
                </p>
                {script.sections.map((s) => (
                  <div key={s.heading}>
                    <p className="font-medium">
                      {s.heading}{" "}
                      <span className="font-normal text-muted-foreground">{s.duration}</span>
                    </p>
                    <ul className="ml-4 list-disc text-muted-foreground">
                      {s.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p>
                  <span className="font-medium">CTA: </span>
                  {script.cta}
                </p>
                {script.variations && (
                  <div>
                    <p className="font-medium">Variações</p>
                    {script.variations.map((v) => (
                      <p key={v.angle} className="text-muted-foreground">
                        {v.angle}: {v.title}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <StatsPanel stats={stats} youtubeTotal={video.commentCount} />
          <WordCloud words={words} />
          <FiltersBar filters={filters} onChange={setFilters} resultCount={filtered.length} />
          <CommentsList comments={filtered} />
        </div>
      )}
    </div>
  );
}
