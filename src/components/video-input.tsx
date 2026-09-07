"use client";

import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface VideoInputProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
  analyzed: boolean;
  source?: "youtube" | "demo" | null;
  placeholder?: string;
  defaultValue?: string;
  buttonLabel?: string;
  loadingLabel?: string;
}

export function VideoInput({
  onAnalyze,
  loading,
  analyzed,
  source = null,
  placeholder = "Cole a URL do vídeo do YouTube...",
  defaultValue = "",
  buttonLabel = "Analisar comentários",
  loadingLabel = "Analisando...",
}: VideoInputProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("url") as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    onAnalyze(value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="url"
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="pl-10"
          disabled={loading}
          required
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
      {analyzed && source && (
        <Badge variant={source === "youtube" ? "default" : "secondary"} className="self-center sm:hidden">
          {source === "youtube" ? "YouTube" : "Demo"}
        </Badge>
      )}
    </form>
  );
}
