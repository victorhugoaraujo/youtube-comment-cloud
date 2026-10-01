import { parseAnaliseSnapshot, serializeAnaliseSnapshot, type AnaliseSnapshot } from "./analise-session";
import { DEFAULT_FILTERS } from "./filters";

function assert(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

const snapshot: AnaliseSnapshot = {
  analysisId: "an-1",
  video: {
    id: "abcdefghijk",
    title: "Vídeo alvo",
    channelName: "Canal",
    channelAvatar: "",
    thumbnailUrl: "",
    commentCount: 10,
    viewCount: 20,
    publishedAt: "2026-09-01T00:00:00.000Z",
  },
  comments: [
    {
      id: "c1",
      author: "a",
      authorAvatar: "",
      text: "gostei",
      likes: 1,
      publishedAt: "2026-09-01T00:00:00.000Z",
      replyCount: 0,
      authorReplied: false,
      sentiment: "positive",
    },
  ],
  source: "youtube",
  youtubeCommentTotal: 10,
  ingestedCount: 1,
  truncated: true,
  analisesUsedMonth: 2,
  filters: { ...DEFAULT_FILTERS, search: "gostei" },
  summary: "A audiência gostou.",
  ideas: [],
  script: null,
};

const restored = parseAnaliseSnapshot(serializeAnaliseSnapshot(snapshot));
assert(restored?.video.title === "Vídeo alvo", "video survives");
assert(restored?.comments.length === 1, "comments survive");
assert(restored?.filters.search === "gostei", "filters survive");
assert(restored?.summary === "A audiência gostou.", "summary survives");
assert(restored?.youtubeCommentTotal === 10 && restored?.ingestedCount === 1, "both counts survive");
assert(restored?.truncated === true, "incomplete pull survives");
assert(parseAnaliseSnapshot(null) === null, "empty storage");
assert(parseAnaliseSnapshot("{") === null, "broken json");
assert(parseAnaliseSnapshot(JSON.stringify({ v: 1, snapshot: { video: {} } })) === null, "incomplete snapshot");

console.log("analise session checks passed");
