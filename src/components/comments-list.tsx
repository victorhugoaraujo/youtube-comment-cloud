import { MessageSquareOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommentCard } from "@/components/comment-card";
import type { Comment } from "@/types";

interface CommentsListProps {
  comments: Comment[];
}

export function CommentsList({ comments }: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-muted-foreground">
        <MessageSquareOff className="size-10 opacity-40" />
        <p className="text-sm">
          Nenhum comentário encontrado. Confira os filtros ou se o vídeo tem comentários públicos.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-xl border">
      <div className="space-y-2 p-3">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </ScrollArea>
  );
}
