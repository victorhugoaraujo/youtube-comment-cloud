import { parseVideoId } from "@/lib/youtube";

export class AnaliseHttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AnaliseHttpError";
    this.status = status;
  }
}

export function isoDurationSeconds(iso?: string | null): number | null {
  if (!iso) return null;
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if (!match) return null;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

export function classifyTargetInput(input: string): { videoId: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new AnaliseHttpError("Cole uma URL ou ID válido de vídeo do YouTube.", 400);
  }

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host.endsWith("youtube.com") || host === "youtu.be" || host === "youtube.com") {
      if (url.pathname.includes("/shorts/")) {
        throw new AnaliseHttpError(
          "Short está fora do CommentIQ. Cole a URL de um vídeo longo.",
          400,
        );
      }
      if (url.pathname.includes("/live/")) {
        throw new AnaliseHttpError(
          "Live não é Análise. Use a tela de Lives para o chat ao vivo.",
          400,
        );
      }
    }
  } catch (error) {
    if (error instanceof AnaliseHttpError) throw error;
  }

  const videoId = parseVideoId(trimmed);
  if (!videoId) {
    throw new AnaliseHttpError("Cole uma URL ou ID válido de vídeo do YouTube.", 400);
  }
  return { videoId };
}

export function assertVideoIsAlvo(meta: {
  source: "youtube" | "demo";
  duration?: string | null;
  liveChatId?: string | null;
  liveEnded?: boolean;
}): void {
  if (meta.source !== "youtube") return;
  const seconds = isoDurationSeconds(meta.duration);
  if (seconds !== null && seconds > 0 && seconds <= 60) {
    throw new AnaliseHttpError("Este vídeo é um Short. Cole um vídeo longo.", 400);
  }
  if (meta.liveChatId && !meta.liveEnded) {
    throw new AnaliseHttpError(
      "Esta URL é de uma Live em andamento. Análise é só de vídeo gravado.",
      400,
    );
  }
}
