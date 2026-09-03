# CommentIQ

SaaS para criadores no YouTube: filtrar comentários, nuvem de palavras em lives, resumo AI e roteiros a partir da audiência.

## Como rodar

```bash
cp .env.example .env
# gere um AUTH_SECRET e, se quiser, preencha as chaves abaixo
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev -- -p 4317
```

Conta demo: `demo@commentiq.app` / `demo12345` (plano Pro).

## Integrações

Todas as rotas estão ligadas. Sem chave, a app **não quebra** — cai em fallback:

| Variável | O que liga | Sem chave |
|---|---|---|
| `YOUTUBE_API_KEY` | Comentários e chat de live (Data API v3) | Dataset de demonstração |
| `OPENAI_API_KEY` | Resumo, ideias e roteiros | Heurística / templates |
| `STRIPE_SECRET_KEY` + price IDs | Checkout mensal/anual | Ativa o plano localmente |

Também: `AUTH_SECRET`, `DATABASE_URL` (SQLite por padrão), `APP_URL`, `STRIPE_WEBHOOK_SECRET`.

## Planos

- **Free** — 5 vídeos/mês, 500 comentários, filtros e nuvem VOD
- **Pro (R$ 29/mês ou R$ 290/ano)** — lives, AI, exportação, histórico 30 dias
- **Business (R$ 79/mês ou R$ 790/ano)** — overlay OBS, 10 canais, comparação, calendário

Detalhes em [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Next.js 16, TypeScript, Tailwind, shadcn/ui, Prisma/SQLite, YouTube Data API, OpenAI, Stripe.
