"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/client";

interface Member {
  id: string;
  email: string;
  name: string;
}
interface Invite {
  id: string;
  email: string;
}

export default function MembrosPage() {
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api<{ members: Member[]; invites: Invite[] }>("/api/members");
    setMembers(data.members);
    setInvites(data.invites);
  }

  useEffect(() => {
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Falha"));
  }, []);

  async function invite() {
    setBusy(true);
    try {
      await api("/api/members", { method: "POST", body: JSON.stringify({ email }) });
      setEmail("");
      toast.success("Convite enviado. Quem criar conta com esse email vira Membro.");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    await api(`/api/members?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Membros</h1>
      <p className="text-sm text-muted-foreground">
        No Business, Membros disparam Análise, Ideia e Roteiro gastando o seu Limite. Eles não
        alteram Plano nem Assinatura.
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@equipe.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button disabled={busy || !email} onClick={invite}>
          Convidar
        </Button>
      </div>
      {members.length === 0 && invites.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum Membro ainda.</p>
      )}
      <ul className="space-y-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm">
              {m.name} · {m.email}
            </span>
            <Button size="sm" variant="ghost" onClick={() => revoke(m.id)}>
              Remover
            </Button>
          </li>
        ))}
        {invites.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Pendente · {i.email}</span>
            <Button size="sm" variant="ghost" onClick={() => revoke(i.id)}>
              Cancelar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
