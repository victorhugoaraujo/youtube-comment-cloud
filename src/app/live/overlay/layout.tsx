import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Overlay live — CommentIQ",
  description: "Nuvem de palavras para Browser Source no OBS.",
};

export default function OverlayLayout({ children }: { children: ReactNode }) {
  return children;
}
