import { CalendarDays, Gauge, Wrench, X } from "lucide-react";
import type { VehicleRevision } from "../types/vehicle";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", { timeZone: "UTC" });
const numberFormatter = new Intl.NumberFormat("pt-PT");
const currencyFormatter = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });

export function VehicleRevisionDetailsModal({ revision, onClose }: { revision: VehicleRevision; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-club-950/60 p-5 backdrop-blur-sm max-sm:place-items-end max-sm:p-0" onMouseDown={onClose} role="presentation">
      <section className="max-h-[calc(100vh-40px)] w-full max-w-xl overflow-y-auto rounded-[15px] bg-white shadow-2xl max-sm:max-h-[94vh] max-sm:rounded-b-none" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="revision-details-title">
        <header className="flex items-start justify-between border-b border-[#dde4de] p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">Detalhes da revisão</span>
            <h2 className="mt-1 font-display text-xl text-club-950" id="revision-details-title">{revision.description}</h2>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#dde4de]" type="button" onClick={onClose}><X size={19} /></button>
        </header>
        <div className="grid grid-cols-2 gap-3 p-5 max-sm:grid-cols-1">
          <Info icon={CalendarDays} label="Data" value={dateFormatter.format(new Date(revision.revisionDate))} />
          <Info icon={Gauge} label="Quilometragem" value={`${numberFormatter.format(revision.mileage)} km`} />
          <Info icon={Wrench} label="Oficina" value={revision.workshop || "Não indicada"} />
          <Info icon={Wrench} label="Custo" value={revision.cost === null ? "Não indicado" : currencyFormatter.format(revision.cost)} />
          <TextBlock label="Serviços realizados" value={revision.servicesPerformed} />
          <TextBlock label="Próxima revisão" value={[
            revision.nextRevisionDate && dateFormatter.format(new Date(revision.nextRevisionDate)),
            revision.nextRevisionMileage !== null && `${numberFormatter.format(revision.nextRevisionMileage)} km`,
          ].filter(Boolean).join(" · ") || "Não prevista"} />
          {revision.notes && <TextBlock label="Observações" value={revision.notes} />}
        </div>
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Wrench; label: string; value: string }) {
  return <div className="flex gap-3 rounded-xl bg-[#f6f8f6] p-4"><Icon className="shrink-0 text-club-600" size={18} /><div><span className="block text-[10px] uppercase tracking-wide text-[#7c8981]">{label}</span><strong className="mt-1 block text-xs">{value}</strong></div></div>;
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return <div className="col-span-full rounded-xl border border-[#e3e8e3] p-4"><span className="block text-[10px] uppercase tracking-wide text-[#7c8981]">{label}</span><p className="mb-0 mt-2 whitespace-pre-wrap text-xs leading-5 text-[#4f5d55]">{value}</p></div>;
}
