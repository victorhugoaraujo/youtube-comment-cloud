import { ThumbsUp, MessageSquare, Reply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { sentimentLabel } from "@/lib/sentiment";
import type { Comment } from "@/types";

interface CommentCardProps {
  comment: Comment;
}

const SENTIMENT_STYLES = {
  positive: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  negative: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
} as const;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <article className="flex gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
      <img
        src={comment.authorAvatar}
        alt={comment.author}
        className="size-10 shrink-0 rounded-full bg-muted"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{comment.author}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.publishedAt)}
          </span>
          <Badge
            variant="secondary"
            className={`text-[10px] ${SENTIMENT_STYLES[comment.sentiment]}`}
          >
            {sentimentLabel(comment.sentiment)}
          </Badge>
          {comment.authorReplied && (
            <Badge variant="outline" className="text-[10px]">
              <Reply className="mr-1 size-3" />
              Autor respondeu
            </Badge>
          )}
        </div>
        <p className="text-sm leading-relaxed">{comment.text}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="size-3.5" />
            {comment.likes.toLocaleString("pt-BR")}
          </span>
          {comment.replyCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {comment.replyCount} respostas
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
