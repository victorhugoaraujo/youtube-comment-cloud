import { NextResponse } from "next/server";
import { integrations } from "@/lib/env";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    integrations: integrations(),
    user: user
      ? {
          plan: user.plan,
          videosUsedMonth: user.videosUsedMonth,
          ideasUsedMonth: user.ideasUsedMonth,
          scriptsUsedMonth: user.scriptsUsedMonth,
          limits: user.limits,
        }
      : null,
  });
}
