import Link from "next/link";
import {
  Clapperboard,
  Cloud,
  Filter,
  MessageCircleQuestion,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Filter,
    title: "Filtros que o Studio não tem",
    text: "Sentimento, perguntas, spam, haters, período e ordenação por likes — para ler o que importa.",
  },
  {
    icon: Cloud,
    title: "Nuvem de palavras na live",
    text: "O chat passa rápido demais. A nuvem mostra o que a audiência está repetindo agora, com overlay para o OBS.",
  },
  {
    icon: WandSparkles,
    title: "Roteiros a partir dos comentários",
    text: "A AI agrupa pedidos da audiência e gera título, gancho e seções prontos para gravar.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Perguntas em um só lugar",
    text: "Filtre só o que tem interrogação e responda o que realmente trava o inscrito.",
  },
  {
    icon: Sparkles,
    title: "Resumo e sentimento",
    text: "Entenda o clima do vídeo em segundos: o que elogiou, o que criticou e o que pediu.",
  },
  {
    icon: Clapperboard,
    title: "Calendário editorial",
    text: "No Business, os roteiros viram fila de gravação — com variação de ângulo para o mesmo tema.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-3 text-sm font-medium text-red-600">Para criadores no YouTube</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Leia milhares de comentários sem ler milhares de comentários.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            CommentIQ transforma comentários e o chat de lives em filtros, sentimento,
            nuvem de palavras e roteiros do próximo vídeo. O YouTube Studio guarda a
            caixa de entrada — a gente entrega o que a audiência está pedindo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Começar grátis
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Ver planos
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo: demo@commentiq.app / demo12345
          </p>
        </section>

        <section id="funcionalidades" className="border-y bg-muted/30 py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-5">
                <f.icon className="mb-3 size-5 text-red-600" />
                <h2 className="font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold">Três planos. Do canal pequeno ao studio.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { name: "Free", price: "R$ 0", items: ["5 vídeos/mês", "500 comentários", "Filtros e nuvem VOD"] },
              { name: "Pro", price: "R$ 29/mês", items: ["Lives + recap", "Resumo e roteiros AI", "Exportar CSV/PDF"] },
              { name: "Business", price: "R$ 79/mês", items: ["Overlay OBS", "Até 10 canais", "Calendário e comparação"] },
            ].map((p) => (
              <div key={p.name} className="rounded-xl border bg-card p-6">
                <p className="text-sm text-muted-foreground">{p.name}</p>
                <p className="mt-1 text-2xl font-bold">{p.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i}>• {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href="/pricing" className={cn(buttonVariants({ className: "mt-8" }))}>
            Comparar planos
          </Link>
        </section>
      </main>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        CommentIQ — comentários do YouTube viram decisão de conteúdo.
      </footer>
    </div>
  );
}
