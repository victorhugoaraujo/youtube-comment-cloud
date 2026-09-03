"use client";

import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface VideoInputProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
  analyzed: boolean;
  placeholder?: string;
  defaultValue?: string;
  buttonLabel?: string;
  loadingLabel?: string;
}

export function VideoInput({
  onAnalyze,
  loading,
  analyzed,
  placeholder = "Cole a URL do vídeo do YouTube...",
  defaultValue = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  buttonLabel = "Analisar comentários",
  loadingLabel = "Analisando...",
}: VideoInputProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("url") as HTMLInputElement;
    onAnalyze(input.value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="url"
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="pl-10"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading} className="shrink-0">
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          buttonLabel
        )}
      </Button>
      {analyzed && (
        <Badge variant="secondary" className="self-center sm:hidden">
          Modo demo
        </Badge>
      )}
    </form>
  );
}
