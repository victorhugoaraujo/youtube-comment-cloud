import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";
import { AnaliseHttpError } from "@/lib/video-alvo";
import { assertCanManageMembros } from "@/lib/access";

export { assertCanManageBilling, assertCanManageMembros } from "@/lib/access";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listMembros(ownerId: string) {
  const [members, invites] = await Promise.all([
    prisma.user.findMany({
      where: { ownerUserId: ownerId },
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.memberInvite.findMany({
      where: { ownerId },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { members, invites };
}

export async function inviteMembro(owner: SessionUser, rawEmail: string) {
  assertCanManageMembros(owner);
  const email = normalizeEmail(rawEmail);
  if (!email || !email.includes("@")) {
    throw new AnaliseHttpError("Informe um email válido.", 400);
  }
  if (email === owner.email) {
    throw new AnaliseHttpError("Você já é o Criador desta conta.", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.ownerUserId && existing.ownerUserId !== owner.id) {
    throw new AnaliseHttpError("Este email já é Membro de outro Criador.", 409);
  }
  if (existing?.ownerUserId === owner.id) {
    return { member: { id: existing.id, email: existing.email, name: existing.name }, pending: false };
  }
  if (existing && (existing.plan === "pro" || existing.plan === "business" || existing.stripeSubscriptionId)) {
    throw new AnaliseHttpError("Esta conta já é de um Criador. Peça outro email.", 409);
  }
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { ownerUserId: owner.id },
    });
    await prisma.memberInvite.deleteMany({ where: { ownerId: owner.id, email } });
    return { member: { id: existing.id, email: existing.email, name: existing.name }, pending: false };
  }

  const invite = await prisma.memberInvite.upsert({
    where: { ownerId_email: { ownerId: owner.id, email } },
    update: {},
    create: { ownerId: owner.id, email },
  });
  return { invite: { id: invite.id, email: invite.email }, pending: true };
}

export async function attachInviteOnRegister(userId: string, email: string) {
  const invite = await prisma.memberInvite.findFirst({
    where: { email: normalizeEmail(email) },
  });
  if (!invite) return;
  await prisma.user.update({
    where: { id: userId },
    data: { ownerUserId: invite.ownerId },
  });
  await prisma.memberInvite.delete({ where: { id: invite.id } });
}

export async function revokeMembro(owner: SessionUser, memberId: string) {
  assertCanManageMembros(owner);
  const result = await prisma.user.updateMany({
    where: { id: memberId, ownerUserId: owner.id },
    data: { ownerUserId: null },
  });
  if (result.count === 0) {
    const invite = await prisma.memberInvite.deleteMany({
      where: { id: memberId, ownerId: owner.id },
    });
    if (invite.count === 0) {
      throw new AnaliseHttpError("Membro não encontrado.", 404);
    }
  }
}
