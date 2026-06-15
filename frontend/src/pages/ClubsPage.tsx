import { Building2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../modules/auth/context/AuthContext";
import { clubApi } from "../modules/clubs/api/club.api";
import { ClubFormModal } from "../modules/clubs/components/ClubFormModal";
import { DeleteClubModal } from "../modules/clubs/components/DeleteClubModal";
import type {
  ClubPayload,
  ManagedClub,
} from "../modules/clubs/types/club";
import { getErrorMessage } from "../services/error.service";

export function ClubsPage() {
  const { activeRole, activeClub, logout } = useAuth();
  const [clubs, setClubs] = useState<ManagedClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubForm, setClubForm] =
    useState<ManagedClub | null | undefined>(undefined);
  const [clubToDelete, setClubToDelete] = useState<ManagedClub | null>(null);

  const load = useCallback(async () => {
    if (activeRole !== "SUPER_ADMIN") return;
    try {
      setLoading(true);
      setError(null);
      setClubs(await clubApi.list());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  useEffect(() => void load(), [load]);

  if (activeRole !== "SUPER_ADMIN") {
    return (
      <div className="rounded-xl border border-[#efcaca] bg-white p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 text-[#b84b4b]" />
        <h1 className="font-display text-xl">Acesso reservado</h1>
        <p className="text-sm text-[#6e7c74]">
          Apenas a superadministradora pode gerir clubes.
        </p>
      </div>
    );
  }

  const save = async (payload: ClubPayload) => {
    if (clubForm) {
      await clubApi.update(clubForm.id, payload);
    } else {
      await clubApi.create(payload);
    }
    await load();
  };

  const remove = async (confirmation: string) => {
    if (!clubToDelete) return;
    const deletingActiveClub = clubToDelete.id === activeClub?.id;
    await clubApi.remove(clubToDelete.id, confirmation);
    if (deletingActiveClub) {
      logout();
      window.location.assign("/login");
      return;
    }
    await load();
  };

  return (
    <>
      <PageHeader
        eyebrow="Gestão global"
        title="Clubes"
        description="Crie e administre os clubes existentes na plataforma."
        actions={
          <button
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-club-800 px-4 text-xs font-bold text-white max-sm:w-full max-sm:justify-center"
            type="button"
            onClick={() => setClubForm(null)}
          >
            <Plus size={17} /> Criar clube
          </button>
        }
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-xl border border-[#efcaca] bg-[#fff0f0] p-4 text-xs text-[#974141]">
          {error}
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
          {clubs.map((club) => (
            <article
              className="flex items-center gap-4 rounded-[13px] border border-[#dde4de] bg-white p-5 max-sm:flex-wrap"
              key={club.id}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-club-100 text-club-700">
                <Building2 size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-display text-lg text-club-950">
                    {club.name}
                  </h2>
                  {club.id === activeClub?.id && (
                    <span className="rounded-full bg-[#e9f5ed] px-2 py-1 text-[9px] font-bold uppercase text-[#287a50]">
                      Ativo
                    </span>
                  )}
                </div>
                <span className="block text-xs text-[#758179]">{club.slug}</span>
                <span className="mt-2 block text-[11px] text-[#8a958e]">
                  {club._count.memberships} utilizadores · {club._count.vehicles} viaturas
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="grid h-10 w-10 place-items-center rounded-lg border border-[#d9e0da] text-club-700 hover:bg-club-100"
                  type="button"
                  onClick={() => setClubForm(club)}
                  aria-label="Editar clube"
                  title="Editar clube"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="grid h-10 w-10 place-items-center rounded-lg border border-[#efcece] text-[#b84b4b] hover:bg-[#fceaea]"
                  type="button"
                  onClick={() => setClubToDelete(club)}
                  aria-label="Apagar clube"
                  title="Apagar clube"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {clubForm !== undefined && (
        <ClubFormModal
          club={clubForm}
          onClose={() => setClubForm(undefined)}
          onSubmit={save}
        />
      )}
      {clubToDelete && (
        <DeleteClubModal
          club={clubToDelete}
          onClose={() => setClubToDelete(null)}
          onConfirm={remove}
        />
      )}
    </>
  );
}
