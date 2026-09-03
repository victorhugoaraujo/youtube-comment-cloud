# CommentIQ — Plano SaaS Completo

> Este documento preserva o plano completo para evolução da POC em produto SaaS.

## Proposta de Valor

Ferramenta SaaS para criadores de conteúdo no YouTube que transforma comentários em insights acionáveis **e em ideias de novos vídeos**. O criador cola a URL, entende o que a audiência está pedindo e gera roteiros prontos para gravar — algo que o YouTube Studio não oferece.

## Planos e Pricing

| | **Free** | **Pro — R$29/mês ou R$290/ano** | **Business — R$79/mês ou R$790/ano** |
|---|---|---|---|
| Vídeos por mês | 5 | Ilimitados | Ilimitados |
| Comentários por vídeo | 500 | Todos | Todos |
| Filtros básicos (texto, data, likes) | Sim | Sim | Sim |
| Análise de sentimento | Limitada | Completa (AI) | Completa (AI) |
| Detecção de perguntas | Sim | Sim | Sim |
| Exportar CSV/PDF | — | Sim | Sim |
| Nuvem de palavras | Sim | Sim | Sim |
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
- Nuvem de palavras mais frequentes

### Pro
- **Exportação CSV/PDF** dos comentários filtrados
- **Resumo AI**: gera um parágrafo resumindo o que a audiência está dizendo (OpenAI)
- **Detecção de spam/haters**: identifica comentários tóxicos ou repetitivos
- **Top comentários**: ranking dos mais relevantes por engajamento
- **Respostas do autor**: filtro para ver apenas threads onde o criador respondeu
- **Histórico**: salva análises anteriores por 30 dias
- **Ideias de vídeo (AI)**: agrupa perguntas e pedidos recorrentes da audiência em temas de próximos vídeos (até 5 gerações/mês)
- **Roteiro AI**: a partir de um tema (ou de um cluster de comentários), gera um roteiro completo — título, gancho, seções, CTA e referências aos comentários que originaram a ideia (até 5 roteiros/mês)

### Business
- **Múltiplos canais**: gerencia até 10 canais em um dashboard
- **Comparação entre vídeos**: compare métricas de comentários entre vídeos
- **Histórico ilimitado**
- **Exportação em lote**
- **Ideias e roteiros ilimitados**
- **Calendário editorial**: fila de roteiros gerados a partir de vários vídeos do canal
- **Variações de roteiro**: gera 2–3 ângulos diferentes para o mesmo tema (ex.: tutorial vs. lista vs. reação)

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

## Arquitetura Técnica

```
Frontend (Next.js)
├── Landing Page
├── Dashboard
├── Pricing Page
└── Auth Pages

API Routes
├── /api/comments      → YouTube Data API v3
├── /api/analysis      → OpenAI (resumo + sentimento)
├── /api/ideas         → OpenAI (clusters de temas a partir dos comentários)
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
3. **OpenAI**: resumo, clustering de temas e geração de roteiros a partir dos comentários
4. **YouTube API**: `commentThreads.list` com paginação
5. **Banco**: Supabase/Postgres para histórico e usuários

## Status atual

- [x] POC com mock data, filtros, stats, nuvem de palavras
- [ ] Landing page
- [ ] Pricing + Stripe
- [ ] Auth
- [ ] YouTube API real
- [ ] Resumo AI
- [ ] Ideias de vídeo a partir dos comentários
- [ ] Geração de roteiro AI
- [ ] Exportação CSV/PDF
