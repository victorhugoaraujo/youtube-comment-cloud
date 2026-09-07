import type { Sentiment } from "@/types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const CREATOR_APPRECIATION = [
  "aprendi com voce",
  "aprendi com vocês",
  "aprendi com seus videos",
  "aprendi com seus video",
  "aprendi com o seus videos",
  "aprendi com os seus videos",
  "aprendi com seu video",
  "aprendi com o seu video",
  "aprendi com seu canal",
  "seus videos",
  "seu video me",
  "voce me ajudou",
  "voce ajudou",
  "me ajudou muito",
  "obrigado pelos videos",
  "obrigada pelos videos",
  "valeu pelos videos",
  "melhor canal",
  "explica muito bem",
  "continua assim",
  "conteudo de qualidade",
  "mudou minha vida",
  "voce ensina",
];

const CREATOR_INSULTS = [
  "lixo de canal",
  "canal lixo",
  "charlatao",
  "charlatao",
  "golpista",
  "cala a boca",
  "vai trabalhar",
  "palhaco",
  "idiota",
  "imbecil",
  "otario",
  "lixo humano",
];

const POSITIVE_PHRASES = [
  "aprendi muito",
  "aprendi pra caramba",
  "amei",
  "adorei",
  "parabens",
  "obrigado",
  "obrigada",
  "muito top",
  "muito bom",
  "excelente",
  "incrivel",
  "perfeito",
  "maravilhoso",
  "sensacional",
  "show de bola",
  "valeu demais",
  "ajudou demais",
  "conteudo top",
  "great",
  "amazing",
  "awesome",
  "thanks",
  "thank you",
];

const NEGATIVE_TOWARD_VIDEO = [
  "nao gostei",
  "nao gostei do video",
  "video ruim",
  "video pessimo",
  "perda de tempo",
  "clickbait",
  "enganoso",
  "nunca mais assisto",
  "nunca mais vejo",
  "nunca mais me inscrevo",
  "decepcionado com o video",
  "decepcionante",
  "pior video",
  "odio desse canal",
];

const SELF_LESSON = [
  "quebrando a cara",
  "quebrei a cara",
  "nunca mais faco isso",
  "nunca mais pego",
  "nunca mais faco",
  "aprendi da pior forma",
  "cai nessa",
];

export function analyzeSentiment(text: string): Sentiment {
  const lower = normalize(text);

  const appreciatesCreator = CREATOR_APPRECIATION.some((p) => lower.includes(p));
  const insultingCreator = CREATOR_INSULTS.some((p) => lower.includes(p));
  const selfLesson = SELF_LESSON.some((p) => lower.includes(p));

  let positive = 0;
  let negative = 0;

  for (const phrase of POSITIVE_PHRASES) {
    if (lower.includes(phrase)) positive += 1;
  }
  for (const phrase of NEGATIVE_TOWARD_VIDEO) {
    if (lower.includes(phrase)) negative += 2;
  }
  if (appreciatesCreator) positive += 2;
  if (insultingCreator) negative += 3;
  if (selfLesson && appreciatesCreator) positive += 1;

  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  if (appreciatesCreator) return "positive";
  return "neutral";
}

export function isCreatorHater(text: string): boolean {
  const lower = normalize(text);
  if (CREATOR_APPRECIATION.some((p) => lower.includes(p))) return false;
  if (SELF_LESSON.some((p) => lower.includes(p)) && !CREATOR_INSULTS.some((p) => lower.includes(p))) {
    return false;
  }
  return CREATOR_INSULTS.some((p) => lower.includes(p));
}

export function sentimentLabel(sentiment: Sentiment): string {
  switch (sentiment) {
    case "positive":
      return "Positivo";
    case "negative":
      return "Negativo";
    case "neutral":
      return "Neutro";
  }
}
