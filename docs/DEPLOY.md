# Publicar o CommentIQ (GitHub + Vercel)

Este projeto ainda precisa de um repositório GitHub seu. Depois disso, a Vercel publica o Next.js em cada push.

## 1. Repositório

Repo: [github.com/victorhugoaraujo/youtube-comment-cloud](https://github.com/victorhugoaraujo/youtube-comment-cloud)

Se `main` ainda não estiver nesse GitHub, no seu computador (com login no GitHub):

```bash
git remote add github https://github.com/victorhugoaraujo/youtube-comment-cloud.git
git push -u github main
```

O `.env` **não** entra no git. As chaves da YouTube e da OpenAI ficam no ambiente local e no painel da Vercel.

## 2. Banco na Vercel (obrigatório)

A Vercel é serverless: o SQLite local (`prisma/dev.db`) **não persiste**. Login, histórico e planos sumiriam a cada deploy.

Use um Postgres grátis, por exemplo [Neon](https://neon.tech) ou [Supabase](https://supabase.com):

1. Crie um projeto.
2. Copie a connection string (`postgresql://...`).
3. Avisar aqui com a URL (sem senha no chat, se preferir colar só no painel da Vercel) para trocarmos o Prisma de SQLite para PostgreSQL.

Até essa troca, o site até sobe, mas a conta não é confiável em produção.

## 3. Importar na Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → o repo do GitHub.
2. Framework: **Next.js** (detecta sozinho).
3. Root: `.`
4. Variáveis de ambiente (Production + Preview):

| Nome | Valor |
|---|---|
| `AUTH_SECRET` | string longa (`openssl rand -base64 32`) |
| `APP_URL` | `https://seu-projeto.vercel.app` (ajuste depois do primeiro deploy) |
| `DATABASE_URL` | Postgres (depois da troca do Prisma) |
| `YOUTUBE_API_KEY` | a chave do Google Cloud |
| `OPENAI_API_KEY` | a chave da OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` |

Stripe continua vazio.

5. Deploy.
6. Depois do primeiro domínio, atualize `APP_URL` e faça Redeploy.
7. No Google Cloud, se a API key tiver restrição de IP, use **nenhuma** restrição de aplicativo (a Vercel tem IPs dinâmicos) e restrinja só à YouTube Data API v3.

## 4. Seed da conta demo (opcional)

Depois do Postgres no ar:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npx prisma db seed
```

Ou rode isso no [Vercel CLI](https://vercel.com/docs/cli) com `vercel env pull`.

## 5. Conferir

- `https://seu-projeto.vercel.app` → landing
- `/login` → `demo@commentiq.app` / `demo12345` (se tiver rodado o seed)
- Analisar um vídeo público → badge **YouTube API**
- Resumo AI → OpenAI
