import type { Sentiment } from "@/types";

const POSITIVE_WORDS = [
  "excelente",
  "ótimo",
  "otimo",
  "incrível",
  "incrivel",
  "amei",
  "adorei",
  "parabéns",
  "parabens",
  "obrigado",
  "obrigada",
  "top",
  "demais",
  "perfeito",
  "maravilhoso",
  "fantástico",
  "fantastico",
  "melhor",
  "ajudou",
  "inspirador",
  "sucesso",
  "qualidade",
  "valeu",
  "show",
  "sensacional",
  "genial",
  "bravo",
  "love",
  "great",
  "awesome",
  "amazing",
  "thanks",
  "thank",
  "best",
  "helpful",
  "incredible",
];

const NEGATIVE_WORDS = [
  "ruim",
  "péssimo",
  "pessimo",
  "horrível",
  "horrivel",
  "lixo",
  "odeio",
  "pior",
  "decepcionado",
  "decepcionante",
  "chato",
  "enrolação",
  "enrolacao",
  "perda de tempo",
  "nunca mais",
  "não gostei",
  "nao gostei",
  "fraco",
  "boring",
  "bad",
  "worst",
  "hate",
  "terrible",
  "awful",
  "disappointed",
  "clickbait",
  "enganoso",
  "spam",
];

export function analyzeSentiment(text: string): Sentiment {
  const lower = text.toLowerCase();

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positiveScore++;
  }

  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negativeScore++;
  }

  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
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
