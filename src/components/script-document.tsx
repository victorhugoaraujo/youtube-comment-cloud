"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VideoScript } from "@/lib/openai";

function scriptAsText(script: VideoScript): string {
  const lines = [
    script.title,
    script.durationTarget ? `Duração alvo: ${script.durationTarget}` : "",
    "",
    "GANCHO",
    script.hook,
    script.intro ? `\nABERTURA\n${script.intro}` : "",
    "",
    ...(script.sections ?? []).flatMap((section) => [
      `${section.heading}${section.duration ? ` (${section.duration})` : ""}`,
      section.spoken || section.points.join("\n"),
      section.spoken && section.points.length
        ? `Tela: ${section.points.join(" · ")}`
        : "",
      "",
    ]),
    "CTA",
    script.cta,
    script.description ? `\nDESCRIÇÃO DO YOUTUBE\n${script.description}` : "",
  ];
  return lines.filter((line) => line !== "").join("\n");
}

export function ScriptDocument({ script }: { script: VideoScript }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(scriptAsText(script));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold leading-snug">{script.title}</p>
          {script.durationTarget && (
            <p className="text-xs text-muted-foreground">{script.durationTarget} · fala para câmera</p>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => void copy()}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar roteiro"}
        </Button>
      </div>

      {script.alternativeTitles?.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Títulos alternativos: {script.alternativeTitles.join(" · ")}
        </p>
      )}

      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gancho</p>
        <p className="leading-relaxed">{script.hook}</p>
      </section>

      {script.intro && (
        <section className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Abertura
          </p>
          <p className="leading-relaxed">{script.intro}</p>
        </section>
      )}

      {(script.sections ?? []).map((section) => (
        <section key={section.heading} className="space-y-2 rounded-lg border p-3">
          <p className="font-medium">
            {section.heading}{" "}
            {section.duration && (
              <span className="font-normal text-muted-foreground">{section.duration}</span>
            )}
          </p>
          {section.spoken ? (
            <p className="leading-relaxed whitespace-pre-wrap">{section.spoken}</p>
          ) : (
            <ul className="ml-4 list-disc text-muted-foreground">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
          {section.spoken && section.points.length > 0 && (
            <p className="text-xs text-muted-foreground">Tela: {section.points.join(" · ")}</p>
          )}
        </section>
      ))}

      <section className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CTA</p>
        <p className="leading-relaxed">{script.cta}</p>
      </section>

      {script.description && (
        <section className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Descrição do YouTube
          </p>
          <p className="whitespace-pre-wrap text-muted-foreground">{script.description}</p>
        </section>
      )}

      {script.sourceComments?.length > 0 && (
        <section className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Comentários usados
          </p>
          <ul className="space-y-1 border-l-2 border-muted pl-3 text-xs text-muted-foreground">
            {script.sourceComments.slice(0, 4).map((sample, index) => (
              <li key={`${script.title}-src-${index}`}>“{sample}”</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
