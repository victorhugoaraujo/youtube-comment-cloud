import { NextResponse } from "next/server";
import { applyResolvedDatabaseUrl, databaseUrlStatus } from "@/lib/database-url";

export async function GET() {
  const url = applyResolvedDatabaseUrl();
  const keys = databaseUrlStatus();
  return NextResponse.json({
    ok: Boolean(url),
    using: url ? "resolved" : "none",
    keys,
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
  });
}
