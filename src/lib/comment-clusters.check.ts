import { clusterComments, clusterThresholds, minSupportLabel } from "./comment-clusters";
import type { Comment } from "@/types";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

function fake(id: string, text: string, likes = 0): Comment {
  return {
    id,
    author: "u",
    authorAvatar: "",
    text,
    likes,
    publishedAt: new Date().toISOString(),
    replyCount: 0,
    authorReplied: false,
    sentiment: "neutral",
  };
}

const bulk: Comment[] = [];
for (let i = 0; i < 80; i++) {
  bulk.push(fake(`imp-${i}`, `Como declarar imposto de renda sobre o lucro? Preciso de um passo a passo da declaração.`));
}
for (let i = 0; i < 40; i++) {
  bulk.push(fake(`parc-${i}`, `Qual a melhor forma de parcelar a dívida e renegociar com o banco?`));
}
for (let i = 0; i < 200; i++) {
  bulk.push(fake(`gen-${i}`, `Muito bom o vídeo, me ajudou bastante, valeu pelo conteúdo de qualidade.`));
}
bulk.push(fake("crypto-1", "10 mil de empréstimo para investir em cripto? Aproveitando esse ciclo do btc???", 1));
bulk.push(fake("crypto-2", "Mas e se a pessoa pegar o empréstimo e investir pensando em juro composto de longo prazo?", 0));

const clusters = clusterComments(bulk);
const labels = clusters.map((c) => c.label).join(" | ");
assert(
  clusters.some((c) => c.count >= 30 && /imposto|declar/.test(c.label)),
  `expected a large tax cluster, got: ${labels}`
);
assert(
  !clusters.some((c) => /cripto|btc|bitcoin/.test(c.label) && c.count < 10),
  `crypto pair must not become an idea: ${labels}`
);

const t = clusterThresholds(bulk.length);
assert(t.minCount >= 10, "min count too low");
assert(minSupportLabel(1000).includes("comentários"), "label missing");

console.log("cluster checks passed", clusters.map((c) => `${c.label}:${c.count}`).join(", "));
