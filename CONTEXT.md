# CommentIQ

CommentIQ is the domain of a YouTube creator looking at *their own* audience so they can decide what to publish next. It is not a catalog of YouTube videos and not an agency desk.

## Language

**Criador**:
A pessoa que publica no YouTube e usa o CommentIQ para a audiência dos *próprios* canais. É quem paga.
_Avoid_: User, cliente, conta, agência

**Canal**:
Um canal do YouTube que o Criador opera. No Business, vários Canais ainda são do mesmo Criador.
_Avoid_: brand, página, property

**Vídeo**:
O vídeo gravado já publicado no YouTube cuja audiência a Análise recorta. O mesmo Vídeo pode ter várias Análises no tempo.
_Avoid_: Análise, conteúdo, publicação, VOD

**Análise**:
Um snapshot da audiência de um **Vídeo** naquele puxão (Comentários ingeridos + leitura daquele momento). Reanalisar o mesmo Vídeo depois é outra Análise. Não cobre Live.
_Avoid_: Vídeo, relatório, report, recorte, Análise da live, Histórico

**Live**:
Uma transmissão ao vivo cujo chat o Criador acompanha em tempo real. Não é Análise: fonte, ritmo e tela são outros. Dela nasce o Overlay.
_Avoid_: Análise, sessão de Análise, VOD, Overlay como sinônimo, chat como sinônimo do conceito

**Overlay**:
O recorte da Live que o Criador joga na transmissão (nuvem, leitura do chat) — em geral via OBS. Nasce da Live; não é a Live.
_Avoid_: widget, browser source, Live, “o OBS”

**Comentário**:
Uma mensagem pública ingerida numa Análise — primeiro nível ou resposta. O YouTube conta os dois no total do vídeo.
_Avoid_: thread, reply como entidade separada, mensagem

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
