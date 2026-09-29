import {
  MessageSquare,
  ThumbsUp,
  MessageCircleQuestion,
  Reply,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Ban,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CommentStats } from "@/types";

interface StatsPanelProps {
  stats: CommentStats;
  youtubeTotal?: number;
  ingestedCount?: number;
}

export function StatsPanel({ stats, youtubeTotal, ingestedCount }: StatsPanelProps) {
  const total = stats.filtered || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const ingested = ingestedCount ?? stats.total;

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
          <p className="text-2xl font-bold">{ingested.toLocaleString("pt-BR")}</p>
          <p className="text-xs text-muted-foreground">
            nesta Análise
            {typeof youtubeTotal === "number"
              ? ` · ${youtubeTotal.toLocaleString("pt-BR")} no YouTube`
              : ""}
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
          <CardTitle className="text-sm font-medium">Sentimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["positive", "Positivo", "text-emerald-600 dark:text-emerald-400", "[&>div]:bg-emerald-500", TrendingUp],
              ["negative", "Negativo", "text-red-600 dark:text-red-400", "[&>div]:bg-red-500", TrendingDown],
              ["question", "Pergunta", "text-sky-600 dark:text-sky-400", "[&>div]:bg-sky-500", HelpCircle],
              ["spam", "Spam", "text-zinc-500", "[&>div]:bg-zinc-400", Ban],
            ] as const
          ).map(([key, label, color, bar, Icon]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={`inline-flex items-center gap-1.5 ${color}`}>
                  <Icon className="size-4" />
                  {label}
                </span>
                <span className="font-medium">
                  {stats.sentimentBreakdown[key]} ({pct(stats.sentimentBreakdown[key])}%)
                </span>
              </div>
              <Progress value={pct(stats.sentimentBreakdown[key])} className={`h-2 ${bar}`} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
