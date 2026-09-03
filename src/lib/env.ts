export function integrations() {
  return {
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  };
}

export function appUrl() {
  return process.env.APP_URL?.replace(/\/$/, "") || "http://127.0.0.1:4317";
}
