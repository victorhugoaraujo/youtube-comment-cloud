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

function pickCommentsForIdeas(comments: Comment[], limit = 140): Comment[] {
  const request =
    /faz(er)? um v[ií]deo|queria (ver|entender|saber)|explica(?:r)? |como (fa[cç]o|fazer|funciona)|pr[oó]ximo v[ií]deo|faz um sobre|d[uú]vida|n[aã]o entendi|e se eu|e sobre/i;
  const questions = comments.filter((c) => isQuestion(c.text));
  const requests = comments.filter((c) => request.test(c.text));
  const liked = [...comments].sort((a, b) => b.likes - a.likes);
  const seen = new Set<string>();
  const out: Comment[] = [];
  for (const c of [...questions, ...requests, ...liked, ...comments]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

function fallbackIdeas(comments: Comment[]): VideoIdea[] {
  const questions = comments.filter((c) => isQuestion(c.text));
  const request = comments.filter((c) =>
    /faz(er)? um v[ií]deo|queria|explica|como (fa[cç]o|fazer)|d[uú]vida|n[aã]o entendi/i.test(
      c.text
    )
  );
  const ideas: VideoIdea[] = [];

  if (questions.length >= 2) {
    ideas.push({
      id: "faq",
      title: "Respondendo as dúvidas que mais apareceram nos comentários",
      reason: `${questions.length} perguntas em aberto — o próximo vídeo deve responder essas, não repetir o tema atual.`,
      commentIds: questions.slice(0, 8).map((c) => c.id),
      sampleComments: questions.slice(0, 3).map((c) => c.text),
    });
  }

  if (request.length >= 2) {
    ideas.push({
      id: "pedidos",
      title: "O que a audiência pediu explicitamente para o próximo vídeo",
      reason: `${request.length} comentários pedem tutorial, explicação ou continuação.`,
      commentIds: request.slice(0, 8).map((c) => c.id),
      sampleComments: request.slice(0, 3).map((c) => c.text),
    });
  }

  const stories = comments.filter((c) =>
    /quebrei a cara|quebrando a cara|me endividei|caí nessa|nunca mais faço|aprendi com/i.test(
      c.text
    )
  );
  if (stories.length >= 2) {
    ideas.push({
      id: "proximos-passos",
      title: "O passo seguinte: o que fazer depois do erro que a audiência relatou",
      reason: `${stories.length} pessoas contaram a própria experiência e pedem o que vem depois.`,
      commentIds: stories.slice(0, 8).map((c) => c.id),
      sampleComments: stories.slice(0, 3).map((c) => c.text),
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

export async function generateIdeas(
  comments: Comment[],
  videoTitle?: string
): Promise<{
  ideas: VideoIdea[];
  source: "openai" | "heuristic";
}> {
  const sample = pickCommentsForIdeas(comments).map(
    (c) => `[${c.id}] likes=${c.likes} ${c.isQuestion ? "PERGUNTA" : "COMEN"}: ${c.text}`
  );
  const titleLine = videoTitle
    ? `O vídeo que eles acabaram de assistir se chama: "${videoTitle}".`
    : "O título do vídeo atual não foi informado.";
  try {
    const json = await chatJson<{ ideas: VideoIdea[] }>(
      `${titleLine}

Tarefa: sugerir 4 a 6 ideias para o PRÓXIMO vídeo, extraídas SOMENTE dos comentários abaixo.

Regras:
- NÃO resuma nem repita o tema do vídeo atual.
- Cada ideia tem que nascer de pergunta, pedido, dúvida ou relato da audiência (o passo seguinte).
- reason deve citar quantos comentários sustentam a ideia.
- sampleComments deve copiar trechos reais dos comentários, não parafrasear o título do vídeo.
- Se a audiência relata experiência pessoal (dívida, erro, "quebrando a cara"), o próximo vídeo é o desdobramento ("e agora?", "como sair", "o que eu faria diferente") — não o mesmo assunto de novo.

JSON: {"ideas":[{"id":"slug","title":"...","reason":"...","commentIds":["id"],"sampleComments":["..."]}]}

Comentários:
${sample.join("\n")}`
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
