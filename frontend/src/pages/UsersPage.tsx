import { Plus, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { LoadingState } from "../components/LoadingState";
import { useAuth } from "../modules/auth/context/AuthContext";
import type { ClubRole } from "../modules/auth/types/auth";
import { userApi } from "../modules/users/api/user.api";
import { UserFormModal } from "../modules/users/components/UserFormModal";
import type { ClubUser, CreateClubUserPayload } from "../modules/users/types/user";
import { getErrorMessage } from "../services/error.service";

const roleLabels: Record<ClubRole, string> = {
  ADMIN: "Administrador",
  MEMBER: "Membro",
};

export function UsersPage() {
  const { activeMembership } = useAuth();
  const [users, setUsers] = useState<ClubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (activeMembership?.role !== "ADMIN") return;
    try {
      setLoading(true);
      setError(null);
      setUsers(await userApi.list());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [activeMembership?.club.id, activeMembership?.role]);

  useEffect(() => void load(), [load]);

  if (activeMembership?.role !== "ADMIN") {
    return (
      <div className="rounded-xl border border-[#efcaca] bg-white p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 text-[#b84b4b]" />
        <h1 className="font-display text-xl">Acesso reservado</h1>
        <p className="text-sm text-[#6e7c74]">Apenas administradores podem gerir utilizadores.</p>
      </div>
    );
  }

  const create = async (payload: CreateClubUserPayload) => {
    await userApi.create(payload);
    await load();
  };

  const update = async (membership: ClubUser, payload: { role?: ClubRole; isActive?: boolean }) => {
    await userApi.update(membership.id, payload);
    await load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Utilizadores"
        description={`Controle quem pode aceder aos dados de ${activeMembership.club.name}.`}
        actions={
          <button className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-club-800 px-4 text-xs font-bold text-white max-sm:w-full max-sm:justify-center" onClick={() => setShowForm(true)}>
            <Plus size={17} /> Adicionar utilizador
          </button>
        }
      />

      <section className="overflow-hidden rounded-[13px] border border-[#dde4de] bg-white">
        {loading ? <LoadingState /> : error ? (
          <div className="m-5 rounded-lg border border-[#efcaca] bg-[#fff0f0] p-3 text-xs text-[#974141]">{error}</div>
        ) : (
          <div className="divide-y divide-[#edf0ed]">
            {users.map((membership) => (
              <article className="flex items-center gap-4 p-5 max-sm:flex-wrap" key={membership.id}>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-club-100 font-display text-sm text-club-800">
                  {membership.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-[#28362f]">{membership.user.name}</strong>
                  <span className="mt-1 block truncate text-xs text-[#7d8981]">{membership.user.email}</span>
                </div>
                <select
                  className="h-10 rounded-lg border border-[#d9e0da] bg-white px-3 text-xs max-sm:order-4 max-sm:flex-1"
                  value={membership.role}
                  onChange={(event) => void update(membership, { role: event.target.value as ClubRole })}
                >
                  {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button
                  className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold max-sm:order-5 ${membership.isActive ? "bg-[#e9f5ed] text-[#287a50]" : "bg-[#fceaea] text-[#aa4747]"}`}
                  onClick={() => void update(membership, { isActive: !membership.isActive })}
                  type="button"
                >
                  {membership.isActive ? <UserCheck size={16} /> : <UserX size={16} />}
                  {membership.isActive ? "Ativo" : "Inativo"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      {showForm && <UserFormModal onClose={() => setShowForm(false)} onSubmit={create} />}
    </>
  );
}
