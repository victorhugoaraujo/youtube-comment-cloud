"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-red-600 text-white">
            <MessageSquare className="size-4" />
          </div>
          <span className="font-bold tracking-tight">CommentIQ</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <Link href="/#funcionalidades" className="text-muted-foreground hover:text-foreground">
            Funcionalidades
          </Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
            Planos
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            Entrar
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
            Começar grátis
          </Link>
        </div>
      </div>
    </header>
  );
}
