import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LIVE_BLOCK_LABELS } from "@/lib/mock-live";
import type { RecapBlock } from "@/hooks/use-live-chat";

interface LiveRecapProps {
  blocks: RecapBlock[];
}

export function LiveRecap({ blocks }: LiveRecapProps) {
  if (blocks.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Recap — palavras por bloco da live
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map((b) => (
            <div key={b.block} className="rounded-lg border p-3">
              <p className="text-sm font-semibold">
                {LIVE_BLOCK_LABELS[b.block] ?? `Bloco ${b.block + 1}`}
              </p>
              <p className="mb-2 text-xs text-muted-foreground">
                {b.messageCount} msgs · {b.questionCount} perguntas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {b.topWords.map((w) => (
                  <span
                    key={w.word}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {w.word} {w.count}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
