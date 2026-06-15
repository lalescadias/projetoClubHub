import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getErrorMessage } from "../../../services/error.service";
import {
  fuelTypeLabels,
  vehicleStatusLabels,
  vehicleTypeLabels,
} from "../constants/vehicle-options";
import {
  fuelTypes,
  vehicleStatuses,
  vehicleTypes,
  type Vehicle,
  type VehiclePayload,
} from "../types/vehicle";

const currentYear = new Date().getFullYear();
const formSchema = z.object({
  plate: z.string().trim().min(5, "Indique uma matrícula válida.").max(20),
  make: z.string().trim().min(2, "Indique a marca.").max(80),
  model: z.string().trim().min(1, "Indique o modelo.").max(80),
  version: z.string().trim().max(100),
  year: z.number().int().min(1950).max(currentYear + 1),
  currentMileage: z.number().int().min(0, "A quilometragem não pode ser negativa."),
  fuelType: z.enum(fuelTypes),
  type: z.enum(vehicleTypes),
  status: z.enum(vehicleStatuses),
  inspectionDate: z.string(),
  insuranceDate: z.string(),
  notes: z.string().max(2000),
});

type FormValues = z.infer<typeof formSchema>;

type VehicleFormModalProps = {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSubmit: (payload: VehiclePayload) => Promise<void>;
};

function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

const fieldClass = "grid content-start gap-[7px]";
const labelClass = "text-[11px] font-bold text-[#4f5d55]";
const inputClass =
  "h-[41px] w-full rounded-lg border border-[#d9e0da] bg-white px-[11px] text-xs text-[#2f3d35] outline-none transition focus:border-club-500 focus:ring-3 focus:ring-club-500/10";
const errorClass = "text-[10px] text-[#b84b4b]";

export function VehicleFormModal({
  vehicle,
  onClose,
  onSubmit,
}: VehicleFormModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plate: "",
      make: "",
      model: "",
      version: "",
      year: currentYear,
      currentMileage: 0,
      fuelType: "DIESEL",
      type: "VAN",
      status: "ACTIVE",
      inspectionDate: "",
      insuranceDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        plate: vehicle.plate,
        make: vehicle.make,
        model: vehicle.model,
        version: vehicle.version ?? "",
        year: vehicle.year,
        currentMileage: vehicle.currentMileage,
        fuelType: vehicle.fuelType,
        type: vehicle.type,
        status: vehicle.status,
        inspectionDate: dateInputValue(vehicle.inspectionDate),
        insuranceDate: dateInputValue(vehicle.insuranceDate),
        notes: vehicle.notes ?? "",
      });
    }
  }, [reset, vehicle]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submitForm = async (values: FormValues) => {
    try {
      setSubmitError(null);
      await onSubmit({
        ...values,
        plate: values.plate.toUpperCase(),
        version: values.version || null,
        inspectionDate: values.inspectionDate || null,
        insuranceDate: values.insuranceDate || null,
        notes: values.notes || null,
      });
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#0c1d16]/60 p-6 backdrop-blur-[3px] max-[480px]:place-items-end max-[480px]:p-0"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="max-h-[calc(100vh-48px)] w-full max-w-[690px] overflow-y-auto rounded-[15px] bg-white shadow-[0_24px_70px_rgba(8,24,17,0.25)] max-[480px]:max-h-[94vh] max-[480px]:rounded-b-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-5 border-b border-[#dde4de] px-6 pb-[18px] pt-[22px]">
          <div>
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
              {vehicle ? "Editar registo" : "Nova entrada"}
            </span>
            <h2
              className="m-0 font-display text-xl tracking-[-0.5px] text-club-950"
              id="vehicle-form-title"
            >
              {vehicle ? "Editar viatura" : "Adicionar viatura"}
            </h2>
          </div>
          <button
            className="grid h-[37px] w-[37px] place-items-center rounded-[9px] border border-[#dde4de] bg-white text-[#536159] hover:bg-[#f7f9f7]"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit(submitForm)}>
          <div className="grid grid-cols-2 gap-[17px] p-6 max-md:grid-cols-1">
            <label className={fieldClass}>
              <span className={labelClass}>Matrícula</span>
              <input className={inputClass} placeholder="AA-00-AA" {...register("plate")} />
              {errors.plate && <small className={errorClass}>{errors.plate.message}</small>}
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Tipo de viatura</span>
              <select className={inputClass} {...register("type")}>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {vehicleTypeLabels[type]}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Marca</span>
              <input className={inputClass} placeholder="Mercedes-Benz" {...register("make")} />
              {errors.make && <small className={errorClass}>{errors.make.message}</small>}
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Modelo</span>
              <input className={inputClass} placeholder="Sprinter" {...register("model")} />
              {errors.model && <small className={errorClass}>{errors.model.message}</small>}
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Versão</span>
              <input className={inputClass} placeholder="Tourer, Sport, L3H2..." {...register("version")} />
              {errors.version && <small className={errorClass}>{errors.version.message}</small>}
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Ano</span>
              <input className={inputClass} type="number" {...register("year", { valueAsNumber: true })} />
              {errors.year && <small className={errorClass}>{errors.year.message}</small>}
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Quilometragem</span>
              <div className="relative">
                <input
                  className={`${inputClass} pr-10`}
                  type="number"
                  {...register("currentMileage", { valueAsNumber: true })}
                />
                <span className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[10px] text-[#8c9790]">
                  km
                </span>
              </div>
              {errors.currentMileage && <small className={errorClass}>{errors.currentMileage.message}</small>}
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Combustível</span>
              <select className={inputClass} {...register("fuelType")}>
                {fuelTypes.map((fuelType) => (
                  <option key={fuelType} value={fuelType}>
                    {fuelTypeLabels[fuelType]}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Estado</span>
              <select className={inputClass} {...register("status")}>
                {vehicleStatuses.map((status) => (
                  <option key={status} value={status}>
                    {vehicleStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Validade da inspeção</span>
              <input className={inputClass} type="date" {...register("inspectionDate")} />
            </label>

            <label className={fieldClass}>
              <span className={labelClass}>Validade do seguro</span>
              <input className={inputClass} type="date" {...register("insuranceDate")} />
            </label>

            <label className={`${fieldClass} col-span-full`}>
              <span className={labelClass}>Observações</span>
              <textarea
                className="w-full resize-y rounded-lg border border-[#d9e0da] bg-white p-[11px] text-xs text-[#2f3d35] outline-none transition focus:border-club-500 focus:ring-3 focus:ring-club-500/10"
                rows={4}
                placeholder="Informação adicional sobre a viatura..."
                {...register("notes")}
              />
              {errors.notes && <small className={errorClass}>{errors.notes.message}</small>}
            </label>
          </div>

          {submitError && (
            <div className="mx-6 mb-[18px] rounded-lg border border-[#efcaca] bg-[#fff0f0] px-3 py-2.5 text-xs text-[#974141]">
              {submitError}
            </div>
          )}

          <footer className="flex items-center justify-end gap-[9px] border-t border-[#dde4de] bg-[#fafbfa] px-6 py-[17px]">
            <button
              className="inline-flex min-h-[42px] items-center justify-center rounded-[9px] border border-[#dde4de] bg-white px-[17px] text-[13px] font-bold text-[#48564e]"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="inline-flex min-h-[42px] items-center justify-center rounded-[9px] bg-club-800 px-[17px] text-[13px] font-bold text-white shadow-[0_6px_15px_rgba(29,70,53,0.16)] hover:bg-club-900 disabled:opacity-55"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "A guardar..."
                : vehicle
                  ? "Guardar alterações"
                  : "Adicionar viatura"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
