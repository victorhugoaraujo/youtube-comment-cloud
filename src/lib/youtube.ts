import { MOCK_COMMENTS, MOCK_VIDEO } from "@/lib/mock-data";
import { analyzeSentiment } from "@/lib/sentiment";
import { annotateComments, markTopComments } from "@/lib/spam";
import { isQuestion } from "@/lib/filters";
import type { Comment, VideoInfo } from "@/types";

const YT = "https://www.googleapis.com/youtube/v3";

async function youtubeError(res: Response, fallback: string): Promise<Error> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as {
      error?: { message?: string; errors?: Array<{ reason?: string }> };
    };
    const reason = json.error?.errors?.[0]?.reason;
    if (reason === "commentsDisabled") {
      return new Error("Este vídeo está com os comentários desativados no YouTube.");
    }
    if (reason === "quotaExceeded") {
      return new Error("A cota diária da YouTube API esgotou. Tente de novo amanhã.");
    }
    if (reason === "keyInvalid" || reason === "ipRefererBlocked") {
      return new Error(
        "YOUTUBE_API_KEY recusada. No Google Cloud, ative YouTube Data API v3 e tire restrição de IP (a Vercel muda de IP).",
      );
    }
    if (reason === "videoNotFound" || res.status === 404) {
      return new Error("Vídeo não encontrado. Use um vídeo público.");
    }
    if (json.error?.message) return new Error(json.error.message);
  } catch {
    /* use fallback */
  }
  return new Error(`${fallback} (${res.status})`);
}

export function parseVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id?.slice(0, 11) ?? null;
    }
    if (host.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const match = url.pathname.match(/\/(shorts|live|embed)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    return null;
  }
  return null;
}

interface YtVideo {
  id: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    channelId?: string;
    publishedAt?: string;
    thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
  };
  statistics?: { commentCount?: string; viewCount?: string };
  liveStreamingDetails?: {
    activeLiveChatId?: string;
    actualStartTime?: string;
    concurrentViewers?: string;
  };
}

interface YtCommentSnippet {
  authorDisplayName?: string;
  authorProfileImageUrl?: string;
  authorChannelId?: { value?: string };
  textOriginal?: string;
  textDisplay?: string;
  likeCount?: number;
  publishedAt?: string;
}

interface YtCommentThread {
  id: string;
  snippet?: {
    totalReplyCount?: number;
    videoOwnerChannelId?: string;
    topLevelComment?: {
      id?: string;
      snippet?: YtCommentSnippet;
    };
  };
  replies?: {
    comments?: Array<{
      id?: string;
      snippet?: YtCommentSnippet;
    }>;
  };
}

function commentFromSnippet(
  id: string,
  snippet: YtCommentSnippet,
  replyCount: number,
  authorReplied: boolean
): Comment {
  const text = snippet.textOriginal || snippet.textDisplay || "";
  return {
    id,
    author: snippet.authorDisplayName ?? "Anônimo",
    authorAvatar: snippet.authorProfileImageUrl ?? "",
    text,
    likes: snippet.likeCount ?? 0,
    publishedAt: snippet.publishedAt ?? new Date().toISOString(),
    replyCount,
    authorReplied,
    sentiment: analyzeSentiment(text),
    isQuestion: isQuestion(text),
  };
}

export interface FetchedComments {
  video: VideoInfo & { channelId?: string; liveChatId?: string | null };
  comments: Comment[];
  source: "youtube" | "demo";
  truncated: boolean;
}

export async function fetchVideoMeta(videoId: string): Promise<{
  video: FetchedComments["video"];
  raw: YtVideo | null;
  source: "youtube" | "demo";
}> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    return {
      source: "demo",
      raw: null,
      video: { ...MOCK_VIDEO, id: videoId, channelId: "demo", liveChatId: "demo-chat" },
    };
  }

  const url = new URL(`${YT}/videos`);
  url.searchParams.set("part", "snippet,statistics,liveStreamingDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", key);

  const res = await fetch(url);
  if (!res.ok) throw await youtubeError(res, "YouTube videos.list falhou");
  const data = (await res.json()) as { items?: YtVideo[] };
  const item = data.items?.[0];
  if (!item) throw new Error("Vídeo não encontrado");

  const thumb =
    item.snippet?.thumbnails?.high?.url ||
    item.snippet?.thumbnails?.medium?.url ||
    "";

  return {
    source: "youtube",
    raw: item,
    video: {
      id: videoId,
      title: item.snippet?.title ?? "Vídeo",
      channelName: item.snippet?.channelTitle ?? "Canal",
      channelAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.snippet?.channelTitle ?? "YT")}`,
      thumbnailUrl: thumb,
      commentCount: Number(item.statistics?.commentCount ?? 0),
      viewCount: Number(item.statistics?.viewCount ?? 0),
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
      channelId: item.snippet?.channelId,
      liveChatId: item.liveStreamingDetails?.activeLiveChatId ?? null,
    },
  };
}

export async function fetchComments(
  videoId: string,
  maxComments: number
): Promise<FetchedComments> {
  const key = process.env.YOUTUBE_API_KEY;
  const meta = await fetchVideoMeta(videoId);

  if (!key) {
    const comments = markTopComments(annotateComments(MOCK_COMMENTS));
    return {
      video: meta.video,
      comments,
      source: "demo",
      truncated: false,
    };
  }

  const ownerId = meta.video.channelId;
  const comments: Comment[] = [];
  let pageToken = "";
  let truncated = false;

  while (comments.length < maxComments) {
    const url = new URL(`${YT}/commentThreads`);
    url.searchParams.set("part", "snippet,replies");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set("maxResults", "100");
    url.searchParams.set("order", "time");
    url.searchParams.set("textFormat", "plainText");
    url.searchParams.set("key", key);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) throw await youtubeError(res, "YouTube commentThreads.list falhou");
    const data = (await res.json()) as {
      items?: YtCommentThread[];
      nextPageToken?: string;
    };

    for (const thread of data.items ?? []) {
      const top = thread.snippet?.topLevelComment;
      if (!top?.snippet) continue;
      const replies = thread.replies?.comments ?? [];
      const authorReplied =
        replies.some((r) => r.snippet?.authorChannelId?.value === ownerId) ?? false;

      comments.push(
        commentFromSnippet(
          thread.id,
          top.snippet,
          thread.snippet?.totalReplyCount ?? 0,
          authorReplied
        )
      );

      for (const reply of replies) {
        if (comments.length >= maxComments) {
          truncated = true;
          break;
        }
        if (!reply.id || !reply.snippet) continue;
        comments.push(commentFromSnippet(reply.id, reply.snippet, 0, false));
      }

      if (comments.length >= maxComments) {
        truncated = true;
        break;
      }
    }

    if (!data.nextPageToken || comments.length >= maxComments) {
      truncated = truncated || Boolean(data.nextPageToken);
      break;
    }
    pageToken = data.nextPageToken;
  }

  const youtubeTotal = meta.video.commentCount || 0;
  if (youtubeTotal > comments.length) truncated = true;

  return {
    video: meta.video,
    comments: markTopComments(annotateComments(comments)),
    source: "youtube",
    truncated,
  };
}

export interface LiveChatPage {
  source: "youtube" | "demo";
  video: FetchedComments["video"];
  messages: Array<{
    id: string;
    author: string;
    authorAvatar: string;
    text: string;
    isQuestion: boolean;
    isSuperChat: boolean;
    superChatAmount?: string;
    publishedAt: string;
  }>;
  nextPageToken: string | null;
  pollingIntervalMillis: number;
  liveChatId: string | null;
  offline: boolean;
}

export async function fetchLiveChatPage(
  videoId: string,
  pageToken?: string
): Promise<LiveChatPage> {
  const key = process.env.YOUTUBE_API_KEY;
  const meta = await fetchVideoMeta(videoId);

  if (!key) {
    return {
      source: "demo",
      video: meta.video,
      messages: [],
      nextPageToken: null,
      pollingIntervalMillis: 4000,
      liveChatId: "demo-chat",
      offline: false,
    };
  }

  const liveChatId = meta.video.liveChatId;
  if (!liveChatId) {
    return {
      source: "youtube",
      video: meta.video,
      messages: [],
      nextPageToken: null,
      pollingIntervalMillis: 5000,
      liveChatId: null,
      offline: true,
    };
  }

  const url = new URL(`${YT}/liveChat/messages`);
  url.searchParams.set("liveChatId", liveChatId);
  url.searchParams.set("part", "snippet,authorDetails");
  url.searchParams.set("maxResults", "200");
  url.searchParams.set("key", key);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url);
  if (!res.ok) throw await youtubeError(res, "YouTube liveChat.messages falhou");

  const data = (await res.json()) as {
    nextPageToken?: string;
    pollingIntervalMillis?: number;
    items?: Array<{
      id: string;
      snippet?: {
        displayMessage?: string;
        publishedAt?: string;
        type?: string;
        superChatDetails?: { amountDisplayString?: string };
      };
      authorDetails?: {
        displayName?: string;
        profileImageUrl?: string;
      };
    }>;
  };

  const messages = (data.items ?? []).map((item) => {
    const text = item.snippet?.displayMessage ?? "";
    const amount = item.snippet?.superChatDetails?.amountDisplayString;
    return {
      id: item.id,
      author: item.authorDetails?.displayName ?? "Anônimo",
      authorAvatar: item.authorDetails?.profileImageUrl ?? "",
      text,
      isQuestion: text.includes("?"),
      isSuperChat: Boolean(amount) || item.snippet?.type === "superChatEvent",
      superChatAmount: amount,
      publishedAt: item.snippet?.publishedAt ?? new Date().toISOString(),
    };
  });

  return {
    source: "youtube",
    video: meta.video,
    messages,
    nextPageToken: data.nextPageToken ?? null,
    pollingIntervalMillis: data.pollingIntervalMillis ?? 5000,
    liveChatId,
    offline: false,
  };
}
