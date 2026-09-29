# CommentIQ

CommentIQ is the domain of a YouTube creator looking at *their own* audience so they can decide what to publish next. The core is **Análise of a recorded Vídeo** (Comentários → Temas → Ideias → Roteiro). It is not a catalog of YouTube videos, not an agency desk, and not a live-studio product.

Live (and Overlay) exist in the product but are **out of the current domain focus** — scale later; do not grow Chat/Nuvem language until then.

## Language

**Criador**:
A pessoa que publica no YouTube e usa o CommentIQ para a audiência dos *próprios* canais. É quem paga.
_Avoid_: User, cliente, conta, agência

**Canal**:
Um canal do YouTube que o Criador opera e **liga** ao CommentIQ. Sem Canal ligado não há Análise de domínio — colar URL solta não basta. No Business, vários Canais ainda são do mesmo Criador.
_Avoid_: brand, página, property, conta Google, OAuth como nome do conceito

**Vídeo**:
O vídeo gravado já publicado **num Canal do Criador** cuja audiência a Análise recorta. O mesmo Vídeo pode ter várias Análises no tempo. Vídeo de terceiro está fora do domínio.
_Avoid_: Análise, conteúdo, publicação, VOD

**Análise**:
Um snapshot da audiência de um **Vídeo** de um **Canal** do Criador naquele puxão (Comentários ingeridos + leitura daquele momento). Reanalisar o mesmo Vídeo depois é outra Análise. Não cobre Live nem URL de terceiro.
_Avoid_: Vídeo, relatório, report, recorte, Análise da live, Histórico

**Live**:
Uma transmissão ao vivo cujo chat o Criador acompanha em tempo real. Não é Análise. **Fora do núcleo** — existe no produto; não modelar nem escalar agora.
_Avoid_: Análise, sessão de Análise, VOD, Overlay como sinônimo, Chat como conceito

**Overlay**:
O recorte da Live que o Criador joga na transmissão. Nasce da Live; não é a Live. Mesmo status: existe, não é o foco.
_Avoid_: widget, browser source, Live, “o OBS”, Nuvem como entidade

**Comentário**:
Uma mensagem pública ingerida numa Análise — primeiro nível ou resposta. O YouTube conta os dois no **Total de comentários** do Vídeo; a Análise só vê os que a API entregou naquele puxão.
_Avoid_: thread, reply como entidade separada, mensagem, o Total de comentários

**Total de comentários**:
O número que o YouTube declara no Vídeo. Inclui o que a Análise ainda não ingeriu. O Criador vê os dois: Total de comentários vs quantos Comentários esta Análise tem.
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
Selo à parte do Sentimento: o Comentário ataca a *pessoa* do Criador. Pode coexistir com negativo (ou até com outro Sentimento). Reclamação do tema não é Hater.
_Avoid_: tóxico, hate speech, “mais negativo”

**Plano**:
O pacote que o Criador escolhe (Free, Pro, Business): o que pode fazer — Lives, quantos Canais, volume. O Criador “está no Pro”.
_Avoid_: tier, SKU, produto

**Assinatura**:
O contrato de pagamento daquele Plano (ativa, atrasada, cancelada). Detalhe do Stripe, não o que o Criador “é”.
_Avoid_: Plano como sinônimo, billing, invoice

**Cota**:
Unidades da API do YouTube, problema de infra. O Criador não “gasta Cota”.
_Avoid_: crédito, quota do plano, uso mensal genérico

**Limite**:
Quantas Análises (e Lives) o Plano deixa no período. É o que o Criador vê: “2 de 10 Análises”.
_Avoid_: Cota, crédito, quota

## Not concepts

These are screens or actions, not nouns in the domain:

- **Histórico** — lista de Análises
- **Comparação** — duas Análises lado a lado
- **Calendário** — Ideias colocadas no tempo
- **Chat / Nuvem** — detalhe de Live; não nomear até a Live ser o foco

## Invariants

- The unit of work is an **Análise** of one **Vídeo**, not a Live session.
- Theme → idea → script only from **Comentários** of an Análise, never from Live chat, until Live is explicitly scaled.
- An Análise belongs to a **Canal** the Criador has linked. Third-party URLs are out of domain.
- **Total de comentários** (YouTube) and the count of **Comentários** in the Análise are different numbers; both are shown.
