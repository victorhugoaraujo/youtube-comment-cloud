"use client";

import {
  Search,
  MessageCircleQuestion,
  Reply,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { CommentFilters, Sentiment, SortOption } from "@/types";

interface FiltersBarProps {
  filters: CommentFilters;
  onChange: (filters: CommentFilters) => void;
  resultCount: number;
}

export function FiltersBar({ filters, onChange, resultCount }: FiltersBarProps) {
  function update(partial: Partial<CommentFilters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Filtros</h2>
        <Badge variant="outline">{resultCount} comentários</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por texto ou autor..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.sentiment}
          onValueChange={(v) => update({ sentiment: v as Sentiment | "all" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sentimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os sentimentos</SelectItem>
            <SelectItem value="positive">Positivo</SelectItem>
            <SelectItem value="negative">Negativo</SelectItem>
            <SelectItem value="neutral">Neutro</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(v) => update({ sortBy: v as SortOption })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="likes">Mais curtidos</SelectItem>
            <SelectItem value="date">Mais recentes</SelectItem>
            <SelectItem value="replies">Mais respostas</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="text-sm"
            title="Data inicial"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="text-sm"
            title="Data final"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ questionsOnly: !filters.questionsOnly })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.questionsOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          <MessageCircleQuestion className="size-3.5" />
          Apenas perguntas
        </button>

        <button
          type="button"
          onClick={() =>
            update({ authorRepliedOnly: !filters.authorRepliedOnly })
          }
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.authorRepliedOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          <Reply className="size-3.5" />
          Autor respondeu
        </button>

        <button
          type="button"
          onClick={() => update({ topOnly: !filters.topOnly })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.topOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          Top comentários
        </button>

        <button
          type="button"
          onClick={() => update({ spamOnly: !filters.spamOnly })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.spamOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          Spam
        </button>

        <button
          type="button"
          onClick={() => update({ hatersOnly: !filters.hatersOnly })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            filters.hatersOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          Haters
        </button>

        {(filters.search ||
          filters.sentiment !== "all" ||
          filters.questionsOnly ||
          filters.authorRepliedOnly ||
          filters.spamOnly ||
          filters.hatersOnly ||
          filters.topOnly ||
          filters.dateFrom ||
          filters.dateTo) && (
          <button
            type="button"
            onClick={() =>
              onChange({
                search: "",
                sentiment: "all",
                questionsOnly: false,
                authorRepliedOnly: false,
                spamOnly: false,
                hatersOnly: false,
                topOnly: false,
                sortBy: filters.sortBy,
                dateFrom: "",
                dateTo: "",
              })
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <Calendar className="size-3.5" />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
