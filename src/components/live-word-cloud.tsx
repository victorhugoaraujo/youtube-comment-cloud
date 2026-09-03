"use client";

import { cn } from "@/lib/utils";
import type { WordFrequency } from "@/types";

interface LiveWordCloudProps {
  words: WordFrequency[];
  trending?: WordFrequency[];
  variant?: "default" | "overlay";
  className?: string;
}

export function LiveWordCloud({
  words,
  trending = [],
  variant = "default",
  className,
}: LiveWordCloudProps) {
  const overlay = variant === "overlay";
  const maxCount = words[0]?.count ?? 1;
  const hot = new Set(trending.map((t) => t.word));

  if (words.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-56 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground",
          overlay && "border-white/20 text-white/70",
          className
        )}
      >
        Aguardando mensagens do chat...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-56 flex-wrap content-center items-center justify-center gap-2 rounded-xl p-4",
        overlay ? "bg-transparent" : "border bg-card",
        className
      )}
    >
      {words.map(({ word, count }) => {
        const scale = 0.8 + (count / maxCount) * 1.6;
        const isHot = hot.has(word);

        return (
          <span
            key={word}
            className={cn(
              "inline-flex items-baseline gap-1 rounded-full px-3 py-1 font-semibold leading-none transition-all duration-500",
              overlay
                ? isHot
                  ? "bg-red-500/90 text-white shadow-lg shadow-red-500/40"
                  : "bg-white/10 text-white"
                : isHot
                  ? "bg-red-600 text-white"
                  : "bg-primary/10 text-primary"
            )}
            style={{ fontSize: `${scale}rem` }}
            title={`${count} menções`}
          >
            {word}
            <span
              className={cn(
                "text-[10px] font-medium",
                overlay ? "opacity-70" : "opacity-60"
              )}
            >
              {count}
            </span>
          </span>
        );
      })}
    </div>
  );
}
