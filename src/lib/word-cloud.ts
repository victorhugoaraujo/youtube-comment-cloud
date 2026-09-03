import type { Comment, WordFrequency } from "@/types";

const STOP_WORDS = new Set([
  "a", "o", "e", "de", "da", "do", "em", "um", "uma", "os", "as", "dos", "das",
  "para", "com", "por", "que", "se", "na", "no", "ao", "aos", "mais", "muito",
  "já", "ja", "é", "e", "não", "nao", "me", "minha", "meu", "sua", "seu",
  "isso", "esse", "essa", "este", "esta", "como", "mas", "ou", "ser", "foi",
  "está", "esta", "tem", "ter", "são", "sao", "the", "and", "for", "you",
  "your", "this", "that", "with", "are", "was", "been", "have", "has",
  "to", "in", "on", "at", "is", "it", "of", "an", "be", "my", "i", "we",
  "so", "just", "all", "can", "will", "do", "did", "not", "but", "from",
  "ele", "ela", "eles", "elas", "nos", "nós", "nos", "você", "voce", "vc",
  "tb", "tbm", "também", "tambem", "aqui", "ali", "lá", "la", "aí", "ai",
  "quando", "onde", "qual", "quais", "quem", "porque", "porquê", "porque",
  "sobre", "depois", "antes", "entre", "até", "ate", "sem", "só", "so",
  "cada", "todo", "toda", "todos", "todas", "muito", "muita", "muitos",
  "pouco", "pouca", "ainda", "agora", "hoje", "ontem", "sempre", "nunca",
  "bem", "mal", "sim", "não", "nao", "tá", "ta", "né", "ne", "pra", "pro",
  "kkk", "kkkk", "kkkkk", "haha", "rs", "lol", "msg", "qnd", "pq", "blz",
  "fala", "galera", "pessoal", "gente", "live", "chat", "manda", "fala",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sáàâãéêíóôõúüç]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function extractWordFrequenciesFromTexts(
  texts: string[],
  limit = 30
): WordFrequency[] {
  const counts = new Map<string, number>();

  for (const text of texts) {
    for (const word of tokenize(text)) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function extractWordFrequencies(
  comments: Comment[],
  limit = 30
): WordFrequency[] {
  return extractWordFrequenciesFromTexts(
    comments.map((c) => c.text),
    limit
  );
}

export function trendingWords(
  recentTexts: string[],
  allTexts: string[],
  limit = 5
): WordFrequency[] {
  if (recentTexts.length === 0) return [];

  const recent = extractWordFrequenciesFromTexts(recentTexts, 20);
  const overall = new Map(
    extractWordFrequenciesFromTexts(allTexts, 80).map((w) => [w.word, w.count])
  );

  const recentTotal = recentTexts.length;
  const allTotal = Math.max(allTexts.length, 1);

  return recent
    .map((w) => {
      const recentShare = w.count / recentTotal;
      const overallShare = (overall.get(w.word) ?? 0) / allTotal;
      return { ...w, score: recentShare - overallShare };
    })
    .filter((w) => w.count >= 2 && w.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ word, count }) => ({ word, count }));
}
