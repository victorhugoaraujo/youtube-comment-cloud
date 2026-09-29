import { prisma } from "@/lib/prisma";
import { computeStats } from "@/lib/filters";
import { fetchComments, type FetchedComments } from "@/lib/youtube";
import { integrations } from "@/lib/env";
import { applyGlossarySentiment } from "@/lib/sentiment";
import { AnaliseHttpError, assertVideoIsAlvo, classifyTargetInput } from "@/lib/video-alvo";
export { AnaliseHttpError };
import type { SessionUser } from "@/lib/auth";
import type { Comment, VideoInfo } from "@/types";

export type AnaliseActor = Pick<
  SessionUser,
  "id" | "billingOwnerId" | "plan" | "limits" | "videosUsedMonth"
>;

export interface AnaliseResult {
  analysisId: string | null;
  video: VideoInfo;
  comments: Comment[];
  stats: ReturnType<typeof computeStats>;
  source: "youtube" | "demo";
  truncated: boolean;
  youtubeCommentTotal: number;
  ingestedCount: number;
  analisesUsedMonth: number;
  integrations: ReturnType<typeof integrations>;
}

export interface AnaliseStore {
  incrementAnalises(): Promise<number>;
  createAnalysis(input: {
    billingOwnerId: string;
    video: VideoInfo & { channelId?: string };
    comments: Comment[];
    stats: ReturnType<typeof computeStats>;
    source: "youtube" | "demo";
    youtubeCommentTotal: number;
    ingestedCount: number;
  }): Promise<string | null>;
}

function prismaStore(billingOwnerId: string, persistHistory: boolean): AnaliseStore {
  return {
    async incrementAnalises() {
      const updated = await prisma.user.update({
        where: { id: billingOwnerId },
        data: { videosUsedMonth: { increment: 1 } },
      });
      return updated.videosUsedMonth;
    },
    async createAnalysis(input) {
      if (!persistHistory) return null;
      const saved = await prisma.analysis.create({
        data: {
          userId: input.billingOwnerId,
          kind: "vod",
          videoId: input.video.id,
          videoTitle: input.video.title,
          channelName: input.video.channelName,
          channelId: input.video.channelId,
          thumbnailUrl: input.video.thumbnailUrl,
          commentCount: input.youtubeCommentTotal,
          youtubeCommentTotal: input.youtubeCommentTotal,
          ingestedCount: input.ingestedCount,
          source: input.source,
          statsJson: JSON.stringify(input.stats),
          commentsJson: JSON.stringify(input.comments),
        },
      });
      return saved.id;
    },
  };
}

export async function createAnalise(options: {
  actor: AnaliseActor;
  url: string;
  fetchCommentsImpl?: (videoId: string, max: number) => Promise<FetchedComments>;
  store?: AnaliseStore;
}): Promise<AnaliseResult> {
  const { videoId } = classifyTargetInput(options.url);

  const load = options.fetchCommentsImpl ?? fetchComments;
  let result: FetchedComments;
  try {
    result = await load(videoId, options.actor.limits.commentsPerVideo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao buscar comentários.";
    const status = /não encontrado|nao encontrado|desativados/i.test(message) ? 400 : 502;
    throw new AnaliseHttpError(message, status);
  }

  assertVideoIsAlvo({
    source: result.source,
    duration: result.duration,
    liveChatId: result.video.liveChatId,
    liveEnded: result.liveEnded,
  });

  if (
    options.actor.limits.videosPerMonth !== null &&
    options.actor.videosUsedMonth >= options.actor.limits.videosPerMonth
  ) {
    throw new AnaliseHttpError(
      "Você atingiu o limite de 5 Análises neste mês no plano Free. Faça upgrade para o Pro.",
      402,
    );
  }

  const comments = applyGlossarySentiment(result.comments);
  const youtubeCommentTotal = result.video.commentCount || 0;
  const ingestedCount = comments.length;
  const truncated = result.truncated || youtubeCommentTotal > ingestedCount;
  const stats = computeStats(comments, comments);

  const store =
    options.store ??
    prismaStore(options.actor.billingOwnerId, options.actor.limits.historyDays !== 0);

  const analisesUsedMonth = await store.incrementAnalises();
  const analysisId = await store.createAnalysis({
    billingOwnerId: options.actor.billingOwnerId,
    video: result.video,
    comments,
    stats,
    source: result.source,
    youtubeCommentTotal,
    ingestedCount,
  });

  return {
    analysisId,
    video: result.video,
    comments,
    stats,
    source: result.source,
    truncated,
    youtubeCommentTotal,
    ingestedCount,
    analisesUsedMonth,
    integrations: integrations(),
  };
}
