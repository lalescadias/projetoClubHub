import { zodResolver } from "@hookform/resolvers/zod";
import { Wrench, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "../../../services/error.service";
import type { Vehicle, VehicleRevision, VehicleRevisionPayload } from "../types/vehicle";

const schema = z.object({
  revisionDate: z.string().min(1, "Indique a data da revisão."),
  mileage: z.number().int().min(0),
  description: z.string().trim().min(2, "Indique uma descrição.").max(240),
  servicesPerformed: z.string().trim().min(2, "Indique os serviços realizados.").max(5000),
  workshop: z.string().trim().max(160),
  cost: z.number().nonnegative().optional(),
  nextRevisionDate: z.string(),
  nextRevisionMileage: z.number().int().nonnegative().optional(),
  notes: z.string().trim().max(5000),
});

type FormValues = z.infer<typeof schema>;

function dateValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function VehicleRevisionFormModal({
  vehicle,
  revision,
  onClose,
  onSubmit,
}: {
  vehicle: Vehicle;
  revision?: VehicleRevision | null;
  onClose: () => void;
  onSubmit: (payload: VehicleRevisionPayload) => Promise<void>;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const editing = Boolean(revision);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      revisionDate: dateValue(revision?.revisionDate) || new Date().toISOString().slice(0, 10),
      mileage: revision?.mileage ?? vehicle.currentMileage,
      description: revision?.description ?? "",
      servicesPerformed: revision?.servicesPerformed ?? "",
      workshop: revision?.workshop ?? "",
      cost: revision?.cost ?? undefined,
      nextRevisionDate: dateValue(revision?.nextRevisionDate),
      nextRevisionMileage: revision?.nextRevisionMileage ?? undefined,
      notes: revision?.notes ?? "",
    },
  });

  const submit = async (values: FormValues) => {
    try {
      setSubmitError(null);
      await onSubmit({
        ...values,
        workshop: values.workshop || null,
        cost: values.cost ?? null,
        nextRevisionDate: values.nextRevisionDate || null,
        nextRevisionMileage: values.nextRevisionMileage ?? null,
        notes: values.notes || null,
      });
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const fieldClass = "grid content-start gap-1.5";
  const labelClass = "text-[11px] font-bold text-[#4f5d55]";
  const inputClass = "h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10";
  const optionalNumber = {
    setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-club-950/60 p-5 backdrop-blur-sm max-sm:place-items-end max-sm:p-0" onMouseDown={onClose} role="presentation">
      <section className="max-h-[calc(100vh-40px)] w-full max-w-3xl overflow-y-auto rounded-[15px] bg-white shadow-2xl max-sm:max-h-[94vh] max-sm:rounded-b-none" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="revision-form-title">
        <header className="flex items-start justify-between border-b border-[#dde4de] p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">{vehicle.plate}</span>
            <h2 className="mt-1 font-display text-xl text-club-950" id="revision-form-title">{editing ? "Editar revisão" : "Registar revisão"}</h2>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#dde4de]" type="button" onClick={onClose}><X size={19} /></button>
        </header>

        <div className="mx-5 mt-5 flex items-center gap-3 rounded-xl bg-club-100 p-4 text-club-800">
          <Wrench size={21} />
          <div>
            <span className="block text-[10px] uppercase tracking-wide">Quilometragem atual</span>
            <strong className="font-display text-lg">{new Intl.NumberFormat("pt-PT").format(vehicle.currentMileage)} km</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-2 gap-4 p-5 max-sm:grid-cols-1">
            <label className={fieldClass}>
              <span className={labelClass}>Data da revisão</span>
              <input className={inputClass} type="date" {...register("revisionDate")} />
              {errors.revisionDate && <small className="text-[10px] text-[#b84b4b]">{errors.revisionDate.message}</small>}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Quilometragem da revisão</span>
              <input className={inputClass} type="number" {...register("mileage", { valueAsNumber: true })} />
            </label>
            <label className={`${fieldClass} col-span-full`}>
              <span className={labelClass}>Descrição</span>
              <input className={inputClass} {...register("description")} />
              {errors.description && <small className="text-[10px] text-[#b84b4b]">{errors.description.message}</small>}
            </label>
            <label className={`${fieldClass} col-span-full`}>
              <span className={labelClass}>Serviços realizados</span>
              <textarea className="min-h-28 rounded-lg border border-[#d9e0da] p-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10" {...register("servicesPerformed")} />
              {errors.servicesPerformed && <small className="text-[10px] text-[#b84b4b]">{errors.servicesPerformed.message}</small>}
            </label>
            <label className={fieldClass}><span className={labelClass}>Oficina</span><input className={inputClass} {...register("workshop")} /></label>
            <label className={fieldClass}><span className={labelClass}>Custo (€)</span><input className={inputClass} type="number" min="0" step="0.01" {...register("cost", optionalNumber)} /></label>
            <label className={fieldClass}><span className={labelClass}>Próxima revisão por data</span><input className={inputClass} type="date" {...register("nextRevisionDate")} /></label>
            <label className={fieldClass}><span className={labelClass}>Próxima revisão por quilometragem</span><input className={inputClass} type="number" min="0" {...register("nextRevisionMileage", optionalNumber)} /></label>
            <label className={`${fieldClass} col-span-full`}><span className={labelClass}>Observações</span><textarea className="min-h-24 rounded-lg border border-[#d9e0da] p-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10" {...register("notes")} /></label>
          </div>
          {submitError && <div className="mx-5 mb-4 rounded-lg border border-[#efcaca] bg-[#fff0f0] p-3 text-xs text-[#974141]">{submitError}</div>}
          <footer className="flex justify-end gap-2 border-t border-[#dde4de] bg-[#fafbfa] p-4">
            <button className="h-10 rounded-lg border border-[#dde4de] bg-white px-4 text-xs font-bold" type="button" onClick={onClose}>Cancelar</button>
            <button className="h-10 rounded-lg bg-club-800 px-4 text-xs font-bold text-white" disabled={isSubmitting} type="submit">{isSubmitting ? "A guardar..." : editing ? "Guardar alterações" : "Registar revisão"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
