import { tokenize } from "@/lib/word-cloud";
import { isQuestion } from "@/lib/filters";
import type { Comment } from "@/types";

const EXTRA_STOP = new Set([
  "video",
  "videos",
  "vídeo",
  "vídeos",
  "canal",
  "comentario",
  "comentarios",
  "comentário",
  "comentários",
  "cara",
  "tipo",
  "assim",
  "porque",
  "porquê",
  "então",
  "entao",
  "mesmo",
  "mesmo",
  "fazer",
  "faz",
  "vou",
  "vai",
  "ter",
  "tem",
  "ser",
  "nao",
  "não",
  "melhor",
  "forma",
  "jeito",
  "coisa",
  "coisas",
  "conteudo",
  "conteúdo",
  "valeu",
  "bom",
  "boa",
  "obrigado",
  "obrigada",
]);

export interface CommentCluster {
  id: string;
  label: string;
  comments: Comment[];
  count: number;
  totalLikes: number;
  questionCount: number;
  score: number;
  samples: string[];
}

export function clusterThresholds(total: number) {
  const minTermDf = Math.max(6, Math.ceil(total * 0.012));
  const maxTermShare = 0.28;
  const minCount = Math.max(10, Math.ceil(total * 0.02));
  const minLikes = Math.max(40, Math.ceil(total * 0.04));
  const starLikes = 25;
  return { minTermDf, maxTermShare, minCount, minLikes, starLikes };
}

function termsOf(text: string): string[] {
  const words = tokenize(text).filter((w) => !EXTRA_STOP.has(w));
  const terms = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    terms.push(`${words[i]} ${words[i + 1]}`);
  }
  return terms;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const item of a) if (b.has(item)) inter++;
  return inter / (a.size + b.size - inter);
}

function isStrongCluster(
  cluster: Pick<CommentCluster, "count" | "totalLikes" | "questionCount" | "comments">,
  total: number
): boolean {
  const t = clusterThresholds(total);
  if (cluster.count >= t.minCount) return true;
  if (cluster.totalLikes >= t.minLikes) return true;
  const top = Math.max(0, ...cluster.comments.map((c) => c.likes));
  if (top >= t.starLikes && cluster.count >= 4) return true;
  if (cluster.questionCount >= 8 && cluster.count >= 8) return true;
  return false;
}

export function clusterComments(comments: Comment[]): CommentCluster[] {
  const usable = comments.filter((c) => c.text.trim().length >= 12 && !c.isSpam);
  const total = usable.length;
  if (total < 8) return [];

  const t = clusterThresholds(total);
  const docTerms = usable.map((c) => ({ comment: c, terms: termsOf(c.text) }));
  const df = new Map<string, number>();
  for (const doc of docTerms) {
    for (const term of new Set(doc.terms)) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }

  const distinctive = [...df.entries()]
    .filter(([, count]) => count >= t.minTermDf && count / total <= t.maxTermShare)
    .sort((a, b) => a[1] - b[1]);

  if (!distinctive.length) return [];

  const distinctiveSet = new Set(distinctive.map(([term]) => term));
  const assignment = new Map<string, Comment[]>();

  for (const doc of docTerms) {
    const matches = doc.terms.filter((term) => distinctiveSet.has(term));
    if (!matches.length) continue;
    const term = matches.sort((a, b) => {
      const dfDiff = (df.get(a) ?? 0) - (df.get(b) ?? 0);
      if (dfDiff !== 0) return dfDiff;
      return b.length - a.length;
    })[0];
    const list = assignment.get(term) ?? [];
    list.push(doc.comment);
    assignment.set(term, list);
  }

  const drafts: CommentCluster[] = [...assignment.entries()].map(([term, group], index) => {
    const unique = [...new Map(group.map((c) => [c.id, c])).values()];
    const totalLikes = unique.reduce((sum, c) => sum + c.likes, 0);
    const questionCount = unique.filter((c) => c.isQuestion || isQuestion(c.text)).length;
    const samples = [...unique]
      .sort((a, b) => b.likes * 3 + (isQuestion(b.text) ? 10 : 0) - (a.likes * 3 + (isQuestion(a.text) ? 10 : 0)))
      .slice(0, 4)
      .map((c) => c.text);
    return {
      id: `tema-${index + 1}`,
      label: term,
      comments: unique,
      count: unique.length,
      totalLikes,
      questionCount,
      score: unique.length * 3 + totalLikes + questionCount * 4,
      samples,
    };
  });

  drafts.sort((a, b) => b.score - a.score);

  const merged: CommentCluster[] = [];
  for (const draft of drafts) {
    const ids = new Set(draft.comments.map((c) => c.id));
    const sibling = merged.find((other) => {
      const otherIds = new Set(other.comments.map((c) => c.id));
      return jaccard(ids, otherIds) >= 0.45;
    });
    if (!sibling) {
      merged.push(draft);
      continue;
    }
    const combined = [...new Map([...sibling.comments, ...draft.comments].map((c) => [c.id, c])).values()];
    sibling.comments = combined;
    sibling.count = combined.length;
    sibling.totalLikes = combined.reduce((sum, c) => sum + c.likes, 0);
    sibling.questionCount = combined.filter((c) => c.isQuestion || isQuestion(c.text)).length;
    sibling.score = sibling.count * 3 + sibling.totalLikes + sibling.questionCount * 4;
    sibling.label = sibling.count >= draft.count ? sibling.label : `${sibling.label} / ${draft.label}`;
    sibling.samples = [...combined]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 4)
      .map((c) => c.text);
  }

  return merged
    .filter((cluster) => isStrongCluster(cluster, total))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((cluster, index) => ({ ...cluster, id: `tema-${index + 1}` }));
}

export function minSupportLabel(total: number): string {
  const t = clusterThresholds(total);
  return `mínimo ${t.minCount} comentários parecidos ou ${t.minLikes}+ likes no tema`;
}
