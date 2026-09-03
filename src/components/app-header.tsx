"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Radio, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Comentários", icon: MessageSquare },
  { href: "/live", label: "Lives", icon: Radio },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white">
              <MessageSquare className="size-4" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CommentIQ</h1>
              <p className="text-xs text-muted-foreground">
                Análise inteligente de comentários
              </p>
            </div>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 sm:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Badge variant="secondary" className="gap-1">
          <Sparkles className="size-3" />
          POC — Modo demo
        </Badge>
      </div>

      <nav className="flex gap-1 border-t px-4 py-2 sm:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
