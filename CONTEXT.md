# CommentIQ

CommentIQ is the domain of someone who picks a **Vídeo alvo**, gathers its **Comentários**, and turns what is worth using into **Ideias** and **Roteiros** for the next videos. The core is **Análise** (Comentários → Temas → Ideias → Roteiro). It is not a catalog of YouTube videos, not Shorts analysis, not an agency desk, not a linked-channel product, and not a live-studio product.

Live (and Overlay) exist in the product but are **out of the current domain focus** — scale later; do not grow Chat/Nuvem language until then. **Canal** is also out of the core: a public URL is enough; do not require linking a YouTube channel to run an Análise.

## Language

**Criador**:
A pessoa que usa o CommentIQ para aproveitar Comentários de um Vídeo alvo e gravar o que vem depois. É quem paga.
_Avoid_: User, cliente, conta, agência, dono do canal (como requisito)

**Vídeo alvo**:
O vídeo **longo** público já no YouTube cuja URL entra na Análise. Não precisa ser “do” Criador. O mesmo Vídeo alvo pode ter várias Análises no tempo. Short e Live estão fora.
_Avoid_: Análise, conteúdo, publicação, VOD, Short, Canal, “meu vídeo”

**Análise**:
Um snapshot dos Comentários de um **Vídeo alvo** naquele puxão (ingeridos + leitura daquele momento). Entrada = URL pública. Reanalisar o mesmo Vídeo alvo depois é outra Análise e gasta Limite de novo. Não cobre Live nem Short.
_Avoid_: Vídeo, relatório, report, recorte, Análise da live, Histórico, refresh, Canal

**Canal**:
Fora do núcleo. Ligar um canal do YouTube não autoriza nem bloqueia Análise. Reabrir só se um dia “meus canais” ou Live precisarem.
_Avoid_: brand, property, OAuth, dono, requisito da Análise

**Live**:
Uma transmissão ao vivo cujo chat o Criador acompanha em tempo real. Não é Análise. **Fora do núcleo** — existe no produto; não modelar nem escalar agora.
_Avoid_: Análise, sessão de Análise, VOD, Overlay como sinônimo, Chat como conceito

**Overlay**:
O recorte da Live que o Criador joga na transmissão. Nasce da Live; não é a Live. Mesmo status: existe, não é o foco.
_Avoid_: widget, browser source, Live, “o OBS”, Nuvem como entidade

**Comentário**:
Uma mensagem pública ingerida numa Análise — primeiro nível ou resposta. O YouTube conta os dois no **Total de comentários** do Vídeo alvo; a Análise só vê os que a API entregou naquele puxão.
_Avoid_: thread, reply como entidade separada, mensagem, o Total de comentários

**Total de comentários**:
O número que o YouTube declara no Vídeo alvo. Inclui o que a Análise ainda não ingeriu. O Criador vê os dois: Total de comentários vs quantos Comentários esta Análise tem.
_Avoid_: Comentários, “comentários errados”, alcance

**Tema**:
Um agrupamento de Comentários parecidos com massa (volume ou likes) o bastante para valer um próximo vídeo. Dois Comentários isolados não são Tema.
_Avoid_: cluster, bucket, tag

**Ideia**:
Um título de próximo vídeo, nascido de um Tema. Sem Tema não há Ideia. Agendar no tempo continua sendo Ideia, não “um Calendário”.
_Avoid_: sugestão, pauta, tópico, Calendário

**Roteiro**:
O texto completo para o Criador ler na câmera, gerado a partir de uma Ideia (gancho, blocos falados, CTA).
_Avoid_: outline, pauta, hook sozinho

**Sentimento**:
A leitura do tom de um Comentário: positivo, negativo, pergunta ou spam. É uma classificação, não um ranking.
_Avoid_: score, polaridade, mood

**Hater**:
Selo à parte do Sentimento: o Comentário ataca a *pessoa* de quem publicou o Vídeo alvo. Pode coexistir com negativo. Reclamação do tema não é Hater.
_Avoid_: tóxico, hate speech, “mais negativo”

**Plano**:
O pacote que o Criador escolhe (Free, Pro, Business): o que pode fazer — volume de Análises, Lives. O Criador “está no Pro”.
_Avoid_: tier, SKU, produto, Canal como feature do Plano

**Assinatura**:
O contrato de pagamento daquele Plano (ativa, atrasada, cancelada). Detalhe do Stripe, não o que o Criador “é”.
_Avoid_: Plano como sinônimo, billing, invoice

**Cota**:
Unidades da API do YouTube, problema de infra. O Criador não “gasta Cota”.
_Avoid_: crédito, quota do plano, uso mensal genérico

**Limite**:
Quantas Análises (e Lives) o Plano deixa no período. Cada Análise conta 1 — inclusive reanalisar o mesmo Vídeo alvo. O Criador vê: “2 de 10 Análises”.
_Avoid_: Cota, crédito, quota, “Vídeos distintos”

## Not concepts

These are screens, later work, or exclusions — not nouns of the core:

- **Histórico** — lista de Análises
- **Comparação** — duas Análises lado a lado
- **Calendário** — Ideias colocadas no tempo
- **Chat / Nuvem** — detalhe de Live; não nomear até a Live ser o foco
- **Short** — fora do domínio; não há Análise de Short
- **Canal ligado / OAuth** — não é porta de entrada da Análise

## Invariants

- The unit of work is an **Análise** of one **Vídeo alvo**, entered by public URL.
- Theme → idea → script only from **Comentários** of that Análise.
- Ownership of the YouTube channel is not required and not checked.
- **Canal** does not authorize or deny an Análise.
- **Shorts** and **Live** are out of the core: no Análise of those.
- **Total de comentários** (YouTube) and the count of **Comentários** in the Análise are different numbers; both are shown.
- Reanalisar the same Vídeo alvo creates a new Análise and consumes **Limite** again.
