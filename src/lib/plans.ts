export type PlanId = "free" | "pro" | "business";
export type PlanInterval = "monthly" | "yearly";

export interface PlanLimits {
  videosPerMonth: number | null;
  commentsPerVideo: number;
  liveChat: boolean;
  overlay: boolean;
  export: boolean;
  aiSummary: boolean;
  aiIdeas: number | null;
  aiScripts: number | null;
  spamDetection: boolean;
  historyDays: number | null;
  maxChannels: number;
  compare: boolean;
  calendar: boolean;
  scriptVariations: boolean;
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    videosPerMonth: 5,
    commentsPerVideo: 500,
    liveChat: false,
    overlay: false,
    export: false,
    aiSummary: false,
    aiIdeas: 0,
    aiScripts: 0,
    spamDetection: false,
    historyDays: 0,
    maxChannels: 1,
    compare: false,
    calendar: false,
    scriptVariations: false,
  },
  pro: {
    videosPerMonth: null,
    commentsPerVideo: 5000,
    liveChat: true,
    overlay: false,
    export: true,
    aiSummary: true,
    aiIdeas: 5,
    aiScripts: 5,
    spamDetection: true,
    historyDays: 30,
    maxChannels: 1,
    compare: false,
    calendar: false,
    scriptVariations: false,
  },
  business: {
    videosPerMonth: null,
    commentsPerVideo: 5000,
    liveChat: true,
    overlay: true,
    export: true,
    aiSummary: true,
    aiIdeas: null,
    aiScripts: null,
    spamDetection: true,
    historyDays: null,
    maxChannels: 10,
    compare: true,
    calendar: true,
    scriptVariations: true,
  },
};

export const PLAN_PRICES = {
  pro: { monthly: 29, yearly: 290 },
  business: { monthly: 79, yearly: 790 },
} as const;

export const PLAN_LABEL: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export function isPlanId(value: string): value is PlanId {
  return value === "free" || value === "pro" || value === "business";
}

export function planRank(plan: PlanId): number {
  return { free: 0, pro: 1, business: 2 }[plan];
}

export function hasMinPlan(current: PlanId, min: PlanId): boolean {
  return planRank(current) >= planRank(min);
}

export function currentUsageMonth(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
