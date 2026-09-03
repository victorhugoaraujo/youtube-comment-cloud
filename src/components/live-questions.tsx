import { MessageCircleQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LiveChatMessage } from "@/types";

interface LiveQuestionsProps {
  questions: LiveChatMessage[];
}

export function LiveQuestions({ questions }: LiveQuestionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <MessageCircleQuestion className="size-4" />
          Perguntas do chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma pergunta no recorte atual.
          </p>
        ) : (
          <ul className="space-y-3">
            {questions.map((q) => (
              <li key={q.id} className="flex gap-2">
                <img
                  src={q.authorAvatar}
                  alt=""
                  className="size-6 shrink-0 rounded-full bg-muted"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {q.author}
                  </p>
                  <p className="text-sm leading-snug">{q.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
