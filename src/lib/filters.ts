import type { Comment, CommentFilters, CommentStats } from "@/types";

export const DEFAULT_FILTERS: CommentFilters = {
  search: "",
  sentiment: "all",
  questionsOnly: false,
  authorRepliedOnly: false,
  sortBy: "likes",
  dateFrom: "",
  dateTo: "",
};

export function isQuestion(text: string): boolean {
  return text.includes("?");
}

export function filterComments(
  comments: Comment[],
  filters: CommentFilters
): Comment[] {
  let result = [...comments];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.text.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q)
    );
  }

  if (filters.sentiment !== "all") {
    result = result.filter((c) => c.sentiment === filters.sentiment);
  }

  if (filters.questionsOnly) {
    result = result.filter((c) => isQuestion(c.text));
  }

  if (filters.authorRepliedOnly) {
    result = result.filter((c) => c.authorReplied);
  }

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    result = result.filter((c) => new Date(c.publishedAt).getTime() >= from);
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime() + 86_400_000;
    result = result.filter((c) => new Date(c.publishedAt).getTime() < to);
  }

  switch (filters.sortBy) {
    case "likes":
      result.sort((a, b) => b.likes - a.likes);
      break;
    case "date":
      result.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      break;
    case "replies":
      result.sort((a, b) => b.replyCount - a.replyCount);
      break;
  }

  return result;
}

export function computeStats(
  all: Comment[],
  filtered: Comment[]
): CommentStats {
  const avgLikes =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((sum, c) => sum + c.likes, 0) / filtered.length
        )
      : 0;

  const sentimentBreakdown = {
    positive: filtered.filter((c) => c.sentiment === "positive").length,
    negative: filtered.filter((c) => c.sentiment === "negative").length,
    neutral: filtered.filter((c) => c.sentiment === "neutral").length,
  };

  return {
    total: all.length,
    filtered: filtered.length,
    avgLikes,
    sentimentBreakdown,
    questionCount: all.filter((c) => isQuestion(c.text)).length,
    authorRepliedCount: all.filter((c) => c.authorReplied).length,
  };
}
