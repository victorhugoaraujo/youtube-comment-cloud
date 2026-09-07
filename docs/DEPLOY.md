# Publicar o CommentIQ (GitHub + Vercel)

Repo: [github.com/victorhugoaraujo/youtube-comment-cloud](https://github.com/victorhugoaraujo/youtube-comment-cloud)

O `.env` **não** entra no git. As chaves da YouTube e da OpenAI ficam no ambiente local e no painel da Vercel.

## 1. Prisma Postgres na Vercel (obrigatório)

A Vercel é serverless: SQLite não persiste. O banco é **Prisma Postgres**, criado no mesmo login da Vercel (Storage), sem conta extra.

1. No projeto da Vercel, abra **Storage**.
2. **Create Database** → **Prisma Postgres** → região próxima (ex. `iad1` / US East) → plano gratuito.
3. **Connect** no projeto. A Vercel injeta `DATABASE_URL` (`postgres://...`) em Production e Preview.
4. **Custom Prefix:** deixe **vazio**. Não escreva `STORAGE` — isso criaria `STORAGE_URL` e o Prisma não conecta.
5. Se aparecer *“This project already has an existing environment variable with name DATABASE_URL”*:
   1. Cancele o Connect.
   2. **Settings → Environment Variables** → apague o `DATABASE_URL` antigo (placeholder, SQLite `file:./dev.db`, ou valor vazio).
   3. Volte em **Storage → Connect**, prefixo vazio, para a Vercel criar o `DATABASE_URL` certo.
6. Não copie a URL para o GitHub.

O Prisma Postgres na Vercel cria `DATABASE_URL`, `POSTGRES_URL` e `PRISMA_DATABASE_URL`. Se `DATABASE_URL` ficar vazio no **build** (comum na integração), o app usa `POSTGRES_URL` / `PRISMA_DATABASE_URL` na hora do login.

Não apague as variáveis que o Prisma criou. Depois de puxar este commit, faça Redeploy. Confira `https://seu-dominio/api/health` — `keys` deve mostrar `ok` em pelo menos uma URL, sem expor o segredo.

## 2. Variáveis de ambiente

Além do `DATABASE_URL` (automático), em **Settings → Environment Variables** (Production + Preview):

| Nome | Valor |
|---|---|
| `AUTH_SECRET` | string longa (`openssl rand -base64 32`) |
| `APP_URL` | `https://seu-projeto.vercel.app` (ajuste depois do primeiro deploy) |
| `YOUTUBE_API_KEY` | a chave do Google Cloud |
| `OPENAI_API_KEY` | a chave da OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` |

Stripe continua vazio. Não use prefixo `NEXT_PUBLIC_` nessas chaves.

Para analisar um **vídeo real**, `YOUTUBE_API_KEY` precisa estar em Production (YouTube Data API v3 no Google Cloud, sem restrição de IP). Confira em `https://seu-dominio/api/health`: `"youtube": true`. Sem isso o dashboard avisa e cai no dataset de demo.

## 3. Importar na Vercel

1. [vercel.com](https://vercel.com) → Add New → Project → o repo do GitHub.
2. Framework: **Next.js** (detecta sozinho).
3. Root: `.`
4. Confirme o banco Prisma Postgres conectado **antes** do deploy (senão o `migrate deploy` falha).
5. Deploy.
6. Depois do primeiro domínio, atualize `APP_URL` e faça Redeploy.
7. No Google Cloud, se a API key tiver restrição de IP, use **nenhuma** restrição de aplicativo (a Vercel tem IPs dinâmicos) e restrinja só à YouTube Data API v3.

## 4. Seed da conta demo (opcional)

Depois do primeiro deploy, no seu computador:

```bash
npx vercel env pull .env.local
npx prisma db seed
```

Isso cria `demo@commentiq.app` / `demo12345` (plano Pro) no Prisma Postgres. Sem o seed, cadastre pela tela `/register`.

Para desenvolver localmente com o mesmo banco:

```bash
npx vercel env pull .env.local
npm run dev -- -p 4317
```

## 5. Conferir

- `https://seu-projeto.vercel.app` → landing
- `/login` → conta criada no cadastro (ou a demo, se rodou o seed)
- Analisar um vídeo público → badge **YouTube API**
- Resumo AI → OpenAI
