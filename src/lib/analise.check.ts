import { NextRequest } from "next/server";
import { PLAN_LIMITS, type PlanId } from "./plans";
import { createAnalise } from "./analise";
import { AnaliseHttpError } from "./video-alvo";
import { assertCanManageBilling, assertCanManageMembros } from "./access";
import type { SessionUser } from "./auth";
import type { Comment, VideoInfo } from "@/types";
import type { FetchedComments } from "./youtube";
import { POST as openAnalise } from "@/app/api/comments/route";

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
  const analyses: Array<{
    id: string;
    billingOwnerId: string;
    videoId: string;
    youtubeCommentTotal: number;
    ingestedCount: number;
  }> = [];
  return {
    used: () => used,
    analyses,
    store: {
      async incrementAnalises() {
        used += 1;
        return used;
      },
      async createAnalysis(input: {
        billingOwnerId: string;
        video: VideoInfo;
        youtubeCommentTotal: number;
        ingestedCount: number;
      }) {
        const id = `analysis-${input.billingOwnerId}-${analyses.length + 1}`;
        analyses.push({
          id,
          billingOwnerId: input.billingOwnerId,
          videoId: input.video.id,
          youtubeCommentTotal: input.youtubeCommentTotal,
          ingestedCount: input.ingestedCount,
        });
        return id;
      },
    },
  };
}

const PUBLISHER = "Quem Publicou";
const VIDEO_TITLE = "Como gravar um vídeo longo";
const THUMBNAIL = "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg";

function youtubeVideoList(over: {
  title?: string;
  channelTitle?: string;
  thumbnail?: string;
  duration?: string;
  privacyStatus?: string;
  commentCount?: string;
  liveChatId?: string | null;
  actualEndTime?: string | null;
} = {}) {
  return {
    items: [
      {
        id: "abcdefghijk",
        snippet: {
          title: over.title ?? VIDEO_TITLE,
          channelTitle: over.channelTitle ?? PUBLISHER,
          channelId: "UC-outro",
          publishedAt: "2024-01-02T00:00:00Z",
          thumbnails: { high: { url: over.thumbnail ?? THUMBNAIL } },
        },
        statistics: { commentCount: over.commentCount ?? "0", viewCount: "3400" },
        contentDetails: { duration: over.duration ?? "PT12M30S" },
        status: { privacyStatus: over.privacyStatus ?? "public" },
        liveStreamingDetails: {
          activeLiveChatId: over.liveChatId ?? undefined,
          actualEndTime: over.actualEndTime ?? undefined,
        },
      },
    ],
  };
}

async function withYoutubeFetch(
  handler: (url: URL) => { status: number; body: unknown },
  run: () => Promise<void>,
) {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.YOUTUBE_API_KEY;
  process.env.YOUTUBE_API_KEY = "test-key";
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const href =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const result = handler(new URL(href));
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    await run();
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = previousKey;
  }
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

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) return { status: 200, body: youtubeVideoList() };
      return {
        status: 403,
        body: { error: { errors: [{ reason: "commentsDisabled" }], message: "comments disabled" } },
      };
    },
    async () => {
      const opened = await createAnalise({
        actor: actor("pro"),
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        store: mem.store,
      });
      assert(opened.video.title === VIDEO_TITLE, "mostra o título");
      assert(opened.video.channelName === PUBLISHER, "mostra quem publicou");
      assert(opened.video.thumbnailUrl === THUMBNAIL, "mostra a miniatura");
      assert(opened.ingestedCount === 0, "comentários desabilitados não trazem Comentários");
      assert(mem.analyses.length === 1, "comentários desabilitados criam Análise");
      assert(mem.used() === 1, "comentários desabilitados gastam Limite");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) {
        return { status: 200, body: youtubeVideoList({ privacyStatus: "private" }) };
      }
      return {
        status: 200,
        body: {
          items: [
            {
              id: "thread-1",
              snippet: {
                totalReplyCount: 0,
                topLevelComment: {
                  id: "c1",
                  snippet: { textOriginal: "oi", likeCount: 0, publishedAt: "2024-01-02T00:00:00Z" },
                },
              },
            },
          ],
        },
      };
    },
    async () => {
      await expectError(
        () =>
          createAnalise({
            actor: actor("pro"),
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            store: mem.store,
          }),
        400,
        "privado",
      );
      assert(mem.used() === 0, "vídeo privado não gasta Limite");
      assert(mem.analyses.length === 0, "vídeo privado não cria Análise");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) return { status: 200, body: { items: [] } };
      return { status: 200, body: { items: [] } };
    },
    async () => {
      await expectError(
        () =>
          createAnalise({
            actor: actor("pro"),
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            store: mem.store,
          }),
        400,
        "encontrado",
      );
      assert(mem.used() === 0, "vídeo inexistente não gasta Limite");
      assert(mem.analyses.length === 0, "vídeo inexistente não cria Análise");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    () => ({ status: 500, body: "upstream" }),
    async () => {
      await expectError(
        () =>
          createAnalise({
            actor: actor("pro"),
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            store: mem.store,
          }),
        502,
        "falhou",
      );
      assert(mem.used() === 0, "falha da API não gasta Limite");
      assert(mem.analyses.length === 0, "falha da API não cria Análise");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) return { status: 200, body: youtubeVideoList() };
      return {
        status: 403,
        body: { error: { errors: [{ reason: "quotaExceeded" }], message: "quota" } },
      };
    },
    async () => {
      await expectError(
        () =>
          createAnalise({
            actor: actor("pro"),
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            store: mem.store,
          }),
        502,
        "cota",
      );
      assert(mem.used() === 0, "cota da API não gasta Limite");
      assert(mem.analyses.length === 0, "cota da API não cria Análise");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) {
        return { status: 200, body: youtubeVideoList({ duration: "PT45S" }) };
      }
      return {
        status: 403,
        body: { error: { errors: [{ reason: "commentsDisabled" }], message: "comments disabled" } },
      };
    },
    async () => {
      await expectError(
        () =>
          createAnalise({
            actor: actor("pro"),
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            store: mem.store,
          }),
        400,
        "short",
      );
      assert(mem.used() === 0, "Short com comentários desabilitados não gasta Limite");
      assert(mem.analyses.length === 0, "Short com comentários desabilitados não cria Análise");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) {
        return { status: 200, body: youtubeVideoList({ liveChatId: "chat-ao-vivo" }) };
      }
      return {
        status: 403,
        body: { error: { errors: [{ reason: "commentsDisabled" }], message: "comments disabled" } },
      };
    },
    async () => {
      await expectError(
        () =>
          createAnalise({
            actor: actor("pro"),
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            store: mem.store,
          }),
        400,
        "live",
      );
      assert(mem.used() === 0, "Live não gasta Limite");
      assert(mem.analyses.length === 0, "Live não cria Análise");
    },
  );
}

{
  const mem = memoryStore();
  await withYoutubeFetch(
    (url) => {
      if (url.pathname.endsWith("/videos")) {
        return { status: 200, body: youtubeVideoList({ commentCount: "3" }) };
      }
      return { status: 200, body: { items: [] } };
    },
    async () => {
      const opened = await createAnalise({
        actor: actor("pro", 0, { id: "conta-a", billingOwnerId: "conta-a" }),
        url: "abcdefghijk",
        store: mem.store,
      });
      assert(opened.video.title === VIDEO_TITLE, "ID mostra o título");
      assert(opened.video.channelName === PUBLISHER, "ID mostra quem publicou");
      assert(opened.video.thumbnailUrl === THUMBNAIL, "ID mostra a miniatura");
      assert(opened.video.channelName !== "Criador", "não confere dono do canal");
      assert(mem.analyses.length === 1, "ID de vídeo longo cria Análise");
      assert(mem.analyses[0].billingOwnerId === "conta-a", "Análise fica na conta que abriu");
    },
  );
}

{
  const fetchImpl = async () =>
    fetched({
      video: fakeVideo({
        title: VIDEO_TITLE,
        channelName: PUBLISHER,
        thumbnailUrl: THUMBNAIL,
        commentCount: 4,
      }),
    });
  const memA = memoryStore();
  const memB = memoryStore();
  const a = await createAnalise({
    actor: actor("pro", 0, { id: "conta-a", billingOwnerId: "conta-a" }),
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    fetchCommentsImpl: fetchImpl,
    store: memA.store,
  });
  const b = await createAnalise({
    actor: actor("free", 0, { id: "conta-b", billingOwnerId: "conta-b", email: "outra@example.com" }),
    url: "abcdefghijk",
    fetchCommentsImpl: fetchImpl,
    store: memB.store,
  });
  assert(a.video.id === b.video.id, "as duas contas abrem o mesmo Vídeo alvo");
  assert(a.analysisId !== b.analysisId, "cada conta fica com a sua Análise");
  assert(memA.used() === 1 && memB.used() === 1, "cada conta gasta o próprio Limite");
  assert(memA.analyses[0].billingOwnerId === "conta-a", "Análise da conta A");
  assert(memB.analyses[0].billingOwnerId === "conta-b", "Análise da conta B");
}

{
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.YOUTUBE_API_KEY;
  let pullStarted = false;
  process.env.YOUTUBE_API_KEY = "test-key";
  globalThis.fetch = async () => {
    pullStarted = true;
    return new Response("no", { status: 500 });
  };
  try {
    const res = await openAnalise(
      new NextRequest("http://localhost/api/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: "https://www.youtube.com/watch?v=abcdefghijk" }),
      }),
    );
    assert(res.status === 401, `sem sessão responde 401, veio ${res.status}`);
    assert(!pullStarted, "sem sessão a puxada não começa");
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = previousKey;
  }
}

console.log("analise checks passed");
}

void main();
