import type { Comment } from "@/types";
import { isQuestion } from "@/lib/filters";

export interface VideoIdea {
  id: string;
  title: string;
  reason: string;
  commentIds: string[];
  sampleComments: string[];
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

function fallbackIdeas(comments: Comment[]): VideoIdea[] {
  const questions = comments.filter((c) => isQuestion(c.text));
  const buckets: Array<{ id: string; title: string; keys: string[] }> = [
    { id: "thumb", title: "Como criar thumbnails que aumentam o CTR", keys: ["thumbnail", "thumb", "ctr"] },
    { id: "edit", title: "Tutorial de edição no CapCut para YouTube", keys: ["capcut", "edição", "editar", "premiere"] },
    { id: "money", title: "Caminho real até a monetização", keys: ["monetização", "monetizacao", "ypp", "adsense"] },
    { id: "shorts", title: "Como usar Shorts como funil para o vídeo longo", keys: ["shorts", "short"] },
    { id: "gear", title: "Setup barato: câmera, microfone e luz", keys: ["câmera", "camera", "microfone", "celular"] },
  ];

  const ideas: VideoIdea[] = buckets
    .map((b) => {
      const hits = comments.filter((c) =>
        b.keys.some((k) => c.text.toLowerCase().includes(k))
      );
      if (hits.length < 2) return null;
      return {
        id: b.id,
        title: b.title,
        reason: `${hits.length} comentários pedem ou citam este tema.`,
        commentIds: hits.slice(0, 6).map((c) => c.id),
        sampleComments: hits.slice(0, 3).map((c) => c.text),
      };
    })
    .filter((x): x is VideoIdea => Boolean(x));

  if (questions.length >= 2) {
    ideas.unshift({
      id: "faq",
      title: "Respondendo as dúvidas mais frequentes da audiência",
      reason: `${questions.length} perguntas em aberto nos comentários.`,
      commentIds: questions.slice(0, 8).map((c) => c.id),
      sampleComments: questions.slice(0, 3).map((c) => c.text),
    });
  }

  return ideas.slice(0, 6);
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

export async function generateIdeas(comments: Comment[]): Promise<{
  ideas: VideoIdea[];
  source: "openai" | "heuristic";
}> {
  const sample = comments.slice(0, 80).map((c) => `[${c.id}] ${c.text}`);
  try {
    const json = await chatJson<{ ideas: VideoIdea[] }>(
      `Agrupar comentários em 4 a 6 ideias de próximos vídeos. JSON: {"ideas":[{"id":"slug","title":"...","reason":"...","commentIds":["id"],"sampleComments":["..."]}]}\n\n${sample.join("\n")}`
    );
    if (json?.ideas?.length) return { ideas: json.ideas, source: "openai" };
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
