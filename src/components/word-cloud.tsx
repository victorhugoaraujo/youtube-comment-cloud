import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WordFrequency } from "@/types";

interface WordCloudProps {
  words: WordFrequency[];
}

export function WordCloud({ words }: WordCloudProps) {
  if (words.length === 0) return null;

  const maxCount = words[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Palavras mais frequentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {words.map(({ word, count }) => {
            const scale = 0.75 + (count / maxCount) * 0.75;
            const opacity = 0.5 + (count / maxCount) * 0.5;

            return (
              <span
                key={word}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary transition-transform hover:scale-105"
                style={{ fontSize: `${scale}rem`, opacity }}
                title={`${count} ocorrências`}
              >
                {word}
                <span className="text-[10px] opacity-60">{count}</span>
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
