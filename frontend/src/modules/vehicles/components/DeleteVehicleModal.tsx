import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "../../../services/error.service";
import type { Vehicle } from "../types/vehicle";

type DeleteVehicleModalProps = {
  vehicle: Vehicle;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteVehicleModal({
  vehicle,
  onClose,
  onConfirm,
}: DeleteVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#0c1d16]/60 p-6 backdrop-blur-[3px] max-[480px]:place-items-end max-[480px]:p-0"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-[450px] rounded-[15px] bg-white shadow-[0_24px_70px_rgba(8,24,17,0.25)] max-[480px]:rounded-b-none"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-5 border-b border-[#dde4de] px-6 pb-[18px] pt-[22px]">
          <span className="grid h-[43px] w-[43px] place-items-center rounded-[10px] bg-[#fceaea] text-[#b84b4b]">
            <AlertTriangle size={22} />
          </span>
          <button
            className="grid h-[37px] w-[37px] place-items-center rounded-[9px] border border-[#dde4de] bg-white text-[#536159]"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>
        <div className="px-6 pb-2 pt-[22px]">
          <h2 className="mb-2 font-display text-xl tracking-[-0.5px] text-club-950" id="delete-title">
            Remover viatura?
          </h2>
          <p className="mb-5 text-xs leading-[1.65] text-[#6e7c74]">
            A viatura <strong>{vehicle.plate}</strong> será removida permanentemente.
            Esta ação não pode ser anulada.
          </p>
          {error && (
            <div className="mb-[17px] rounded-lg border border-[#efcaca] bg-[#fff0f0] px-3 py-2.5 text-xs text-[#974141]">
              {error}
            </div>
          )}
        </div>
        <footer className="flex items-center justify-end gap-[9px] border-t border-[#dde4de] bg-[#fafbfa] px-6 py-[17px]">
          <button
            className="inline-flex min-h-[42px] items-center justify-center rounded-[9px] border border-[#dde4de] bg-white px-[17px] text-[13px] font-bold text-[#48564e]"
            type="button"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="inline-flex min-h-[42px] items-center justify-center rounded-[9px] bg-[#b84b4b] px-[17px] text-[13px] font-bold text-white"
            type="button"
            onClick={() => void confirm()}
            disabled={loading}
          >
            {loading ? "A remover..." : "Remover viatura"}
          </button>
        </footer>
      </section>
    </div>
  );
}
