import type { Comment, CommentFilters } from "@/types";

export interface VistaDaPuxada {
  totalDeComentarios: number;
  comentariosNestaAnalise: number;
  incompleta: boolean;
  comentarios: Comment[];
}

export function filtrosDaPuxada(filters: CommentFilters): CommentFilters {
  return { ...filters, sentiment: "all", questionsOnly: false };
}

export function puxadaIncompleta(input: {
  youtubeCommentTotal: number;
  ingestedCount: number;
  truncated: boolean;
}): boolean {
  return input.truncated || input.youtubeCommentTotal !== input.ingestedCount;
}

export function vistaDaPuxada(input: {
  youtubeCommentTotal: number;
  ingestedCount: number;
  truncated: boolean;
  comments: Comment[];
}): VistaDaPuxada {
  return {
    totalDeComentarios: input.youtubeCommentTotal,
    comentariosNestaAnalise: input.ingestedCount,
    incompleta: puxadaIncompleta(input),
    comentarios: input.comments,
  };
}
