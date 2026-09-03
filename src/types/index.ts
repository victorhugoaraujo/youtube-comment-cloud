export type Sentiment = "positive" | "negative" | "neutral";

export type SortOption = "likes" | "date" | "replies";

export interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  likes: number;
  publishedAt: string;
  replyCount: number;
  authorReplied: boolean;
  sentiment: Sentiment;
}

export interface VideoInfo {
  id: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  thumbnailUrl: string;
  commentCount: number;
  viewCount: number;
  publishedAt: string;
}

export interface CommentFilters {
  search: string;
  sentiment: Sentiment | "all";
  questionsOnly: boolean;
  authorRepliedOnly: boolean;
  sortBy: SortOption;
  dateFrom: string;
  dateTo: string;
}

export interface CommentStats {
  total: number;
  filtered: number;
  avgLikes: number;
  sentimentBreakdown: Record<Sentiment, number>;
  questionCount: number;
  authorRepliedCount: number;
}

export interface WordFrequency {
  word: string;
  count: number;
}
