# CommentIQ — Plano SaaS Completo

> Este documento preserva o plano completo para evolução da POC em produto SaaS.

## Proposta de Valor

Ferramenta SaaS para criadores de conteúdo no YouTube que transforma comentários **e o chat de lives** em insights acionáveis **e em ideias de novos vídeos**. O criador cola a URL, entende o que a audiência está pedindo, vê uma nuvem de palavras ao vivo e gera roteiros prontos para gravar — algo que o YouTube Studio não oferece.

## Planos e Pricing

| | **Free** | **Pro — R$29/mês ou R$290/ano** | **Business — R$79/mês ou R$790/ano** |
|---|---|---|---|
| Vídeos por mês | 5 | Ilimitados | Ilimitados |
| Comentários por vídeo | 500 | Todos | Todos |
| Filtros básicos (texto, data, likes) | Sim | Sim | Sim |
| Análise de sentimento | Limitada | Completa (AI) | Completa (AI) |
| Detecção de perguntas | Sim | Sim | Sim |
| Exportar CSV/PDF | — | Sim | Sim |
| Nuvem de palavras (VOD) | Sim | Sim | Sim |
| Nuvem de palavras em live | — | Ao vivo + replay | Ao vivo + replay + overlay OBS |
| Resumo AI dos comentários | — | Sim | Sim |
| Ideias de vídeo a partir dos comentários | — | 5/mês | Ilimitadas |
| Geração de roteiro AI | — | 5/mês | Ilimitados |
| Detecção de spam/haters | — | Sim | Sim |
| Múltiplos canais | — | — | Até 10 |
| Histórico de análises | — | 30 dias | Ilimitado |
| Suporte prioritário | — | — | Sim |

## Funcionalidades Detalhadas

### Core (todos os planos)
- Input de URL/ID do vídeo
- Lista de comentários com avatar, nome, data, likes, texto
- Filtros: busca por texto, ordenação (likes, data, respostas), período, apenas perguntas
- Análise de sentimento (positivo/negativo/neutro) com indicador visual
- Estatísticas: total de comentários, média de likes, distribuição de sentimento
- Nuvem de palavras mais frequentes (vídeos gravados / VOD)

### Pro
- **Exportação CSV/PDF** dos comentários filtrados
- **Resumo AI**: gera um parágrafo resumindo o que a audiência está dizendo (OpenAI)
- **Detecção de spam/haters**: identifica comentários tóxicos ou repetitivos
- **Top comentários**: ranking dos mais relevantes por engajamento
- **Respostas do autor**: filtro para ver apenas threads onde o criador respondeu
- **Histórico**: salva análises anteriores por 30 dias
- **Ideias de vídeo (AI)**: agrupa perguntas e pedidos recorrentes da audiência em temas de próximos vídeos (até 5 gerações/mês)
- **Roteiro AI**: a partir de um tema (ou de um cluster de comentários), gera um roteiro completo — título, gancho, seções, CTA e referências aos comentários que originaram a ideia (até 5 roteiros/mês)
- **Nuvem de palavras em live**: lê o chat da transmissão (`liveChatMessages`) e atualiza a nuvem em tempo quase real; após o encerramento, gera o replay da nuvem e os picos de menção

### Business
- **Múltiplos canais**: gerencia até 10 canais em um dashboard
- **Comparação entre vídeos**: compare métricas de comentários entre vídeos
- **Histórico ilimitado**
- **Exportação em lote**
- **Ideias e roteiros ilimitados**
- **Calendário editorial**: fila de roteiros gerados a partir de vários vídeos do canal
- **Variações de roteiro**: gera 2–3 ângulos diferentes para o mesmo tema (ex.: tutorial vs. lista vs. reação)
- **Overlay OBS**: URL transparente da nuvem para o streamer colocar na live (browser source)
- **Perguntas do chat**: destaca perguntas recorrentes do chat para o streamer responder na hora
- **Recap da live**: após o stream, exporta nuvem, top palavras por bloco de tempo e ideias de vídeo derivadas do chat

### Geração de roteiros (fluxo)

1. A análise agrupa comentários em **temas** (perguntas repetidas, pedidos de tutorial, objeções, nichos).
2. O criador escolhe um tema (ex.: "Como editar thumbnails no CapCut").
3. A AI gera um roteiro com:
   - Título sugerido + 2 alternativas
   - Gancho dos primeiros 15 segundos
   - Seções com tempo estimado
   - Pontos a cobrir, baseados nos comentários reais
   - CTA (inscrição, próximo vídeo, comunidade)
   - Lista dos comentários-fonte (para o criador citar ou responder no vídeo)
4. O criador edita, copia ou exporta o roteiro.

### Nuvem de palavras em lives (fluxo)

O chat de live é outro volume que o Studio não resume: milhares de mensagens por hora, sem filtro de temas.

1. O criador cola a URL da live (ao vivo ou já encerrada com replay de chat).
2. A app obtém o `liveChatId` via YouTube Data API (`videos.list` → `liveStreamingDetails.activeLiveChatId`) e faz polling de `liveChatMessages.list`.
3. Durante a live:
   - A nuvem atualiza a cada poucos segundos com as palavras mais frequentes (stop words removidas, spam/emotes filtrados).
   - Destaque de perguntas (`?`) e termos em alta no bloco recente (ex.: últimos 2 minutos).
   - No Business, uma URL de overlay (fundo transparente) pode ir para o OBS.
4. Depois da live:
   - Replay da nuvem ao longo do tempo (quais palavras explodiram em cada bloco).
   - Recap: top termos, perguntas não respondidas, temas para o próximo vídeo/roteiro.

Limitações da API: o polling interval é definido pelo YouTube; chat replay nem sempre está disponível em lives antigas; quota da Data API é mais agressiva em lives de alto volume — o plano Business prioriza esse uso.

## Arquitetura Técnica

```
Frontend (Next.js)
├── Landing Page
├── Dashboard
├── Pricing Page
└── Auth Pages

API Routes
├── /api/comments      → YouTube Data API v3 (commentThreads)
├── /api/live-chat     → YouTube Data API v3 (liveChatMessages)
├── /api/analysis      → OpenAI (resumo + sentimento)
├── /api/ideas         → OpenAI (clusters de temas a partir dos comentários/chat)
├── /api/scripts       → OpenAI (geração de roteiro a partir de um tema)
├── /api/export        → CSV/PDF
└── /api/webhooks/stripe

Serviços externos
├── YouTube Data API v3
├── Stripe Checkout/Billing
└── OpenAI API
```

## Estrutura de Arquivos (futuro)

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing
│   ├── dashboard/page.tsx          # Dashboard autenticado
│   ├── auth/login/page.tsx
│   ├── auth/register/page.tsx
│   └── api/
│       ├── comments/route.ts
│       ├── live-chat/route.ts
│       ├── analysis/route.ts
│       ├── ideas/route.ts
│       ├── scripts/route.ts
│       ├── export/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── landing/
│   ├── dashboard/
│   ├── pricing/
│   └── ui/
└── lib/
    ├── youtube.ts
    ├── sentiment.ts
    ├── stripe.ts
    └── auth.ts
```

## Decisões para o MVP SaaS

1. **Auth**: NextAuth ou similar
2. **Stripe**: Checkout + webhooks para planos mensais/anuais
3. **OpenAI**: resumo, clustering de temas e geração de roteiros a partir dos comentários (e do recap de lives)
4. **YouTube API**: `commentThreads.list` (VOD) e `liveChatMessages.list` (lives, com polling)
5. **Banco**: Supabase/Postgres para histórico, usuários e snapshots da nuvem de live

## Status atual

- [x] POC com mock data, filtros, stats, nuvem de palavras
- [x] POC nuvem de palavras em lives (chat simulado + overlay)
- [x] Landing page
- [x] Pricing + Stripe (com fallback local)
- [x] Auth
- [x] YouTube API real (com fallback demo)
- [x] Resumo AI
- [x] Ideias de vídeo a partir dos comentários
- [x] Geração de roteiro AI
- [x] Nuvem de palavras em lives (chat ao vivo + replay)
- [x] Overlay OBS da nuvem (Business)
- [x] Exportação CSV/PDF
