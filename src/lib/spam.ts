import { isCreatorHater } from "@/lib/sentiment";
import type { Comment } from "@/types";

const SPAM_PATTERNS = [
  /bit\.ly/i,
  /ganhe dinheiro/i,
  /free followers/i,
  /inscritos grátis/i,
  /telegram\.me/i,
  /whatsapp\.com\/channel/i,
  /(.)\1{6,}/,
];

export function detectSpam(text: string): boolean {
  const lower = text.toLowerCase();
  if (text.length < 4) return true;
  if (SPAM_PATTERNS.some((p) => p.test(text))) return true;
  const letters = text.replace(/\s/g, "");
  const caps = letters.replace(/[^A-ZÁÉÍÓÚÃÕ]/g, "").length;
  if (letters.length > 12 && caps / letters.length > 0.7) return true;
  const words = lower.split(/\s+/);
  if (words.length >= 4 && new Set(words).size <= 2) return true;
  return false;
}

export function detectHater(text: string): boolean {
  return isCreatorHater(text);
}

export function annotateComments(comments: Comment[]): Comment[] {
  const seen = new Map<string, number>();
  return comments.map((c) => {
    const key = c.text.trim().toLowerCase();
    seen.set(key, (seen.get(key) ?? 0) + 1);
    const duplicate = (seen.get(key) ?? 0) > 1;
    return {
      ...c,
      isSpam: c.isSpam || detectSpam(c.text) || duplicate,
      isHater: c.isHater || detectHater(c.text),
    };
  });
}

export function markTopComments(comments: Comment[], limit = 5): Comment[] {
  const ranked = [...comments].sort(
    (a, b) => b.likes * 2 + b.replyCount - (a.likes * 2 + a.replyCount)
  );
  const topIds = new Set(ranked.slice(0, limit).map((c) => c.id));
  return comments.map((c) => ({ ...c, isTop: topIds.has(c.id) }));
}
