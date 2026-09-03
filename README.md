# CommentIQ — POC

Aplicação web para analisar e filtrar comentários de vídeos do YouTube. Esta é a **Proof of Concept (POC)** com dados mockados — sem login, sem APIs externas.

## O que faz

- Colar URL de vídeo (simulado) e carregar comentários de demonstração
- **Filtros**: busca por texto/autor, sentimento, apenas perguntas, autor respondeu, período de datas
- **Ordenação**: por likes, data ou número de respostas
- **Estatísticas**: total de comentários, média de likes, perguntas, respostas do autor
- **Sentimento**: positivo, negativo ou neutro (heurística por palavras-chave)
- **Nuvem de palavras**: termos mais frequentes nos comentários filtrados

## Como rodar

```bash
npm install
npm run dev -- -p 4317
```

Abra [http://localhost:4317](http://localhost:4317).

## Modo demo

A POC usa 40 comentários mockados de um vídeo fictício sobre crescimento no YouTube. Qualquer URL funciona — o botão "Analisar comentários" sempre carrega os mesmos dados de demonstração após ~1,2s.

## Próximos passos (SaaS completo)

O plano completo (Free/Pro/Business, Stripe, auth, YouTube API, resumo AI e geração de roteiros a partir dos comentários) está em [`docs/PLAN.md`](docs/PLAN.md).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide icons
