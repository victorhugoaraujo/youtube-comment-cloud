import type { Comment } from "@/types";
import { isQuestion } from "@/lib/filters";
import { clusterComments, minSupportLabel, type CommentCluster } from "@/lib/comment-clusters";

export interface VideoIdea {
  id: string;
  title: string;
  reason: string;
  commentIds: string[];
  sampleComments: string[];
  supportCount?: number;
  totalLikes?: number;
}

export interface VideoScript {
  title: string;
  alternativeTitles: string[];
  durationTarget?: string;
  hook: string;
  intro?: string;
  sections: Array<{
    heading: string;
    duration: string;
    spoken?: string;
    points: string[];
  }>;
  cta: string;
  description?: string;
  sourceComments: string[];
  variations?: Array<{ angle: string; title: string; hook: string }>;
}

function ideaFromCluster(cluster: CommentCluster, title: string, total: number): VideoIdea {
  const share = Math.max(1, Math.round((cluster.count / Math.max(total, 1)) * 100));
  return {
    id: cluster.id,
    title,
    reason: `${cluster.count} comentários parecidos (${share}% desta análise) · ${cluster.totalLikes} likes · ${cluster.questionCount} perguntas`,
    commentIds: cluster.comments.slice(0, 12).map((c) => c.id),
    sampleComments: cluster.samples,
    supportCount: cluster.count,
    totalLikes: cluster.totalLikes,
  };
}

function fallbackIdeas(comments: Comment[]): VideoIdea[] {
  const clusters = clusterComments(comments);
  return clusters.map((cluster) =>
    ideaFromCluster(
      cluster,
      `Próximo vídeo: o que a audiência mais falou sobre “${cluster.label}”`,
      comments.length
    )
  );
}

function fallbackScript(idea: VideoIdea, variations: boolean): VideoScript {
  const quotes = idea.sampleComments.filter(Boolean);
  const quoteBlock =
    quotes.length > 0
      ? quotes.map((q) => `“${q}”`).join(" ")
      : "vários comentários pedindo exatamente isso";
  const topic = idea.title;

  const script: VideoScript = {
    title: topic,
    alternativeTitles: [
      `${topic} (do jeito que a audiência pediu)`,
      `Respondendo os comentários: ${topic}`,
    ],
    durationTarget: "8–12 min",
    hook: `Se você comentou sobre isso, este vídeo é a resposta. Em poucos minutos eu fecho a dúvida que mais apareceu: ${topic}.`,
    intro: `Antes de qualquer dica mágica: isso saiu dos comentários, não da minha cabeça. A audiência escreveu coisas como ${quoteBlock}. Vou traduzir isso num passo a passo que você aplica hoje, sem enrolação e sem repetir o vídeo anterior.`,
    sections: [
      {
        heading: "O que a audiência realmente perguntou",
        duration: "0:40–2:30",
        spoken: `Primeiro, o recado da plateia. Não é “fala de novo o mesmo tema”. É o desdobramento. As pessoas querem saber o que fazer NA PRÁTICA depois de entender a ideia. ${quotes[0] ? `Um comentário típico foi: “${quotes[0]}”` : "Os comentários giram em torno da mesma dúvida."} ${quotes[1] ? `Outro foi direto: “${quotes[1]}”` : ""} Eu vou tratar isso como o problema do vídeo: sair da teoria e chegar numa decisão que você consegue tomar ainda hoje.`,
        points: ["Mostrar prints dos comentários na tela", "Ler 2 trechos em voz alta"],
      },
      {
        heading: "O erro que mais se repete",
        duration: "2:30–5:00",
        spoken: `O erro clássico é agir no impulso sem um critério. A pessoa entende o conceito no vídeo, abre o app, e toma uma decisão que mistura medo, pressa e um número que ela viu no comentário de outra pessoa. Resultado: vira relato de “quebrei a cara”. A regra daqui é simples: se você não consegue explicar em uma frase por que está fazendo isso, você ainda não está pronto para o próximo passo. Vamos separar o que é contexto do vídeo anterior e o que é a decisão de agora.`,
        points: ["Exemplo na tela: decisão boa vs decisão por impulso"],
      },
      {
        heading: "Passo a passo para aplicar",
        duration: "5:00–9:00",
        spoken: `Passo 1: escreve a pergunta do comentário com as suas palavras. Se você não consegue escrever, você não entendeu. Passo 2: define um limite — valor, prazo ou regra — antes de qualquer clique. Passo 3: testa no menor tamanho possível, não no tamanho do sonho. Passo 4: anota o que aconteceu em sete dias. É isso que a audiência está pedindo quando fala em imposto, empréstimo, juízo, próximo passo: um método, não um recado motivacional. Eu faria exatamente nessa ordem se fosse eu no seu lugar, com o mesmo comentário aberto do lado.`,
        points: ["Checklist na tela: pergunta, limite, teste, revisão"],
      },
      {
        heading: "Objeções e o que NÃO fazer",
        duration: "9:00–11:00",
        spoken: `“Mas e se eu perder a chance?” Chance sem critério é o que enche comentário de arrependimento. “E se todo mundo estiver fazendo?” Todo mundo nos comentários também é quem pede socorro depois. Não copie o tamanho da operação de outra pessoa. Não misture dinheiro de conta essencial com experimento. E não transforme um vídeo educativo em sinal de entrada. Se a sua dúvida ainda é a mesma do comentário depois desses passos, a resposta honesta é: ainda não.`,
        points: ["Lista do que não fazer, um item por vez"],
      },
    ],
    cta: `Se este roteiro bateu com o que você comentou, responde aqui: qual passo você vai testar primeiro? O próximo vídeo sai dessas respostas, não de um tema genérico.`,
    description: `${topic}\n\nRoteiro gerado a partir dos comentários da audiência.\n\nNo vídeo: o que vocês perguntaram, o erro mais comum, o passo a passo e o que não fazer.`,
    sourceComments: quotes,
  };

  if (variations) {
    script.variations = [
      { angle: "Tutorial", title: script.title, hook: script.hook },
      {
        angle: "Lista",
        title: `7 decisões sobre ${topic.toLowerCase()}`,
        hook: "A audiência repetiu as mesmas 7 dúvidas. Vou responder uma por uma.",
      },
      {
        angle: "Reação",
        title: `Lendo os comentários: ${topic}`,
        hook: "Separei os comentários mais repetidos. Vou responder em voz alta.",
      },
    ];
  }

  return script;
}

function fallbackSummary(comments: Comment[]): string {
  const total = comments.length;
  const questions = comments.filter((c) => isQuestion(c.text)).length;
  const positive = comments.filter((c) => c.sentiment === "positive").length;
  const negative = comments.filter((c) => c.sentiment === "negative").length;
  return `A audiência deixou ${total} comentários neste recorte. ${positive} são positivos e ${negative} negativos. Há ${questions} perguntas em aberto — os temas que mais voltam são pedidos de tutorial, dúvidas de ferramenta e comentários sobre o ritmo do vídeo. Vale responder as perguntas mais curtidas e transformar os pedidos repetidos no próximo conteúdo.`;
}

async function chatJson<T>(
  prompt: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<T | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: options?.temperature ?? 0.4,
      max_tokens: options?.maxTokens ?? 2500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você é estrategista e roteirista de YouTube. Responda sempre em português do Brasil, em JSON válido.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI falhou (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content) as T;
}

export async function summarizeComments(comments: Comment[]): Promise<{
  summary: string;
  source: "openai" | "heuristic";
}> {
  const sample = comments.slice(0, 80).map((c) => `- ${c.author}: ${c.text}`);
  try {
    const json = await chatJson<{ summary: string }>(
      `Resuma o que a audiência está dizendo nestes comentários de YouTube. Foque em temas, elogios, críticas e pedidos. JSON: {"summary": "..."}\n\n${sample.join("\n")}`
    );
    if (json?.summary) return { summary: json.summary, source: "openai" };
  } catch {
    // fallback
  }
  return { summary: fallbackSummary(comments), source: "heuristic" };
}

export async function generateIdeas(
  comments: Comment[],
  videoTitle?: string
): Promise<{
  ideas: VideoIdea[];
  source: "openai" | "heuristic";
  emptyReason?: string;
}> {
  const clusters = clusterComments(comments);
  if (!clusters.length) {
    return {
      ideas: [],
      source: "heuristic",
      emptyReason: `Nenhum tema atingiu massa suficiente (${minSupportLabel(comments.length)}). Dois comentários isolados não viram vídeo.`,
    };
  }

  const brief = clusters
    .map((cluster) => {
      const samples = cluster.samples.map((text) => `  - ${text}`).join("\n");
      return `ID=${cluster.id} | ${cluster.count} comentários | ${cluster.totalLikes} likes | ${cluster.questionCount} perguntas | tema="${cluster.label}"\n${samples}`;
    })
    .join("\n\n");

  const titleLine = videoTitle
    ? `O vídeo que eles acabaram de assistir se chama: "${videoTitle}".`
    : "O título do vídeo atual não foi informado.";

  try {
    const json = await chatJson<{ ideas: Array<{ clusterId: string; title: string }> }>(
      `${titleLine}

Abaixo estão TEMAS JÁ AGRUPADOS a partir de ${comments.length} comentários. Cada tema só entra se muita gente falou a mesma coisa (ou o tema tem muitos likes). Você NÃO recebe comentários isolados.

Tarefa: para cada tema, dê um título de PRÓXIMO vídeo (não repetir o vídeo atual). Pode juntar dois IDs só se forem o mesmo pedido.

Regras:
- Use apenas os clusterId listados.
- O título deve responder o que esse grupo quer saber/ver no próximo conteúdo.
- Não invente um tema novo. Não use um par de comentários que não está aqui.

JSON: {"ideas":[{"clusterId":"tema-1","title":"..."}]}

Temas:
${brief}`
    );

    if (json?.ideas?.length) {
      const byId = new Map(clusters.map((cluster) => [cluster.id, cluster]));
      const ideas = json.ideas
        .map((item) => {
          const cluster = byId.get(item.clusterId);
          if (!cluster || !item.title?.trim()) return null;
          return ideaFromCluster(cluster, item.title.trim(), comments.length);
        })
        .filter((idea): idea is VideoIdea => Boolean(idea));
      const unique = [...new Map(ideas.map((idea) => [idea.id, idea])).values()];
      if (unique.length) return { ideas: unique, source: "openai" };
    }
  } catch {
    // fallback
  }

  return { ideas: fallbackIdeas(comments), source: "heuristic" };
}

function spokenLength(script: VideoScript): number {
  const parts = [
    script.hook,
    script.intro ?? "",
    script.cta,
    ...(script.sections ?? []).map((section) => section.spoken || section.points.join(" ")),
  ];
  return parts.join(" ").trim().length;
}

function unwrapScript(raw: unknown): VideoScript | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const data = (root.script && typeof root.script === "object" ? root.script : root) as Record<
    string,
    unknown
  >;
  if (typeof data.title !== "string" || typeof data.hook !== "string") return null;
  const sections = Array.isArray(data.sections) ? data.sections : [];
  const mapped = sections
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const section = item as Record<string, unknown>;
      const heading = typeof section.heading === "string" ? section.heading : "";
      if (!heading) return null;
      const points = Array.isArray(section.points)
        ? section.points.filter((p): p is string => typeof p === "string")
        : [];
      return {
        heading,
        duration: typeof section.duration === "string" ? section.duration : "",
        spoken: typeof section.spoken === "string" ? section.spoken : undefined,
        points,
      };
    })
    .filter((section): section is NonNullable<typeof section> => Boolean(section));

  return {
    title: data.title,
    alternativeTitles: Array.isArray(data.alternativeTitles)
      ? data.alternativeTitles.filter((t): t is string => typeof t === "string")
      : [],
    durationTarget: typeof data.durationTarget === "string" ? data.durationTarget : "8–12 min",
    hook: data.hook,
    intro: typeof data.intro === "string" ? data.intro : undefined,
    sections: mapped,
    cta: typeof data.cta === "string" ? data.cta : "",
    description: typeof data.description === "string" ? data.description : undefined,
    sourceComments: Array.isArray(data.sourceComments)
      ? data.sourceComments.filter((t): t is string => typeof t === "string")
      : [],
    variations: Array.isArray(data.variations)
      ? data.variations
          .map((item) => {
            if (!item || typeof item !== "object") return null;
            const variation = item as Record<string, unknown>;
            if (typeof variation.angle !== "string" || typeof variation.title !== "string") {
              return null;
            }
            return {
              angle: variation.angle,
              title: variation.title,
              hook: typeof variation.hook === "string" ? variation.hook : "",
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : undefined,
  };
}

export async function generateScript(
  idea: VideoIdea,
  variations: boolean
): Promise<{ script: VideoScript; source: "openai" | "heuristic" }> {
  try {
    const json = await chatJson<unknown>(
      `Escreva um ROTEIRO COMPLETO de YouTube (8 a 12 minutos) para o criador LER na câmera. Português do Brasil. Teleprompter, não pauta.

Ideia: ${idea.title}
Por que existe: ${idea.reason}
Comentários que sustentam:
${(idea.sampleComments ?? []).map((c) => `- ${c}`).join("\n") || "- (sem trechos)"}

Não entregue só o gancho de 15 segundos. Entregue fala contínua em cada bloco.

JSON:
{"script":{
  "title":"...",
  "alternativeTitles":["...","..."],
  "durationTarget":"8-12 min",
  "hook":"fala dos primeiros 15s",
  "intro":"1 parágrafo depois do gancho",
  "sections":[{"heading":"...","duration":"1:00-3:00","spoken":"120 a 200 palavras para ler em voz alta","points":["nota de tela"]}],
  "cta":"fechamento falado",
  "description":"descrição pronta para o YouTube",
  "sourceComments":["trechos reais"]
}}

Regras:
- Pelo menos 4 sections além do hook/intro.
- "spoken" é obrigatório e é TEXTO PARA FALAR, não tópico.
- Responda as dúvidas dos comentários. Não repita o vídeo anterior.
${variations ? "- Também inclua variations com 3 ângulos (tutorial, lista, reação), cada um só com title e hook." : "- Sem variations."}`,
      { maxTokens: 4500, temperature: 0.5 }
    );

    const parsed = unwrapScript(json);
    if (parsed && parsed.sections.length >= 3 && spokenLength(parsed) >= 600) {
      if (variations && json && typeof json === "object" && "script" in json) {
        const inner = (json as { script?: { variations?: VideoScript["variations"] } }).script;
        if (inner?.variations) parsed.variations = inner.variations;
      }
      if (!parsed.sourceComments?.length) parsed.sourceComments = idea.sampleComments ?? [];
      return { script: parsed, source: "openai" };
    }
  } catch {
    // fallback
  }
  return { script: fallbackScript(idea, variations), source: "heuristic" };
}
