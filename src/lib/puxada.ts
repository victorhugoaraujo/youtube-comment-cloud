import type { Comment } from "@/types";

export interface VistaDaPuxada {
  totalDeComentarios: number;
  comentariosNestaAnalise: number;
  incompleta: boolean;
  comentarios: Comment[];
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
    incompleta: input.truncated || input.youtubeCommentTotal !== input.ingestedCount,
    comentarios: input.comments,
  };
}
