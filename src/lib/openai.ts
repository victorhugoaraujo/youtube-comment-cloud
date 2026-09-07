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
  hook: string;
  sections: Array<{ heading: string; duration: string; points: string[] }>;
  cta: string;
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
  const script: VideoScript = {
    title: idea.title,
    alternativeTitles: [
      `${idea.title} (sem enrolação)`,
      `O que minha audiência pediu: ${idea.title}`,
    ],
    hook: `Se você comentou pedindo isso, este vídeo é a resposta direta — em poucos minutos, sem enrolação.`,
    sections: [
      {
        heading: "O que a audiência perguntou",
        duration: "0:00–0:40",
        points: idea.sampleComments.slice(0, 3),
      },
      {
        heading: "Passo a passo",
        duration: "0:40–6:00",
        points: [
          "Mostre o erro mais comum",
          "Demonstre o método na tela",
          "Dê um exemplo concreto do seu canal",
        ],
      },
      {
        heading: "Resultado e próximo passo",
        duration: "6:00–7:30",
        points: ["Antes vs depois", "Convite para aplicar e comentar o resultado"],
      },
    ],
    cta: "Comenta se isso resolveu a dúvida — o próximo vídeo sai a partir das respostas.",
    sourceComments: idea.sampleComments,
  };

  if (variations) {
    script.variations = [
      { angle: "Tutorial", title: script.title, hook: script.hook },
      {
        angle: "Lista",
        title: `7 erros sobre ${idea.title.toLowerCase()}`,
        hook: "A maioria dos canais trava aqui. Estes 7 pontos mudam o jogo.",
      },
      {
        angle: "Reação",
        title: `Reagindo aos comentários: ${idea.title}`,
        hook: "Li todos os comentários. Vou responder um por um, na prática.",
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

async function chatJson<T>(prompt: string): Promise<T | null> {
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
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você é estrategista de conteúdo para canais no YouTube. Responda sempre em português do Brasil, em JSON válido.",
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

export async function generateScript(
  idea: VideoIdea,
  variations: boolean
): Promise<{ script: VideoScript; source: "openai" | "heuristic" }> {
  try {
    const json = await chatJson<{ script: VideoScript }>(
      `Gere um roteiro de YouTube a partir desta ideia: ${JSON.stringify(idea)}.
Inclua title, alternativeTitles (2), hook (15s), sections [{heading,duration,points}], cta, sourceComments.
${variations ? "Inclua variations com 3 ângulos: tutorial, lista, reação." : "Não inclua variations."}
JSON: {"script": {...}}`
    );
    if (json?.script) return { script: json.script, source: "openai" };
  } catch {
    // fallback
  }
  return { script: fallbackScript(idea, variations), source: "heuristic" };
}
