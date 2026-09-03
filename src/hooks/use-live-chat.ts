"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MOCK_LIVE, MOCK_LIVE_MESSAGES } from "@/lib/mock-live";
import {
  extractWordFrequenciesFromTexts,
  trendingWords,
} from "@/lib/word-cloud";
import type { LiveChatMessage, WordFrequency } from "@/types";

const CATCH_UP = 6;
const BLOCK_SIZE_HINT = 12;

export type LiveSpeed = 1 | 2 | 3;

export function useLiveChatSimulation(options?: {
  autoStart?: boolean;
  intervalMs?: number;
}) {
  const baseInterval = options?.intervalMs ?? 700;
  const [connected, setConnected] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [speed, setSpeed] = useState<LiveSpeed>(1);
  const [connecting, setConnecting] = useState(false);

  const messages = useMemo(
    () => MOCK_LIVE_MESSAGES.slice(0, cursor),
    [cursor]
  );

  const connect = useCallback(() => {
    setConnecting(true);
    window.setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      setEnded(false);
      setCursor(CATCH_UP);
      setPlaying(true);
    }, 900);
  }, []);

  const pause = useCallback(() => setPlaying(false), []);
  const resume = useCallback(() => {
    if (!ended && connected) setPlaying(true);
  }, [ended, connected]);

  const reset = useCallback(() => {
    setConnected(false);
    setPlaying(false);
    setEnded(false);
    setCursor(0);
    setConnecting(false);
  }, []);

  useEffect(() => {
    if (options?.autoStart && !connected && !connecting) {
      connect();
    }
  }, [options?.autoStart, connected, connecting, connect]);

  useEffect(() => {
    if (!playing || ended) return;

    const id = window.setInterval(() => {
      setCursor((c) => {
        if (c >= MOCK_LIVE_MESSAGES.length) {
          setEnded(true);
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, Math.max(180, baseInterval / speed));

    return () => window.clearInterval(id);
  }, [playing, ended, speed, baseInterval]);

  const texts = useMemo(() => messages.map((m) => m.text), [messages]);
  const recentTexts = useMemo(
    () => messages.slice(-BLOCK_SIZE_HINT).map((m) => m.text),
    [messages]
  );

  const words: WordFrequency[] = useMemo(
    () => extractWordFrequenciesFromTexts(texts, 36),
    [texts]
  );

  const trending: WordFrequency[] = useMemo(
    () => trendingWords(recentTexts, texts, 5),
    [recentTexts, texts]
  );

  const questions = useMemo(
    () => messages.filter((m) => m.isQuestion).slice(-8).reverse(),
    [messages]
  );

  const uniqueAuthors = useMemo(
    () => new Set(messages.map((m) => m.author)).size,
    [messages]
  );

  const viewerCount = useMemo(() => {
    const base = MOCK_LIVE.concurrentViewers;
    const progress = cursor / Math.max(MOCK_LIVE_MESSAGES.length, 1);
    const wave = Math.sin(cursor / 4) * 90;
    return Math.round(base * (0.72 + progress * 0.35) + wave);
  }, [cursor]);

  const recapBlocks = useMemo(() => groupByBlock(messages), [messages]);

  return {
    live: MOCK_LIVE,
    total: MOCK_LIVE_MESSAGES.length,
    messages,
    latest: messages[messages.length - 1] as LiveChatMessage | undefined,
    words,
    trending,
    questions,
    uniqueAuthors,
    viewerCount,
    connected,
    connecting,
    playing,
    ended,
    cursor,
    speed,
    setSpeed,
    connect,
    pause,
    resume,
    reset,
    recapBlocks,
  };
}

export interface RecapBlock {
  block: number;
  topWords: WordFrequency[];
  messageCount: number;
  questionCount: number;
}

function groupByBlock(messages: LiveChatMessage[]): RecapBlock[] {
  const map = new Map<number, LiveChatMessage[]>();
  for (const m of messages) {
    const list = map.get(m.block) ?? [];
    list.push(m);
    map.set(m.block, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([block, list]) => ({
      block,
      messageCount: list.length,
      questionCount: list.filter((m) => m.isQuestion).length,
      topWords: extractWordFrequenciesFromTexts(
        list.map((m) => m.text),
        4
      ),
    }));
}
