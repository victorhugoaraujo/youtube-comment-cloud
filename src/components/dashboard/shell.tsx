"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarRange,
  Clapperboard,
  GitCompare,
  History,
  LogOut,
  MessageSquare,
  Radio,
  Settings,
  Sparkles,
  Tv,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAN_LABEL, type PlanId } from "@/lib/plans";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/dashboard", label: "Comentários", icon: MessageSquare },
  { href: "/dashboard/live", label: "Lives", icon: Radio, min: "pro" as const },
  { href: "/dashboard/history", label: "Histórico", icon: History, min: "pro" as const },
  { href: "/dashboard/ideas", label: "Ideias e roteiros", icon: Sparkles, min: "pro" as const },
  { href: "/dashboard/calendar", label: "Calendário", icon: CalendarRange, min: "business" as const },
  { href: "/dashboard/channels", label: "Canais", icon: Tv, min: "business" as const },
  { href: "/dashboard/compare", label: "Comparar", icon: GitCompare, min: "business" as const },
  { href: "/dashboard/account", label: "Conta", icon: Settings },
];

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <Clapperboard className="size-4" />
          </div>
          <div>
            <p className="font-semibold">CommentIQ</p>
            <Badge variant="secondary" className="text-[10px]">
              {PLAN_LABEL[user.plan as PlanId]}
            </Badge>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <p className="truncate px-2 text-xs text-muted-foreground">{user.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <span className="font-semibold">CommentIQ</span>
          <Link href="/pricing" className={cn(buttonVariants({ size: "sm", variant: "outline" }))}>
            Planos
          </Link>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b px-2 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border px-3 py-1 text-xs"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
