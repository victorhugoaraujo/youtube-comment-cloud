import { PLAN_LIMITS, type PlanId } from "./plans";
import { createAnalise } from "./analise";
import { AnaliseHttpError } from "./video-alvo";
import { assertCanManageBilling, assertCanManageMembros } from "./access";
import type { SessionUser } from "./auth";
import type { Comment, VideoInfo } from "@/types";
import type { FetchedComments } from "./youtube";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

function actor(plan: PlanId, used = 0, extra?: Partial<SessionUser>): SessionUser {
  return {
    id: extra?.id ?? "criador-1",
    email: extra?.email ?? "criador@example.com",
    name: "Criador",
    plan,
    planInterval: "monthly",
    overlayToken: "x",
    liveVideoId: null,
    videosUsedMonth: used,
    ideasUsedMonth: 0,
    scriptsUsedMonth: 0,
    usageMonth: "2026-09",
    limits: PLAN_LIMITS[plan],
    role: extra?.role ?? "criador",
    billingOwnerId: extra?.billingOwnerId ?? extra?.id ?? "criador-1",
  };
}

function fakeVideo(over: Partial<VideoInfo> = {}): VideoInfo {
  return {
    id: "abcdefghijk",
    title: "Vídeo alvo",
    channelName: "Outro canal",
    channelAvatar: "",
    thumbnailUrl: "",
    commentCount: 20,
    viewCount: 100,
    publishedAt: new Date().toISOString(),
    ...over,
  };
}

function fakeComment(id: string, text: string): Comment {
  return {
    id,
    author: "a",
    authorAvatar: "",
    text,
    likes: 0,
    publishedAt: new Date().toISOString(),
    replyCount: 0,
    authorReplied: false,
    sentiment: "positive",
  };
}

function fetched(over: Partial<FetchedComments> = {}): FetchedComments {
  const video = fakeVideo();
  const comments = [fakeComment("1", "Amei o vídeo, parabéns")];
  return {
    video: { ...video, channelId: "other", liveChatId: null },
    comments,
    source: "youtube",
    truncated: false,
    duration: "PT12M",
    liveEnded: true,
    ...over,
  };
}

function memoryStore() {
  let used = 0;
  const analyses: Array<{ videoId: string; youtubeCommentTotal: number; ingestedCount: number }> = [];
  return {
    used: () => used,
    analyses,
    store: {
      async incrementAnalises() {
        used += 1;
        return used;
      },
      async createAnalysis(input: { video: VideoInfo; youtubeCommentTotal: number; ingestedCount: number }) {
        analyses.push({
          videoId: input.video.id,
          youtubeCommentTotal: input.youtubeCommentTotal,
          ingestedCount: input.ingestedCount,
        });
        return "analysis-1";
      },
    },
  };
}

async function expectError(fn: () => Promise<unknown>, status: number, snippet: string) {
  try {
    await fn();
    throw new Error(`expected ${status} ${snippet}`);
  } catch (error) {
    assert(error instanceof AnaliseHttpError, `expected AnaliseHttpError, got ${error}`);
    const http = error as AnaliseHttpError;
    assert(http.status === status, `expected status ${status}, got ${http.status}: ${http.message}`);
    assert(http.message.toLowerCase().includes(snippet.toLowerCase()), http.message);
  }
}

async function main() {
await expectError(
  () => createAnalise({ actor: actor("pro"), url: "https://www.youtube.com/shorts/abcdefghijk" }),
  400,
  "short",
);
await expectError(
  () => createAnalise({ actor: actor("pro"), url: "https://www.youtube.com/live/abcdefghijk" }),
  400,
  "live",
);
await expectError(
  () => createAnalise({ actor: actor("pro"), url: "x" }),
  400,
  "url",
);

{
  const mem = memoryStore();
  await expectError(
    () =>
      createAnalise({
        actor: actor("pro"),
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        fetchCommentsImpl: async () => fetched({ duration: "PT45S" }),
        store: mem.store,
      }),
    400,
    "short",
  );
  assert(mem.used() === 0, "short must not spend Limite");
}

{
  const mem = memoryStore();
  await expectError(
    () =>
      createAnalise({
        actor: actor("pro"),
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        fetchCommentsImpl: async () =>
          fetched({ video: { ...fakeVideo(), liveChatId: "live-1" }, liveEnded: false }),
        store: mem.store,
      }),
    400,
    "live",
  );
  assert(mem.used() === 0, "live must not spend Limite");
}

{
  const mem = memoryStore();
  await expectError(
    () =>
      createAnalise({
        actor: actor("pro"),
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        fetchCommentsImpl: async () => {
          throw new Error("A cota diária da YouTube API esgotou. Tente de novo amanhã.");
        },
        store: mem.store,
      }),
    502,
    "cota",
  );
  assert(mem.used() === 0, "YouTube error must not spend Limite");
}

{
  const mem = memoryStore();
  const first = await createAnalise({
    actor: actor("free"),
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    fetchCommentsImpl: async () =>
      fetched({
        video: fakeVideo({ commentCount: 20 }),
        comments: [fakeComment("1", "ok"), fakeComment("2", "e agora?")],
      }),
    store: mem.store,
  });
  assert(first.youtubeCommentTotal === 20, "Total de comentários");
  assert(first.ingestedCount === 2, "Comentários da Análise");
  assert(first.truncated, "truncated when totals differ");
  assert(first.source === "youtube", "source youtube");
  assert(!first.comments.some((c) => "channelGate" in c), "no canal gate");
  assert(mem.used() === 1, "first Análise spends Limite");

  await createAnalise({
    actor: { ...actor("free"), videosUsedMonth: 1 },
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    fetchCommentsImpl: async () => fetched({ video: fakeVideo({ commentCount: 2 }) }),
    store: mem.store,
  });
  assert(mem.used() === 2, "reanalysis spends Limite again");
}

{
  const mem = memoryStore();
  await expectError(
    () =>
      createAnalise({
        actor: actor("free", 5),
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        fetchCommentsImpl: async () => fetched({ duration: "PT45S" }),
        store: mem.store,
      }),
    400,
    "short",
  );
  assert(mem.used() === 0, "watch Short at cap is Short, not Limite");
}

{
  const mem = memoryStore();
  await expectError(
    () =>
      createAnalise({
        actor: actor("free", 5),
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        fetchCommentsImpl: async () => fetched(),
        store: mem.store,
      }),
    402,
    "limite",
  );
  assert(mem.used() === 0, "blocked Free Análise does not increment");
}

{
  const mem = memoryStore();
  const owner = actor("business", 3, { id: "owner", billingOwnerId: "owner" });
  const membro = actor("business", 3, {
    id: "membro",
    email: "membro@example.com",
    role: "membro",
    billingOwnerId: "owner",
  });
  await createAnalise({
    actor: membro,
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    fetchCommentsImpl: async () => fetched({ comments: [] }),
    store: mem.store,
  });
  assert(mem.used() === 1, "Membro spends Criador Limite");
  assert(membro.billingOwnerId === owner.billingOwnerId, "shared billing owner");
}

{
  const membro = actor("business", 0, { role: "membro", billingOwnerId: "owner", id: "membro" });
  try {
    assertCanManageBilling(membro);
    throw new Error("membro must not manage billing");
  } catch (error) {
    assert(error instanceof AnaliseHttpError && error.status === 403, "billing 403");
  }
  try {
    assertCanManageMembros(membro);
    throw new Error("membro must not invite");
  } catch (error) {
    assert(error instanceof AnaliseHttpError && error.status === 403, "invite 403");
  }
  const free = actor("free");
  try {
    assertCanManageMembros(free);
    throw new Error("free must not invite");
  } catch (error) {
    assert(error instanceof AnaliseHttpError && error.status === 403, "free invite 403");
  }
}

{
  const mem = memoryStore();
  const empty = await createAnalise({
    actor: actor("pro"),
    url: "abcdefghijk",
    fetchCommentsImpl: async () => fetched({ video: fakeVideo({ commentCount: 0 }), comments: [] }),
    store: mem.store,
  });
  assert(empty.ingestedCount === 0 && empty.youtubeCommentTotal === 0, "zero comments is success");
  assert(mem.used() === 1, "zero-comment Análise spends Limite");
}

console.log("analise checks passed");
}

void main();
