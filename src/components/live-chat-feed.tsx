"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { LiveChatMessage } from "@/types";

interface LiveChatFeedProps {
  messages: LiveChatMessage[];
}

export function LiveChatFeed({ messages }: LiveChatFeedProps) {
  const reversed = [...messages].reverse();

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Chat ao vivo</h3>
        <Badge variant="outline">{messages.length} msgs</Badge>
      </div>
      <ScrollArea className="h-[420px]">
        <div className="flex flex-col gap-2 p-3">
          {reversed.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda.
            </p>
          )}
          {reversed.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 rounded-lg p-2 ${
                m.isSuperChat
                  ? "bg-amber-100 dark:bg-amber-950/60"
                  : "bg-muted/40"
              }`}
            >
              <img
                src={m.authorAvatar}
                alt=""
                className="size-7 shrink-0 rounded-full bg-muted"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium">{m.author}</span>
                  {m.isSuperChat && (
                    <Badge className="h-4 bg-amber-500 text-[10px] text-black hover:bg-amber-500">
                      Super Chat {m.superChatAmount}
                    </Badge>
                  )}
                  {m.isQuestion && !m.isSuperChat && (
                    <Badge variant="outline" className="h-4 text-[10px]">
                      Pergunta
                    </Badge>
                  )}
                </div>
                <p className="text-sm leading-snug">{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
