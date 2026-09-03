# CommentIQ — POC

Aplicação web para analisar e filtrar comentários de vídeos do YouTube. Esta é a **Proof of Concept (POC)** com dados mockados — sem login, sem APIs externas.

## O que faz

- Colar URL de vídeo (simulado) e carregar comentários de demonstração
- **Filtros**: busca por texto/autor, sentimento, apenas perguntas, autor respondeu, período de datas
- **Ordenação**: por likes, data ou número de respostas
- **Estatísticas**: total de comentários, média de likes, perguntas, respostas do autor
- **Sentimento**: positivo, negativo ou neutro (heurística por palavras-chave)
- **Nuvem de palavras (VOD)**: termos mais frequentes nos comentários filtrados
- **Nuvem de palavras em lives** (`/live`): chat simulado em tempo real, termos em alta, perguntas e recap por bloco
- **Overlay OBS** (`/live/overlay`): nuvem em fundo preto para usar como browser source

## Como rodar

```bash
npm install
npm run dev -- -p 4317
```

Abra [http://localhost:4317](http://localhost:4317) (comentários) ou [http://localhost:4317/live](http://localhost:4317/live) (lives).

## Modo demo

- **Comentários**: 40 comentários mockados. Qualquer URL carrega os mesmos dados após ~1,2s.
- **Lives**: ~60 mensagens de chat entram em sequência. Use 1x/2x/3x, pause, recap e o overlay.

## Próximos passos (SaaS completo)

O plano completo (Free/Pro/Business, Stripe, auth, YouTube API real, resumo AI e geração de roteiros) está em [`docs/PLAN.md`](docs/PLAN.md).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
