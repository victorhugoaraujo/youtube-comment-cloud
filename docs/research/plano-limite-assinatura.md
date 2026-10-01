# O que o repositório afirma hoje sobre Plano, Limite e Assinatura

Levantamento das fontes primárias em `origin/main` (`0b0da2c`). Cada frase abaixo é o que a fonte citada afirma. Não há escolha de oferta.

As issues [11](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/11) e [12](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/12) trazem critérios no corpo e, no mesmo fio, um comentário do autor dizendo que esse texto é proposta, não a decisão. O mapa [16](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/16) repete isso: o texto delas hoje é proposta, não a oferta. Os critérios continuam no corpo; este arquivo os registra ao lado do glossário, dos ADRs, da spec, do plano de produto e do código.

## Plano

`CONTEXT.md` define **Plano** como o pacote que o Criador escolhe: Free, Pro, Business. Free e Pro são volume (Limite de Análises, Ideias, Roteiros). Business é esse volume e **Membros**. O Criador “está no Business”. Evitar: tier, SKU, produto, Canal como feature do Plano, agência. O **Criador** paga a Assinatura e escolhe o Plano; no Business pode convidar Membros, que são daquele Criador, não de vários clientes. O **Membro** não paga e não troca o Plano.

`docs/adr/0005-business-is-membros.md` afirma que Business vende assentos: o Criador naquele Plano convida Membros que rodam Análise, Ideia e Roteiro. Não é mesa de agência. Canal fica fora do núcleo (ADR 0004); o upgrade são pessoas no mesmo Limite.

`docs/adr/0001-core-is-recorded-video-analysis.md`, `docs/adr/0002-analise-only-own-canais.md` e `docs/adr/0003-no-analise-of-shorts.md` não nomeiam Free, Pro, Business, preço nem teto. ADR 0002 está superseded por ADR 0004. `docs/adr/0004-analise-is-public-video-alvo.md` diz que ingest e UI aceitam qualquer URL longa pública “within plan Limite”, sem número e sem lista de planos.

`docs/specs/analise-video-alvo.md` pede três planos no contrato do núcleo (Implementation Decisions): Free com Limite numérico de Análise 5, sem Ideia e sem Roteiro; Pro com Análise ilimitada e tetos numéricos de Ideia/Roteiro “as today (5/5)”; Business com esses tetos de Ideia/Roteiro ilimitados (`null`) e Membros. A spec diz que convite de Membro é recusado em Free e Pro, e que copy de preço deve falar de Análises, Ideias, Roteiros e, no Business, Membros — não de canais ligados, VOD ou overlay como motivo de upgrade. Fora de escopo: mudar preços do Stripe ou acrescentar um SKU de Plano. O Problem Statement da mesma spec descreve o produto de então como ainda vendendo canais/overlay em vez de Membros.

`docs/PLAN.md` (tabela “Planos e Pricing”) afirma três colunas:

| | Free | Pro — R$29/mês ou R$290/ano | Business — R$79/mês ou R$790/ano |
|---|---|---|---|
| Vídeos por mês | 5 | Ilimitados | Ilimitados |
| Comentários por vídeo | 500 | Todos | Todos |
| Ideias | — | 5/mês | Ilimitadas |
| Roteiros | — | 5/mês | Ilimitados |
| Histórico | — | 30 dias | Ilimitado |
| Canais | — | — | Até 10 |
| Live | nuvem VOD no núcleo; live só a partir do Pro | ao vivo + replay | ao vivo + replay + overlay OBS |

O mesmo arquivo lista no Business: múltiplos canais, comparação, histórico ilimitado, exportação em lote, ideias e roteiros ilimitados, calendário editorial, variações de roteiro, overlay OBS, perguntas do chat e recap da live. Não nomeia Membros. Diz que o plano Business prioriza o uso de quota da Data API em lives de alto volume. Status: “Pricing (ativação de plano local; Stripe adiado)”.

`README.md` resume: Free — 5 vídeos/mês, 500 comentários, filtros e nuvem VOD; Pro (R$ 29/mês ou R$ 290/ano) — lives, AI, exportação, histórico 30 dias; Business (R$ 79/mês ou R$ 790/ano) — overlay OBS, 10 canais, comparação, calendário. Detalhes apontam para `docs/PLAN.md`. Conta demo `demo@commentiq.app` no plano Pro.

A issue [11](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/11) (“Fase 5: Teto do mês”) fala em Grátis e Pro. Quem define o Plano nessa fatia é a conta; a cobrança que troca o Plano vem na fatia seguinte. Não menciona Business nem Membros. No Pro, estourar o teto não oferece nível acima.

A issue [12](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/12) (“Fase 5: Cobrar o Pro”) afirma que a página de preços mostra só Grátis e Pro, sem Business, Membros nem ilimitado. Pro custa R$ 29 por mês ou R$ 290 por ano. Grátis permanece R$ 0.

`src/lib/plans.ts` declara `PlanId = "free" | "pro" | "business"`, rótulos Free, Pro, Business, e `PLAN_PRICES`: Pro 29 mensal / 290 anual, Business 79 mensal / 790 anual. Não há preço de Free no objeto (a página trata Free como R$ 0).

`src/app/pricing/page.tsx` mostra os três planos, com Free a R$ 0, e Pro/Business a partir de `PLAN_PRICES`, em “R$/mês” ou “R$/ano”. O botão pago diz “Ativar plano”. O rodapé diz que cobrança com Stripe fica para depois e que ativar o plano só libera as features na conta. Bullets dessa página: Free — 5 Análises por mês calendário, até 500 Comentários por Análise; Pro — Análises ilimitadas, até 5 mil Comentários por Análise, “Ideias e 5 Roteiros por mês”, resumo AI, exportação, histórico de 30 dias; Business — tudo do Pro, Membros no mesmo Limite, Ideias e Roteiros ilimitados, variações de Roteiro, histórico ilimitado.

`src/app/page.tsx` repete três planos: Free R$ 0 (5 Análises/mês, 500 comentários); Pro R$ 29/mês (Análises ilimitadas, “Ideias e 5 roteiros/mês”); Business R$ 79/mês (Membros no mesmo Limite, ideias e roteiros ilimitados, histórico completo). O título da seção é “Três planos. Do canal pequeno ao studio.”

`src/app/register/page.tsx` diz que a conta começa no plano Free, sem cartão. `src/app/api/auth/route.ts` grava `plan: "free"` no cadastro. `prisma/schema.prisma` tem `plan String @default("free")`. `prisma/seed.ts` grava o usuário demo com `plan: "pro"`.

## Limite

`CONTEXT.md` define **Limite** como quantas Análises (e Lives) o Plano deixa no mês calendário. Cada Análise conta 1, inclusive reanalisar o mesmo Vídeo alvo. Criador e Membros gastam o mesmo Limite. O exemplo de tela é “2 de 10 Análises”. Evitar: Cota, crédito, quota, “Vídeos distintos”, janela rolante. Invariantes: reanalisar cria outra Análise e consome Limite de novo; o Limite zera no mês calendário; Criador e Membros compartilham esse Limite. **Cota** é unidade da API do YouTube, problema de infra; o Criador não “gasta Cota”. O mesmo glossário, na entrada Plano, fala em Limite de Análises, Ideias e Roteiros. A definição da palavra Limite nomeia Análises e Lives, não Ideias nem Roteiros. “2 de 10” é o exemplo de frase, não o teto de um plano nomeado.

ADR 0005 afirma um Limite compartilhado que zera no mês calendário. ADR 0004 só diz “within plan Limite”.

`docs/specs/analise-video-alvo.md` afirma, no Solution e nas user stories / implementation decisions:

- Cada Análise bem-sucedida gasta 1 no Limite do mês calendário, inclusive a segunda puxada do mesmo Vídeo alvo. Short e Live não entram nessa Análise. Falha (URL inválida, Short, Live, erro do YouTube) não consome Limite.
- Free: até 5 Análises no mês; a sexta é mensagem estilo 402. Pro e Business não ficam no teto antigo de “5 vídeos”.
- Gerar Ideia consome o Limite de Ideia do Plano; gerar Roteiro consome o Limite de Roteiro. Free bloqueia os dois com mensagem de Plano. Pro e Business geram os dois, com tetos 5/5 no Pro e `null` no Business.
- O saldo não usado de Análises, Ideias e Roteiros zera no dia 1 do mês calendário, não numa janela rolante.
- Com teto numérico, o dashboard mostra “N of M Análises”.
- Membro incrementa os contadores do Criador (Análises, Ideias, Roteiros). Um Limite compartilhado; Limite por assento está fora de escopo, assim como janela de 30 dias rolantes ou ano-aniversário para o Limite.
- O contador de Análises é o contador mensal já existente no dono da cobrança (`videos-used-this-month`), renomeado para Análises onde o Criador vê. Incremento só depois de ingest bem-sucedido, inclusive zero comentários e puxada truncada.
- Cota da API do YouTube não aparece na UI de Limite. Falha de quota/chave é erro de integração, não “você usou suas Análises”.

A issue [11](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/11) afirma outro par de tetos, no mês calendário, fuso de Brasília: Grátis 5 Análises e 1 Roteiro; Pro 30 Análises e 12 Roteiros. Cada teto trava só o próprio ato. A tela mostra os dois gastos. Ideia não é saldo. O aviso diz que volta no dia 1. O mês vira no dia 1 em Brasília, mesmo que a cobrança caia noutro dia. Refino de um Roteiro já contado não gasta outra unidade. No Pro, estourar o teto não oferece nível acima; o ato espera o dia 1. A sexta Análise no Grátis é recusada e as já abertas continuam legíveis. O segundo Roteiro no Grátis é recusado, e uma puxada nova continua possível se ainda houver Análise.

A issue [12](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/12) reafirma 5 e 1 no Grátis e 30 e 12 no Pro, inclusive em cada mês do anual, sem somar os doze meses. Sem pagamento confirmado, a conta permanece no Grátis com 5 e 1. Subir para o Pro na hora mantém o gasto do mês e passa os tetos para 30 e 12. Descer no mensal vale no dia 1; se o gasto já passou de 5 ou de 1, o ato novo espera o dia 1.

### O que o código aplica

`src/lib/plans.ts` (`PLAN_LIMITS`):

| Campo | free | pro | business |
|---|---|---|---|
| `videosPerMonth` | 5 | `null` | `null` |
| `commentsPerVideo` | 500 | 5000 | 5000 |
| `aiIdeas` | 0 | 5 | `null` |
| `aiScripts` | 0 | 5 | `null` |
| `historyDays` | 0 | 30 | `null` |
| `maxChannels` | 1 | 1 | 10 |
| `liveChat` | false | true | true |
| `overlay` | false | false | true |
| `export` | false | true | true |
| `aiSummary` | false | true | true |
| `spamDetection` | false | true | true |
| `compare` / `calendar` / `scriptVariations` | false | false | true |

`null` em vídeos, ideias, roteiros e histórico é o ramo “sem teto numérico” nos `if` de `src/lib/analise.ts`, `src/app/api/ideas/route.ts`, `src/app/api/scripts/route.ts` e `src/app/api/history/route.ts`.

- Análise: `src/lib/analise.ts` recusa com 402 quando `videosPerMonth !== null` e `videosUsedMonth` já atingiu esse número. A mensagem está fixa: “limite de 5 Análises neste mês no plano Free. Faça upgrade para o Pro.” O incremento de `videosUsedMonth` no `billingOwnerId` ocorre depois da ingest e de `assertVideoIsAlvo`. Não há ramo que deixe de contar uma segunda Análise do mesmo vídeo. Não há contador de Live nesse incremento.
- Ideias: `src/app/api/ideas/route.ts` responde 403 se `aiIdeas === 0` (“Ideias de vídeo entram no plano Pro.”) e 402 se o uso mensal atingiu um teto não nulo (“Você usou as 5 gerações de ideias deste mês.”). Incrementa `ideasUsedMonth` do `billingOwnerId` quando a geração devolve ideias.
- Roteiros: `src/app/api/scripts/route.ts` responde 403 se `aiScripts === 0` e 402 ao atingir o teto (“Você usou os 5 roteiros deste mês.”). Cada POST bem-sucedido incrementa `scriptsUsedMonth`. Não há exceção de refino no arquivo.
- Mês: `currentUsageMonth` em `src/lib/plans.ts` é `ano-mês` de `Date#getFullYear` / `getMonth` (fuso do processo). `src/lib/auth.ts` zera `videosUsedMonth`, `ideasUsedMonth` e `scriptsUsedMonth` quando `usageMonth` difere desse valor. Não cita Brasília.
- Histórico: `src/app/api/history/route.ts` devolve lista vazia e `locked` se `historyDays === 0`. Se o número é finito, filtra `createdAt >= agora - historyDays * 86400000` (janela rolante). `null` não aplica esse corte. Persistir a Análise em `src/lib/analise.ts` depende de `historyDays !== 0`.
- Comentários por Análise: o teto `commentsPerVideo` é o `max` passado ao fetch em `src/lib/analise.ts`.
- Lives: `src/app/api/live-chat/route.ts` exige plano mínimo Pro (`requirePlan`). `src/components/dashboard/live-workspace.tsx` bloqueia a UI se `limits.liveChat` é falso. Nenhum dos dois incrementa os contadores mensais.
- Canais: `src/app/api/channels/route.ts` exige Business e recusa com “Limite de 10 canais no plano Business.” A contagem usa `userId: user.id` (o ator da sessão), não `billingOwnerId`.
- Overlay: `src/app/api/overlay/[token]/route.ts` responde 403 se `plan !== "business"` (“Overlay OBS é exclusivo do plano Business.”).
- Exportação e resumo AI exigem Pro (`src/app/api/export/route.ts`, `src/app/api/analysis/route.ts`). Comparar e agendar roteiro exigem Business (`src/app/api/compare/route.ts`, `src/app/api/scripts/schedule/route.ts`). A navegação em `src/components/dashboard/shell.tsx` esconde Lives, Histórico e Ideias abaixo de Pro, e Calendário, Membros, Canais e Comparar abaixo de Business.
- `spamDetection` só aparece em `src/lib/plans.ts`. Nenhum outro arquivo em `src/` lê o campo.
- A tela de Análise (`src/components/dashboard/video-workspace.tsx`) mostra `usadas/teto Análises no mês` quando o plano é `free` e `videosPerMonth` não é nulo. A conta (`src/app/dashboard/account/account-client.tsx`) mostra os três contadores crus (“Uso no mês: N Análises · N Ideias · N Roteiros”), sem o denominador, e acrescenta “Limite do Criador” se `role === "membro"`.

Membro: `src/lib/auth.ts` carrega plano, intervalo e os três contadores do usuário em `ownerUserId` quando esse campo existe, e marca `role` `membro` ou `criador`. `src/lib/access.ts` recusa Membro em Plano/Assinatura (403) e recusa convite fora de `plan === "business"`. `src/lib/members.ts` impede convidar um email que já é Membro de outro Criador, ou uma conta já `pro`, `business`, ou com `stripeSubscriptionId`. `prisma/schema.prisma` modela isso com `ownerUserId` e `MemberInvite`.

## Assinatura

`CONTEXT.md` define **Assinatura** como o contrato de pagamento daquele Plano, com estados ativa, atrasada, cancelada. É detalhe do Stripe, não o que o Criador “é”. Evitar usar Plano como sinônimo, e evitar billing e invoice como nome do conceito. O Membro não paga.

ADR 0005 afirma que o Criador continua pagando e é dono da Assinatura.

A spec diz que só o Criador altera Plano, Assinatura ou billing; o Membro não pode. Um login é Criador (dono de uma Assinatura) ou Membro de exatamente um Criador. Fora de escopo: mudar preços do Stripe.

`docs/PLAN.md` afirma: pagamento com Stripe adiado; por agora o plano é ativado na conta, sem cobrança. A arquitetura lista Checkout/Billing e `/api/webhooks/stripe`. `README.md` repete: Stripe adiado; ativar Pro/Business libera as features sem cobrança; variáveis `STRIPE_*` ficam para o checkout. `docs/DEPLOY.md` diz “Stripe continua vazio.” `.env.example` deixa vazios `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` e quatro price ids (Pro e Business, mensal e anual).

A issue [11](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/11) separa a fatia: a conta define o Plano; a cobrança que troca o Plano é a fatia seguinte. A issue [12](https://github.com/victorhugoaraujo/youtube-comment-cloud/issues/12) afirma cobrança pelo Stripe, em reais: sem pagamento confirmado a conta fica no Grátis; subir vale na hora e cobra o preço cheio do período; descer no mensal vale no dia 1; no anual o Pro dura até o fim do período pago; descer no anual entra no dia 1 seguinte ao fim desse período, sem devolver o que já foi pago; renovação que falha mantém o Pro até o fim do período já pago e cai para o Grátis no dia 1 seguinte.

O código não tem campo de estado ativa / atrasada / cancelada. `prisma/schema.prisma` guarda `plan`, `planInterval`, `stripeCustomerId`, `stripeSubscriptionId`.

`src/app/api/billing/route.ts`: Membro é barrado por `assertCanManageBilling`. Portal exige `stripeCustomerId`. Checkout de `free` é recusado (“Escolha Pro ou Business.”). Se a ação é `dev-upgrade` ou `getStripe()` é nulo, o handler grava `plan` e `planInterval` na hora e responde `mode: "local"`. Se o Stripe existe mas `createCheckoutSession` não devolve URL (sem price id), também grava o plano localmente. Com URL, responde `mode: "stripe"` e não grava o plano nesse request.

`src/lib/stripe.ts` só cria sessão se houver secret e price id de ambiente. Checkout é `mode: "subscription"`, quantidade 1, metadata `userId`, `plan`, `interval`.

`src/app/api/webhooks/stripe/route.ts`: sem secret, responde `skipped`. Em `checkout.session.completed`, grava plano, intervalo, customer e subscription. Em `customer.subscription.deleted`, grava `plan: "free"`, `planInterval: null`, `stripeSubscriptionId: null` na hora. Não há ramo para fatura atrasada nem para esperar o dia 1 ou o fim do período pago.

`src/app/pricing/page.tsx` e `src/app/dashboard/account/account-client.tsx` disparam esse checkout. A conta diz, para Membro: “Só o Criador altera Plano e Assinatura.” `src/app/dashboard/membros/page.tsx` diz que Membros não alteram Plano nem Assinatura e gastam o Limite do Criador.

## Onde as fontes discordam

Não há desempate aqui. Os pontos abaixo são o desacordo literal.

1. **Quais Planos existem.** Free, Pro e Business estão no glossário, no ADR 0005, na spec, em `docs/PLAN.md`, no README, em `src/lib/plans.ts`, na landing e na página de preços. As issues 11 e 12 falam só em Grátis e Pro. A 12 diz que a página de preços mostra só esses dois, sem Business, Membros nem ilimitado. A página em `src/app/pricing/page.tsx` mostra três, com Business, Membros e Análises ilimitadas no Pro.

2. **O que Business inclui.** Glossário, ADR 0005, spec (Solution e Implementation Decisions), página de preços, landing e `src/app/dashboard/membros/page.tsx`: Membros no Limite do Criador. `docs/PLAN.md` e `README.md`: até 10 canais, overlay OBS, comparação, calendário; não citam Membros. O Problem Statement da spec diz que o produto ainda vende canais/overlay em vez de Membros. O código faz as duas coisas: Membros em `src/lib/members.ts` e, ao mesmo tempo, teto de 10 canais, overlay só Business, e telas de Canais, Comparar e Calendário no Business (`PLAN_LIMITS`, `src/app/api/channels/route.ts`, `src/app/api/overlay/[token]/route.ts`, `src/components/dashboard/shell.tsx`).

3. **Teto de Análise no mês.** Free/Grátis = 5 em CONTEXT (sem número no glossário; o 5 está na spec), na spec, em PLAN.md (“5 vídeos”), no README (“5 vídeos”), nas issues 11 e 12, e em `videosPerMonth: 5`. Pro e Business = ilimitados (`null`) na spec, em PLAN.md, na landing, na página de preços e no código. Issues 11 e 12: Pro = 30 Análises no mês, e não há Business. CONTEXT exemplifica a frase “2 de 10 Análises” sem amarrar 10 a um plano.

4. **O que entra no Limite.** CONTEXT, definição de Limite: Análises e Lives, mês calendário, uma unidade por Análise. CONTEXT, definição de Plano: volume de Análises, Ideias e Roteiros. Spec: três saldos (Análise, Ideia, Roteiro); Live não é Análise e não consome esse Limite. Issue 11: dois tetos (Análise e Roteiro); Ideia não é saldo; Lives não entram no texto. Código: três contadores mensais; Live é booleano de plano (`liveChat`), sem incremento mensal. PLAN.md conta “vídeos por mês”, comentários por vídeo, ideias, roteiros, histórico em dias e canais, mais live/overlay como features.

5. **Números de Ideia e Roteiro.** Spec e `PLAN_LIMITS`: Free 0 e 0; Pro 5 e 5; Business ilimitado (`null`). PLAN.md: Pro 5 ideias e 5 roteiros por mês; Business ilimitados; Free sem essas linhas. Landing e pricing dizem, no Pro, “Ideias e 5 Roteiros por mês” / “Ideias e 5 roteiros/mês”, sem escrever “5 ideias”. Issue 11: Grátis 1 Roteiro; Pro 12 Roteiros; Ideia não é saldo. O código bloqueia o segundo roteiro no Free porque o teto é 0, não 1, e bloqueia ideias no Free e na 6ª geração do Pro.

6. **Comentários por Análise.** PLAN.md: Free 500, Pro e Business “Todos”. README: Free 500, sem teto explícito no Pro. Código e página de preços: Free 500, Pro e Business 5000.

7. **Quando o mês vira.** CONTEXT, ADR 0005 e spec: mês calendário, sem fuso nomeado. Spec: dia 1, não janela rolante, e rejeita janela de 30 dias para o Limite. Issue 11: dia 1 no fuso de Brasília, independente do dia da cobrança. Código: string `YYYY-MM` do relógio local do processo (`currentUsageMonth`), sem `America/Sao_Paulo`. O histórico de 30 dias do Pro é outra regra: `src/app/api/history/route.ts` corta por `Date.now() - 30 dias`, alinhado à coluna “30 dias” de PLAN.md e do README, não ao mês calendário do Limite.

8. **Reanálise e refino.** CONTEXT, spec e `src/lib/analise.ts`: outra Análise do mesmo vídeo conta de novo. Issue 11: refino de Roteiro já contado não gasta outra unidade. `src/app/api/scripts/route.ts` incrementa em todo POST bem-sucedido, sem ramo de refino.

9. **Se a Assinatura cobra.** CONTEXT: contrato Stripe com estados ativa, atrasada, cancelada. Issue 12: Stripe cobra R$ 29 ou R$ 290; sem pagamento confirmado a conta fica no Grátis; falha de renovação mantém o Pro até o fim do período pago e só então cai no dia 1. PLAN.md, README, DEPLOY.md e o rodapé de `src/app/pricing/page.tsx`: Stripe adiado; ativar o plano não cobra. `src/app/api/billing/route.ts` grava Pro ou Business na conta quando não há chave ou não há price id. O webhook só trata checkout completo (sobe o plano) e subscription apagada (cai para `free` na hora). Não há estado “atrasada” no schema nem no webhook.

10. **Preço em reais.** Pro R$ 29/mês e R$ 290/ano coincidem em PLAN.md, README, issue 12, `PLAN_PRICES` e na página de preços. A landing mostra só “R$ 29/mês” para o Pro. Business R$ 79/mês e R$ 790/ano estão em PLAN.md, README, `PLAN_PRICES`, landing (só o mensal) e página de preços. CONTEXT, ADR 0005 e a spec não fixam valor. A issue 12 não precifica Business porque o exclui. A spec marca mudança de preço Stripe como fora de escopo.
