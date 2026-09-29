## Problem Statement

O Criador cola a URL de um vídeo para juntar comentários, ver o que dá para aproveitar e sair com ideias e roteiros para os próximos vídeos. Hoje o produto quase faz isso, mas o contrato está errado em pontos que já doeram na prática: o Total de comentários do YouTube não aparece ao lado dos Comentários ingeridos; URL de Short ainda é tratada como Vídeo alvo; reanalisar não está explícito como nova Análise no Limite; Canal e “é meu vídeo” foram um beco sem saída; Business ainda vende canais/overlay em vez de Membros; e quem dispara a Análise não pode ser um Membro gastando o Limite do Criador.

O núcleo acordado no grill (CONTEXT.md, ADRs 0001–0005) ainda não é o contrato da API nem da tela.

## Solution

O fluxo único do núcleo: autenticado, o Criador (ou um Membro no Business) cola a URL pública de um **Vídeo alvo** longo. O sistema cria uma **Análise**: ingere **Comentários**, mostra **Total de comentários** vs quantos entraram, classifica **Sentimento** e **Hater**, agrupa **Temas** com massa, gera **Ideias** só a partir desses Temas e **Roteiros** falados completos. Cada Análise bem-sucedida gasta 1 no **Limite** do mês calendário, inclusive a segunda puxada do mesmo Vídeo alvo. Short e Live não entram. Canal ligado não autoriza nem bloqueia. No Business, Membros compartilham o Limite do Criador.

A costura de teste é o POST que dispara a Análise (e os checks de lib que já existem para Sentimento/Hater e massa de Tema). Membro é testado na mesma costura: identidade autenticada do Membro, Limite do Criador.

## User Stories

1. As a Criador, I want to paste a public long-form YouTube URL, so that I can start an Análise without linking a Canal.
2. As a Criador, I want to paste a video ID as well as a full URL, so that I am not blocked by how I copied the link.
3. As a Criador, I want an Análise of a Vídeo alvo that is not “mine”, so that public Comentários are enough and I do not have to prove ownership.
4. As a Criador, I want the product to refuse a Short URL, so that I do not waste Limite on a format we do not serve.
5. As a Criador, I want the product to refuse a Live URL, so that I am not pulled into a chat session when I asked for an Análise.
6. As a Criador, I want a clear error when the URL is invalid, so that I can fix the paste.
7. As a Criador, I want a clear error when the Vídeo alvo has comments disabled, so that I know it is a YouTube restriction, not a product bug.
8. As a Criador, I want a clear error when the Vídeo alvo is missing or private, so that I know to use a public video.
9. As a Criador, I want a failed Análise (bad URL, Short, Live, YouTube error) not to consume Limite, so that I am not charged for a snapshot that never happened.
10. As a Criador on Free, I want to run up to 5 Análises in the calendar month, so that I can try the core loop.
11. As a Criador on Free, I want a 402-style message when I hit that Limite, so that I know upgrade is the next step.
12. As a Criador on Pro or Business, I want Análises in the month not capped by the old “5 vídeos” Free rule, so that volume matches the Plano.
13. As a Criador, I want a second Análise of the same Vídeo alvo later, so that I get a new snapshot as comments grow.
14. As a Criador, I want that second Análise to consume Limite again, so that I understand I am buying another snapshot, not a free refresh.
15. As a Criador, I want to see the YouTube **Total de comentários** on the Vídeo alvo, so that I know the official count.
16. As a Criador, I want to see how many **Comentários** this Análise actually ingested, so that I am not told the tool “got the number wrong”.
17. As a Criador, I want both numbers visible at once after the POST, so that a truncated pull is honest.
18. As a Criador, I want replies counted as Comentários in the Análise, so that the ingest matches how YouTube totals comments.
19. As a Criador, I want a truncated Análise (plan cap or API pages) to still be a valid Análise, so that a partial snapshot is usable.
20. As a Criador, I want each ingested Comentário classified with Sentimento (positive, negative, question, or spam), so that I can filter the reading.
21. As a Criador, I want Hater to be a separate seal from Sentimento, so that a complaint about the topic is not the same as an attack on the person who published the Vídeo alvo.
22. As a Criador, I want a self-deprecating learning comment that thanks the publisher (“aprendi quebrando a cara com os seus vídeos”) not marked Hater or negative, so that I trust the labels.
23. As a Criador, I want an insult aimed at the publisher marked Hater (and typically negative), so that toxicity is visible.
24. As a Criador, I want spam tagged as spam Sentimento, so that I can ignore it when looking for the next video.
25. As a Criador, I want questions tagged as question Sentimento, so that I can see what the audience is asking.
26. As a Criador, I want Temas built only from Comentários that cluster with enough mass (count or likes), so that two stray remarks do not become a video idea.
27. As a Criador, I want no Ideia when there is no Tema, so that the generator cannot invent a pauta from the video title alone.
28. As a Criador on Pro or Business, I want to generate Ideias from the current Análise’s Comentários, so that I see titles for the next videos.
29. As a Criador on Free, I want Ideia generation blocked with a Plano message, so that Free stays a try-the-Análise tier.
30. As a Criador, I want each Ideia to cite the Tema (support: how many Comentários / likes) and sample quotes, so that I can judge if the audience really asked for it.
31. As a Criador on Pro or Business, I want a full spoken Roteiro from an Ideia (hook, spoken blocks, CTA, description), so that I can read it on camera, not a 15-second outline.
32. As a Criador on Free, I want Roteiro generation blocked with a Plano message.
33. As a Criador, I want generating a Roteiro to consume the Roteiro Limite of the Plano, so that volume is visible.
34. As a Criador, I want generating Ideias to consume the Ideia Limite of the Plano.
35. As a Criador, I want unused Limite of Análises, Ideias, and Roteiros to reset on the first day of the calendar month, so that “this month” means the calendar, not a rolling window.
36. As a Criador, I want the dashboard to show “N of M Análises” for the month when the Plano has a numeric Limite, so that I know how many snapshots I have left.
37. As a Criador, I want starting an Análise to require being logged in, so that Limite is attributed to someone.
38. As a Criador, I want copy and pricing to talk about Análises, Ideias, Roteiros, and (on Business) Membros — not “canais ligados”, VOD, or overlay as the reason to upgrade.
39. As a Criador on Business, I want to invite a Membro by email, so that someone on my team can run the same loop.
40. As a Criador on Free or Pro, I want invite-Membro rejected, so that seats are the Business upgrade.
41. As a Membro, I want to sign in with my own email and run an Análise, so that I do not share the Criador’s password.
42. As a Membro, I want my Análise to increment the Criador’s Análises-used-this-month, so that the team shares one Limite.
43. As a Membro, I want Ideia and Roteiro generation to increment the Criador’s Ideia/Roteiro usage, so that seats are not extra quota.
44. As a Membro, I want to be forbidden from changing Plano, Assinatura, or billing, so that only the Criador pays.
45. As a Membro, I want to be forbidden from inviting other Membros, so that seats stay under the Criador.
46. As a Criador, I want to see which Membros I invited, so that I know who can spend Limite.
47. As a Criador, I want to revoke a Membro, so that they stop running Análises on my Limite.
48. As a Criador, I want Membros to belong only to me, so that this is not an agency login across many clients.
49. As a Criador, I want Canal pages, OAuth, and “save channel” to be irrelevant to starting an Análise, so that paste-URL is enough.
50. As a Criador, I want existing Live/Overlay screens left as they are, so that this spec does not turn into a live-studio project.
51. As a Criador, I want a demo/fallback ingest when YouTube is not configured to still not count as a successful YouTube Análise for marketing claims, so that I am not told those Comentários are “reais” if they are fixtures.
52. As a Criador, I want the Análise response to include an id when the Plano persists history, so that a later Roteiro can attach to that Análise.
53. As a Criador, I want the list of past Análises to show Total de comentários and ingested count, so that history is as honest as the live workspace.
54. As a Criador, I want empty Comentários on a real public video (zero comments) to succeed as an Análise with both counts at 0, so that “no comments” is not an error.
55. As a Criador, I want Cota of the YouTube API never named in the Limite UI, so that I see Análises, not quota units.
56. As a Criador, I want a YouTube API quota/key failure to surface as an integration error, not as “you used your Análises”.
57. As a future implementer, I want tests to hit the Análise POST with YouTube and OpenAI stubbed, so that Short rejection, two counts, Limite, and Membro sharing are proven without the real APIs.
58. As a future implementer, I want the existing sentiment and cluster lib checks to keep passing, so that Hater false positives and two-comment “crypto” Ideias do not regress.

## Implementation Decisions

- Vocabulary is CONTEXT.md. Do not introduce VOD, cluster, credit, quota-of-plan, or Canal-as-gate in user-facing copy or new APIs.
- Respect ADR 0001 (Live is not Análise), ADR 0003 (no Short), ADR 0004 (public Vídeo alvo, Canal out of core), ADR 0005 (Business is Membros sharing calendar-month Limite). ADR 0002 is superseded; do not reintroduce own-Canal checks.
- Primary HTTP contract: authenticated POST that starts an Análise. Body: `{ url }`. Success payload must include: Análise id when persisted; Vídeo alvo identity (id, title, publisher display name, thumbnail, views); **Total de comentários**; **ingested Comentário count**; Comentários (with Sentimento, Hater, likes, dates, reply membership); truncated flag; ingest source (`youtube` vs demo).
- Reject before Limite increment: invalid URL; path `/shorts/`; Live/watch URL that the YouTube metadata says is an active live transmission or a Short (duration proxy ≤ 60s when that is the available signal). Error messages in Portuguese, 4xx.
- Do not require a saved Canal, OAuth, or matching channel id. Publisher name on the Vídeo alvo is display metadata only.
- Limite of Análises is the existing monthly counter on the billing owner (today: videos-used-this-month). Rename in API/UI language to Análises where the Criador sees it. Increment only after a successful ingest (including zero-comment success and truncated success). Reanalysis of the same video id always increments.
- Calendar month key stays year-month; reset counters when the month changes.
- Persist both Total de comentários and ingested count on the Análise record. Stop overwriting “commentCount” to mean only ingest length.
- Sentimento in the Análise API should be readable as the glossary four-way split. Existing flags (question, spam, hater) may remain; map them so the UI can filter “pergunta”, “spam”, and “Hater” without collapsing Hater into “more negative”.
- Keep current Tema clustering thresholds as the definition of mass. Ideia generation must use those Temas, not the raw comment bag plus video title as if title were a Tema. Empty Tema list → empty Ideia list with the existing empty reason.
- Roteiro remains the full spoken document already generated for 8–12 minutes, not a hook-only outline.
- Free: numeric Análise Limite 5, no Ideia, no Roteiro. Pro: Análise unlimited, numeric Ideia/Roteiro caps as today (5/5). Business: those Ideia/Roteiro caps unlimited (null), plus Membros.
- Membros: a Membro is a distinct login linked to one Criador. Session for a Membro uses the Criador’s Plano limits and the Criador’s monthly usage counters for Análises, Ideias, and Roteiros. Membro cannot PATCH billing/plan, cannot invite, cannot revoke others. Criador can list, invite by email, and revoke.
- Invite flow minimum: Criador on Business submits email; Membro registers or logs in with that email and becomes linked; afterwards POST Análise with the Membro session increments the Criador. No agency: a login is either a Criador (owner of an Assinatura) or a Membro of exactly one Criador.
- Do not add a Canal requirement to Membros. Do not build competitor catalogs.
- YouTube and OpenAI remain injectable/stubbable at the module boundary already used by demo mode. Tests must not need live keys.
- Live, Overlay, compare, calendar, export, and the Canais screen are not redesigned here. Pricing/marketing bullets that sell “10 canais” or overlay as the Business headline should be rewritten to Membros + volume of Ideia/Roteiro so the Plano matches ADR 0005. Do not delete Live routes in this spec.
- Demo ingest (no API key) may still return fixture Comentários; the response `source` must stay `demo`, and the workspace must not claim they are real YouTube Comentários.

## Testing Decisions

- Test external behavior only: HTTP responses and the two existing lib check scripts. Do not assert private helpers, SQL, or React internals.
- Highest seam: authenticated POST that creates an Análise, with YouTube (and OpenAI when Ideia/Roteiro are involved) stubbed.
- Cases on that seam: valid public long-form URL succeeds without any Canal row; `/shorts/` URL 4xx and Limite unchanged; Live URL 4xx and Limite unchanged; success returns Total de comentários ≥ ingested count; truncated flag when totals differ; second POST of the same video id increments Análise usage; 6th Análise on Free is 402; YouTube stub 502 does not increment Limite; Membro session increments the Criador’s usage, not a separate Free bucket; Membro cannot hit billing.
- Keep running `test:lib` (sentiment/Hater learning-comment case; cluster rejects a 2-comment crypto Tema). Extend those checks only if a new false-positive class is specified; do not replace them with UI tests.
- Prior art: `sentiment.check.ts` and `comment-clusters.check.ts` invoked by `test:lib`. New Análise-POST tests should follow the same “assert observable result or throw” style, or the smallest HTTP test harness the repo already allows — do not add a second test framework unless one is required to hit the route.
- Do not use the browser or Live overlay as a required gate for this spec.

## Out of Scope

- Scaling Live, Overlay, OBS, chat, or word-cloud-as-entity (ADR 0001).
- Análise of Shorts (ADR 0003).
- YouTube OAuth, Canal as a gate, “meus canais”, or competitor-intelligence features (ADR 0004).
- Agency (one login, many Criadores).
- Per-seat Limite (domain: one shared bucket).
- Rolling 30-day windows or anniversary-year Limite.
- Redesign of compare, calendar, history, or export beyond showing the two comment numbers.
- Changing Stripe prices or adding a new Plano SKU.
- Rewriting OpenAI prompts except where needed so Ideias require Temas and Roteiros stay full spoken scripts.
- i18n into English UI.

## Further Notes

Glossary and decisions live in `CONTEXT.md` and `docs/adr/`. If implementation language drifts (“vídeo analisado”, “créditos”, “quota do plano”, “refresh”), stop and use Análise / Limite / Vídeo alvo.

Confirmed test seams before writing this spec: one primary seam (Análise POST) plus the existing lib checks; Membros only through that seam (shared Limite).
