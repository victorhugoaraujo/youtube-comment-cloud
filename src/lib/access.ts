import type { SessionUser } from "@/lib/auth";
import { AnaliseHttpError } from "@/lib/video-alvo";

export function assertCanManageBilling(user: SessionUser) {
  if (user.role === "membro") {
    throw new AnaliseHttpError("Só o Criador pode alterar Plano e Assinatura.", 403);
  }
}

export function assertCanManageMembros(user: SessionUser) {
  if (user.role === "membro") {
    throw new AnaliseHttpError("Só o Criador pode convidar ou remover Membros.", 403);
  }
  if (user.plan !== "business") {
    throw new AnaliseHttpError("Membros entram no plano Business.", 403);
  }
}
