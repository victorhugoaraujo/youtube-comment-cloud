import type { Metadata } from "next";
import { LiveAnalyzer } from "@/components/live-analyzer";

export const metadata: Metadata = {
  title: "Lives — CommentIQ",
  description:
    "Nuvem de palavras em tempo quase real a partir do chat de lives do YouTube.",
};

export default function LivePage() {
  return <LiveAnalyzer />;
}
