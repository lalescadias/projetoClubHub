import { zodResolver } from "@hookform/resolvers/zod";
import { Gauge, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "../../../services/error.service";
import type { Vehicle, VehicleUsagePayload } from "../types/vehicle";

const schema = z
  .object({
    usedBy: z.string().trim().min(2, "Indique quem utilizou a viatura."),
    destination: z.string().trim().min(2, "Indique o destino."),
    usageDate: z.string().min(1, "Indique a data."),
    startMileage: z.number().int().min(0),
    endMileage: z.number().int().min(0),
    fuelAmount: z.number().nonnegative().optional(),
    fuelCost: z.number().nonnegative().optional(),
    notes: z.string().max(2000),
  })
  .refine((data) => data.endMileage >= data.startMileage, {
    path: ["endMileage"],
    message: "A quilometragem final não pode ser menor que a inicial.",
  });

type FormValues = z.infer<typeof schema>;

export function VehicleUsageFormModal({
  vehicle,
  onClose,
  onSubmit,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  onSubmit: (payload: VehicleUsagePayload) => Promise<void>;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      usedBy: "",
      destination: "",
      usageDate: new Date().toISOString().slice(0, 10),
      startMileage: vehicle.currentMileage,
      endMileage: vehicle.currentMileage,
      notes: "",
    },
  });

  const submit = async (values: FormValues) => {
    try {
      setSubmitError(null);
      await onSubmit({
        ...values,
        fuelAmount: Number.isNaN(values.fuelAmount) ? null : values.fuelAmount,
        fuelCost: Number.isNaN(values.fuelCost) ? null : values.fuelCost,
        notes: values.notes || null,
      });
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const fieldClass = "grid content-start gap-1.5";
  const labelClass = "text-[11px] font-bold text-[#4f5d55]";
  const inputClass =
    "h-11 w-full rounded-lg border border-[#d9e0da] bg-white px-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10";

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-club-950/60 p-5 backdrop-blur-sm max-sm:place-items-end max-sm:p-0"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        className="max-h-[calc(100vh-40px)] w-full max-w-2xl overflow-y-auto rounded-[15px] bg-white shadow-2xl max-sm:max-h-[94vh] max-sm:rounded-b-none"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="usage-form-title"
      >
        <header className="flex items-start justify-between border-b border-[#dde4de] p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
              {vehicle.plate}
            </span>
            <h2 className="mt-1 font-display text-xl text-club-950" id="usage-form-title">
              Registar utilização
            </h2>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#dde4de]" type="button" onClick={onClose}>
            <X size={19} />
          </button>
        </header>

        <div className="mx-5 mt-5 flex items-center gap-3 rounded-xl bg-club-100 p-4 text-club-800">
          <Gauge size={21} />
          <div>
            <span className="block text-[10px] uppercase tracking-wide">Quilometragem atual</span>
            <strong className="font-display text-lg">
              {new Intl.NumberFormat("pt-PT").format(vehicle.currentMileage)} km
            </strong>
          </div>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-2 gap-4 p-5 max-sm:grid-cols-1">
            <label className={fieldClass}>
              <span className={labelClass}>Quem utilizou</span>
              <input className={inputClass} {...register("usedBy")} />
              {errors.usedBy && <small className="text-[10px] text-[#b84b4b]">{errors.usedBy.message}</small>}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Destino</span>
              <input className={inputClass} {...register("destination")} />
              {errors.destination && <small className="text-[10px] text-[#b84b4b]">{errors.destination.message}</small>}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Data da utilização</span>
              <input className={inputClass} type="date" {...register("usageDate")} />
            </label>
            <div className="max-sm:hidden" />
            <label className={fieldClass}>
              <span className={labelClass}>Quilometragem inicial</span>
              <input
                className={`${inputClass} bg-[#f5f7f5]`}
                type="number"
                readOnly
                {...register("startMileage", { valueAsNumber: true })}
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Quilometragem final</span>
              <input className={inputClass} type="number" {...register("endMileage", { valueAsNumber: true })} />
              {errors.endMileage && <small className="text-[10px] text-[#b84b4b]">{errors.endMileage.message}</small>}
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Combustível abastecido (L/kWh)</span>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                {...register("fuelAmount", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </label>
            <label className={fieldClass}>
              <span className={labelClass}>Custo do combustível (€)</span>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                {...register("fuelCost", {
                  setValueAs: (value) => (value === "" ? undefined : Number(value)),
                })}
              />
            </label>
            <label className={`${fieldClass} col-span-full`}>
              <span className={labelClass}>Observações</span>
              <textarea className="min-h-24 rounded-lg border border-[#d9e0da] p-3 text-sm outline-none focus:border-club-500 focus:ring-3 focus:ring-club-500/10" {...register("notes")} />
            </label>
          </div>

          {submitError && (
            <div className="mx-5 mb-4 rounded-lg border border-[#efcaca] bg-[#fff0f0] p-3 text-xs text-[#974141]">
              {submitError}
            </div>
          )}

          <footer className="flex justify-end gap-2 border-t border-[#dde4de] bg-[#fafbfa] p-4">
            <button className="h-10 rounded-lg border border-[#dde4de] bg-white px-4 text-xs font-bold" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="h-10 rounded-lg bg-club-800 px-4 text-xs font-bold text-white" disabled={isSubmitting} type="submit">
              {isSubmitting ? "A registar..." : "Registar utilização"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
