import { filtrosDaPuxada, vistaDaPuxada } from "./puxada";
import { DEFAULT_FILTERS } from "./filters";
import type { Comment } from "@/types";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

function comment(over: Partial<Comment> & Pick<Comment, "id" | "text">): Comment {
  return {
    author: "a",
    authorAvatar: "",
    likes: 0,
    publishedAt: "2026-09-01T00:00:00.000Z",
    replyCount: 0,
    authorReplied: false,
    sentiment: "positive",
    ...over,
  };
}

const praise = comment({ id: "c1", text: "Amei o vídeo, parabéns" });
const reply = comment({ id: "r1", text: "Concordo com você" });
const spam = comment({
  id: "s1",
  text: "Ganhe dinheiro agora bit.ly/xpto",
  sentiment: "spam",
  isSpam: true,
});
const hater = comment({
  id: "h1",
  text: "Canal lixo, cala a boca",
  sentiment: "negative",
  isHater: true,
});

const partial = vistaDaPuxada({
  youtubeCommentTotal: 6,
  ingestedCount: 4,
  truncated: true,
  comments: [praise, reply, spam, hater],
});

assert(partial.totalDeComentarios === 6, "mostra o Total de comentários do YouTube");
assert(partial.comentariosNestaAnalise === 4, "mostra quantos Comentários esta Análise trouxe");
assert(partial.incompleta, "puxada incompleta não trata o recorte como a audiência inteira");
assert(
  partial.comentarios.map((c) => c.text).join(" | ") ===
    "Amei o vídeo, parabéns | Concordo com você | Ganhe dinheiro agora bit.ly/xpto | Canal lixo, cala a boca",
  "resposta, spam e hater permanecem na lista, sem modo só perguntas",
);
assert(partial.comentarios.find((c) => c.id === "s1")?.sentiment === "spam", "spam permanece marcado como spam");
assert(partial.comentarios.find((c) => c.id === "h1")?.isHater === true, "hater permanece com selo");

const complete = vistaDaPuxada({
  youtubeCommentTotal: 1,
  ingestedCount: 1,
  truncated: false,
  comments: [praise],
});
assert(complete.totalDeComentarios === 1, "puxada completa ainda mostra o Total de comentários");
assert(complete.comentariosNestaAnalise === 1, "puxada completa ainda mostra os Comentários trazidos");
assert(!complete.incompleta, "os dois números iguais fecham a puxada");

const filtros = filtrosDaPuxada({
  ...DEFAULT_FILTERS,
  search: "thumbnail",
  sentiment: "negative",
  questionsOnly: true,
  sortBy: "date",
});
assert(filtros.sentiment === "all", "não há filtro por sentimento");
assert(filtros.questionsOnly === false, "não há lista só de perguntas");
assert(filtros.search === "thumbnail" && filtros.sortBy === "date", "busca e ordenação continuam");

console.log("puxada checks passed");
