import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, requirePlan, withUser } from "@/lib/api";
import { fetchLiveChatPage, parseVideoId } from "@/lib/youtube";
import { MOCK_LIVE_MESSAGES } from "@/lib/mock-live";
import { updateLiveSnapshot } from "@/lib/live-cache";
import { integrations } from "@/lib/env";

export async function GET(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;

  const gated = requirePlan(user, "pro");
  if (gated) return gated;

  const videoParam = req.nextUrl.searchParams.get("url") || req.nextUrl.searchParams.get("videoId") || "";
  const videoId = parseVideoId(videoParam) || videoParam;
  if (!videoId) return jsonError("Informe a URL ou o ID da live.");

  const pageToken = req.nextUrl.searchParams.get("pageToken") || undefined;
  const cursor = Number(req.nextUrl.searchParams.get("cursor") || "0");

  try {
    const page = await fetchLiveChatPage(videoId, pageToken);

    if (page.source === "demo") {
      const nextCursor = Math.min(cursor + 4, MOCK_LIVE_MESSAGES.length);
      const chunk = MOCK_LIVE_MESSAGES.slice(cursor, nextCursor).map((m) => ({
        id: m.id,
        author: m.author,
        authorAvatar: m.authorAvatar,
        text: m.text,
        isQuestion: m.isQuestion,
        isSuperChat: m.isSuperChat,
        superChatAmount: m.superChatAmount,
        publishedAt: new Date().toISOString(),
      }));
      const ended = nextCursor >= MOCK_LIVE_MESSAGES.length;
      const snapshot = updateLiveSnapshot(user.overlayToken, {
        videoId,
        videoTitle: page.video.title,
        channelName: page.video.channelName,
        thumbnailUrl: page.video.thumbnailUrl,
        messages: chunk,
        ended,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { liveVideoId: videoId },
      });

      return NextResponse.json({
        ...page,
        messages: chunk,
        cursor: nextCursor,
        ended,
        snapshot,
        overlayUrl: `/overlay/${user.overlayToken}`,
        integrations: integrations(),
      });
    }

    const snapshot = updateLiveSnapshot(user.overlayToken, {
      videoId,
      videoTitle: page.video.title,
      channelName: page.video.channelName,
      thumbnailUrl: page.video.thumbnailUrl,
      messages: page.messages,
      ended: page.offline,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { liveVideoId: videoId },
    });

    return NextResponse.json({
      ...page,
      snapshot,
      overlayUrl: `/overlay/${user.overlayToken}`,
      integrations: integrations(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Falha ao ler o chat.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
