import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "../../../services/error.service";
import type { ManagedClub } from "../types/club";

export function DeleteClubModal({
  club,
  onClose,
  onConfirm,
}: {
  club: ManagedClub;
  onClose: () => void;
  onConfirm: (confirmation: string) => Promise<void>;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm(confirmation);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-club-950/60 p-5 backdrop-blur-sm max-sm:place-items-end max-sm:p-0" onMouseDown={onClose} role="presentation">
      <section className="w-full max-w-md rounded-[15px] bg-white shadow-2xl max-sm:rounded-b-none" onMouseDown={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true">
        <header className="flex items-start justify-between border-b border-[#dde4de] p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fceaea] text-[#b84b4b]"><AlertTriangle size={22} /></span>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#dde4de]" type="button" onClick={onClose}><X size={19} /></button>
        </header>
        <div className="p-5">
          <h2 className="mb-2 font-display text-xl text-club-950">Apagar clube?</h2>
          <p className="mb-4 text-xs leading-5 text-[#6e7c74]">
            O clube <strong>{club.name}</strong>, as suas viaturas, revisões e inscrições serão removidos permanentemente.
          </p>
          <label className="grid gap-2 text-xs font-bold text-[#4f5d55]">
            Para confirmar, escreva <code className="font-mono text-[#a44747]">delete</code>
            <input className="h-11 rounded-lg border border-[#d9e0da] px-3 font-mono text-sm outline-none focus:border-[#b84b4b]" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" autoFocus />
          </label>
          {error && <div className="mt-4 rounded-lg border border-[#efcaca] bg-[#fff0f0] p-3 text-xs text-[#974141]">{error}</div>}
        </div>
        <footer className="flex justify-end gap-2 border-t border-[#dde4de] bg-[#fafbfa] p-4">
          <button className="h-10 rounded-lg border border-[#dde4de] bg-white px-4 text-xs font-bold" type="button" onClick={onClose}>Cancelar</button>
          <button className="h-10 rounded-lg bg-[#b84b4b] px-4 text-xs font-bold text-white disabled:opacity-40" type="button" disabled={confirmation !== "delete" || loading} onClick={() => void remove()}>
            {loading ? "A apagar..." : "Apagar clube"}
          </button>
        </footer>
      </section>
    </div>
  );
}
