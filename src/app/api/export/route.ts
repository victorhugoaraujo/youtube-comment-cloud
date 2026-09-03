import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { jsonError, requirePlan, withUser } from "@/lib/api";
import type { Comment } from "@/types";

function toCsv(comments: Comment[]) {
  const header = ["Autor", "Data", "Likes", "Respostas", "Sentimento", "Texto"];
  const rows = comments.map((c) =>
    [
      c.author,
      c.publishedAt,
      c.likes,
      c.replyCount,
      c.sentiment,
      c.text.replaceAll('"', '""'),
    ]
      .map((v) => `"${v}"`)
      .join(",")
  );
  return `\uFEFF${[header.join(","), ...rows].join("\n")}`;
}

export async function POST(req: NextRequest) {
  const { user, error } = await withUser();
  if (error) return error;
  const gated = requirePlan(user, "pro");
  if (gated) return gated;

  const body = (await req.json().catch(() => ({}))) as {
    format?: "csv" | "pdf";
    title?: string;
    comments?: Comment[];
  };
  if (!body.comments?.length) return jsonError("Nada para exportar.");
  const format = body.format === "pdf" ? "pdf" : "csv";
  const title = body.title || "comentarios";

  if (format === "csv") {
    return new NextResponse(toCsv(body.comments), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${title.slice(0, 40)}.csv"`,
      },
    });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let page = pdf.addPage();
  let y = page.getHeight() - 48;
  const draw = (text: string, size = 11) => {
    const wrapped = text.slice(0, 110);
    if (y < 48) {
      page = pdf.addPage();
      y = page.getHeight() - 48;
    }
    page.drawText(wrapped, { x: 40, y, size, font });
    y -= size + 6;
  };

  draw(`CommentIQ — ${title}`.slice(0, 90), 14);
  draw(`${body.comments.length} comentarios`, 10);
  y -= 8;
  for (const c of body.comments) {
    draw(`${c.author}  (${c.likes} likes)  ${c.sentiment}`, 10);
    draw(c.text.replace(/\s+/g, " "), 10);
    y -= 6;
  }

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title.slice(0, 40)}.pdf"`,
    },
  });
}
