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
]);

export function extractWordFrequencies(
  comments: Comment[],
  limit = 30
): WordFrequency[] {
  const counts = new Map<string, number>();

  for (const comment of comments) {
    const words = comment.text
      .toLowerCase()
      .replace(/[^\w\sáàâãéêíóôõúüç]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    for (const word of words) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
