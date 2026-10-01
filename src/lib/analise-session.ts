import type { Comment, CommentFilters, VideoInfo } from "@/types";
import type { VideoIdea, VideoScript } from "@/lib/openai";

export interface AnaliseSnapshot {
  analysisId: string | null;
  video: VideoInfo;
  comments: Comment[];
  source: "youtube" | "demo";
  youtubeCommentTotal: number;
  ingestedCount: number;
  truncated?: boolean;
  analisesUsedMonth: number;
  filters: CommentFilters;
  summary: string | null;
  ideas: VideoIdea[];
  script: VideoScript | null;
}

const VERSION = 1;

export function analiseSessionKey(userId: string) {
  return `commentiq.analise.${userId}`;
}

export function parseAnaliseSnapshot(raw: string | null): AnaliseSnapshot | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { v?: number; snapshot?: AnaliseSnapshot };
    const snapshot = parsed.snapshot;
    if (parsed.v !== VERSION || !snapshot?.video?.id || !Array.isArray(snapshot.comments)) {
      return null;
    }
    if (snapshot.source !== "youtube" && snapshot.source !== "demo") return null;
    return snapshot;
  } catch {
    return null;
  }
}

export function serializeAnaliseSnapshot(snapshot: AnaliseSnapshot) {
  return JSON.stringify({ v: VERSION, snapshot });
}

export function readAnaliseSnapshot(userId: string): AnaliseSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    return parseAnaliseSnapshot(sessionStorage.getItem(analiseSessionKey(userId)));
  } catch {
    return null;
  }
}

export function writeAnaliseSnapshot(userId: string, snapshot: AnaliseSnapshot | null) {
  if (typeof window === "undefined") return;
  try {
    const key = analiseSessionKey(userId);
    if (!snapshot) {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, serializeAnaliseSnapshot(snapshot));
  } catch {
    // Quota or private mode: the workspace that stays mounted still holds the Análise.
  }
}
