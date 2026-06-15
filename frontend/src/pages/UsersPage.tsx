import {
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../modules/auth/context/AuthContext";
import type { ClubRole } from "../modules/auth/types/auth";
import { userApi } from "../modules/users/api/user.api";
import { DeleteUserModal } from "../modules/users/components/DeleteUserModal";
import { EditUserModal } from "../modules/users/components/EditUserModal";
import { UserFormModal } from "../modules/users/components/UserFormModal";
import type {
  ClubUser,
  CreateClubUserPayload,
  UpdateClubUserPayload,
} from "../modules/users/types/user";
import { getErrorMessage } from "../services/error.service";

const roleLabels: Record<ClubRole, string> = {
  ADMIN: "Administrador",
  MEMBER: "Membro",
};

export function UsersPage() {
  const { activeMembership, refreshSession } = useAuth();
  const [users, setUsers] = useState<ClubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState<ClubUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<ClubUser | null>(null);

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
        <p className="text-sm text-[#6e7c74]">
          Apenas administradores podem gerir utilizadores.
        </p>
      </div>
    );
  }

  const create = async (payload: CreateClubUserPayload) => {
    await userApi.create(payload);
    await load();
  };

  const update = async (
    membership: ClubUser,
    payload: UpdateClubUserPayload,
  ) => {
    await userApi.update(membership.id, payload);
    if (membership.id === activeMembership.id) {
      await refreshSession();
    }
    await load();
  };

  const updateAccess = async (
    membership: ClubUser,
    payload: UpdateClubUserPayload,
  ) => {
    try {
      setError(null);
      await update(membership, payload);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const remove = async (confirmation: string) => {
    if (!userToDelete) return;
    await userApi.remove(userToDelete.id, confirmation);
    await load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Administração"
        title="Utilizadores"
        description={`Controle quem pode aceder aos dados de ${activeMembership.club.name}.`}
        actions={
          <button
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-club-800 px-4 text-xs font-bold text-white max-sm:w-full max-sm:justify-center"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <Plus size={17} /> Adicionar utilizador
          </button>
        }
      />

      <section className="overflow-hidden rounded-[13px] border border-[#dde4de] bg-white">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {error && (
              <div className="m-5 rounded-lg border border-[#efcaca] bg-[#fff0f0] p-3 text-xs text-[#974141]">
                {error}
              </div>
            )}
            <div className="divide-y divide-[#edf0ed]">
              {users.map((membership) => {
                const isCurrentUser = membership.id === activeMembership.id;
                return (
                  <article
                    className="flex items-center gap-4 p-5 max-lg:flex-wrap"
                    key={membership.id}
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-club-100 font-display text-sm text-club-800">
                      {membership.user.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="block truncate text-sm text-[#28362f]">
                          {membership.user.name}
                        </strong>
                        {isCurrentUser && (
                          <span className="rounded-full bg-club-100 px-2 py-0.5 text-[9px] font-bold uppercase text-club-700">
                            Você
                          </span>
                        )}
                      </div>
                      <span className="mt-1 block truncate text-xs text-[#7d8981]">
                        {membership.user.email}
                      </span>
                    </div>
                    <select
                      className="h-10 rounded-lg border border-[#d9e0da] bg-white px-3 text-xs max-lg:order-4 max-lg:flex-1"
                      value={membership.role}
                      onChange={(event) =>
                        void updateAccess(membership, {
                          role: event.target.value as ClubRole,
                        })
                      }
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold max-lg:order-5 ${
                        membership.isActive
                          ? "bg-[#e9f5ed] text-[#287a50]"
                          : "bg-[#fceaea] text-[#aa4747]"
                      }`}
                      onClick={() =>
                        void updateAccess(membership, {
                          isActive: !membership.isActive,
                        })
                      }
                      type="button"
                    >
                      {membership.isActive ? (
                        <UserCheck size={16} />
                      ) : (
                        <UserX size={16} />
                      )}
                      {membership.isActive ? "Ativo" : "Inativo"}
                    </button>
                    <div className="flex gap-2 max-lg:order-6">
                      <button
                        className="grid h-10 w-10 place-items-center rounded-lg border border-[#d9e0da] text-club-700 hover:bg-club-100"
                        type="button"
                        onClick={() => setUserToEdit(membership)}
                        aria-label="Editar utilizador"
                        title="Editar utilizador"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="grid h-10 w-10 place-items-center rounded-lg border border-[#efcece] text-[#b84b4b] hover:bg-[#fceaea] disabled:cursor-not-allowed disabled:opacity-35"
                        type="button"
                        disabled={isCurrentUser}
                        onClick={() => setUserToDelete(membership)}
                        aria-label={
                          isCurrentUser
                            ? "Não pode apagar a sua própria inscrição"
                            : "Apagar utilizador"
                        }
                        title={
                          isCurrentUser
                            ? "Não pode apagar a sua própria inscrição"
                            : "Apagar utilizador"
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {showForm && (
        <UserFormModal
          onClose={() => setShowForm(false)}
          onSubmit={create}
        />
      )}
      {userToEdit && (
        <EditUserModal
          membership={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={(payload) => update(userToEdit, payload)}
        />
      )}
      {userToDelete && (
        <DeleteUserModal
          membership={userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
