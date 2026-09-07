import {
  MessageSquare,
  ThumbsUp,
  MessageCircleQuestion,
  Reply,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CommentStats } from "@/types";

interface StatsPanelProps {
  stats: CommentStats;
  youtubeTotal?: number;
}

export function StatsPanel({ stats, youtubeTotal }: StatsPanelProps) {
  const total = stats.filtered || 1;
  const positivePct = Math.round((stats.sentimentBreakdown.positive / total) * 100);
  const negativePct = Math.round((stats.sentimentBreakdown.negative / total) * 100);
  const neutralPct = Math.round((stats.sentimentBreakdown.neutral / total) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="size-4" />
            Comentários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.filtered.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">
            {youtubeTotal && youtubeTotal > stats.total
              ? `${stats.total.toLocaleString("pt-BR")} analisados · ${youtubeTotal.toLocaleString("pt-BR")} no YouTube`
              : `de ${stats.total.toLocaleString("pt-BR")} analisados`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ThumbsUp className="size-4" />
            Média de likes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.avgLikes}</p>
          <p className="text-xs text-muted-foreground">por comentário</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageCircleQuestion className="size-4" />
            Perguntas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.questionCount}</p>
          <p className="text-xs text-muted-foreground">aguardando resposta</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Reply className="size-4" />
            Você respondeu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.authorRepliedCount}</p>
          <p className="text-xs text-muted-foreground">
            de {stats.total} comentários
          </p>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Distribuição de sentimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-4" />
                Positivo
              </span>
              <span className="font-medium">
                {stats.sentimentBreakdown.positive} ({positivePct}%)
              </span>
            </div>
            <Progress value={positivePct} className="h-2 [&>div]:bg-emerald-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <TrendingDown className="size-4" />
                Negativo
              </span>
              <span className="font-medium">
                {stats.sentimentBreakdown.negative} ({negativePct}%)
              </span>
            </div>
            <Progress value={negativePct} className="h-2 [&>div]:bg-red-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1.5 text-zinc-500">
                <Minus className="size-4" />
                Neutro
              </span>
              <span className="font-medium">
                {stats.sentimentBreakdown.neutral} ({neutralPct}%)
              </span>
            </div>
            <Progress value={neutralPct} className="h-2 [&>div]:bg-zinc-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
