import { analyzeSentiment, isCreatorHater } from "./sentiment";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const sample =
  "Emprestimo acima de 5 mil e loucura, nunca mais faço isso. Aprendi muito quebrando a cara e aprendi com o seus videos!";

assert(analyzeSentiment(sample) === "positive", `expected positive, got ${analyzeSentiment(sample)}`);
assert(!isCreatorHater(sample), "learning comment must not be hater");

assert(analyzeSentiment("Canal lixo, cala a boca") === "negative", "insult should be negative");
assert(isCreatorHater("Canal lixo, cala a boca"), "insult should be hater");
assert(analyzeSentiment("Amei o vídeo, parabéns") === "positive", "praise should be positive");

console.log("sentiment checks passed");
