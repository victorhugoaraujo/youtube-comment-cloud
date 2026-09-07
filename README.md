# CommentIQ

SaaS para criadores no YouTube: filtrar comentários, nuvem de palavras em lives, resumo AI e roteiros a partir da audiência.

## Publicar (GitHub + Vercel)

O passo a passo está em [`docs/DEPLOY.md`](docs/DEPLOY.md). Resumo:

1. Envie o código para [github.com/victorhugoaraujo/youtube-comment-cloud](https://github.com/victorhugoaraujo/youtube-comment-cloud) (`git push`).
2. Importe o repo na [Vercel](https://vercel.com).
3. No projeto da Vercel: **Storage → Prisma Postgres → Connect**, prefixo vazio (injeta `DATABASE_URL`). Se a Vercel reclamar que `DATABASE_URL` já existe, apague a variável antiga em Settings e conecte de novo.
4. Configure as outras env vars (`AUTH_SECRET`, `APP_URL`, `YOUTUBE_API_KEY`, `OPENAI_API_KEY`).

## Como rodar

```bash
cp .env.example .env
# cole o DATABASE_URL do Prisma Postgres (Vercel Storage → Connect)
# ou: npx vercel env pull .env.local
npm install
npx prisma generate
npx prisma migrate deploy
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

Stripe está **adiado**. Ativar Pro/Business na conta libera as features sem cobrança. As variáveis `STRIPE_*` no `.env.example` ficam para quando formos ligar o checkout.

Também: `AUTH_SECRET`, `DATABASE_URL` (Prisma Postgres), `APP_URL`.

## Planos

- **Free** — 5 vídeos/mês, 500 comentários, filtros e nuvem VOD
- **Pro (R$ 29/mês ou R$ 290/ano)** — lives, AI, exportação, histórico 30 dias
- **Business (R$ 79/mês ou R$ 790/ano)** — overlay OBS, 10 canais, comparação, calendário

Detalhes em [`docs/PLAN.md`](docs/PLAN.md).

## Stack

Next.js 16, TypeScript, Tailwind, shadcn/ui, Prisma + Prisma Postgres, YouTube Data API, OpenAI.
