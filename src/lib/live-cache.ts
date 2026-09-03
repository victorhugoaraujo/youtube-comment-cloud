import type { WordFrequency } from "@/types";
import { extractWordFrequenciesFromTexts, trendingWords } from "@/lib/word-cloud";

export interface CachedLiveMessage {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  isQuestion: boolean;
  isSuperChat: boolean;
  superChatAmount?: string;
  publishedAt: string;
}

export interface LiveSnapshot {
  videoId: string;
  videoTitle: string;
  channelName: string;
  thumbnailUrl?: string;
  concurrentViewers?: number;
  messages: CachedLiveMessage[];
  words: WordFrequency[];
  trending: WordFrequency[];
  updatedAt: number;
  ended: boolean;
}

const cache = new Map<string, LiveSnapshot>();

const MAX_MESSAGES = 400;

export function updateLiveSnapshot(
  overlayToken: string,
  patch: Partial<LiveSnapshot> & { videoId: string }
) {
  const prev = cache.get(overlayToken);
  const messages = patch.messages
    ? [...(prev?.messages ?? []), ...patch.messages].slice(-MAX_MESSAGES)
    : (prev?.messages ?? []);

  const texts = messages.map((m) => m.text);
  const recent = messages.slice(-40).map((m) => m.text);

  const next: LiveSnapshot = {
    videoId: patch.videoId,
    videoTitle: patch.videoTitle ?? prev?.videoTitle ?? "Live",
    channelName: patch.channelName ?? prev?.channelName ?? "",
    thumbnailUrl: patch.thumbnailUrl ?? prev?.thumbnailUrl,
    concurrentViewers: patch.concurrentViewers ?? prev?.concurrentViewers,
    messages,
    words: extractWordFrequenciesFromTexts(texts, 36),
    trending: trendingWords(recent, texts, 5),
    updatedAt: Date.now(),
    ended: patch.ended ?? prev?.ended ?? false,
  };

  cache.set(overlayToken, next);
  return next;
}

export function getLiveSnapshot(overlayToken: string) {
  return cache.get(overlayToken) ?? null;
}

export function resetLiveSnapshot(overlayToken: string) {
  cache.delete(overlayToken);
}
