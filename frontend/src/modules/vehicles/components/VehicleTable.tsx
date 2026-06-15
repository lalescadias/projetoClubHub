import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingState } from "../../../components/LoadingState";
import { vehicleTypeLabels } from "../constants/vehicle-options";
import type { Vehicle } from "../types/vehicle";
import { StatusBadge } from "./StatusBadge";

type VehicleTableProps = {
  vehicles: Vehicle[];
  loading: boolean;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  canManage: boolean;
};

const numberFormatter = new Intl.NumberFormat("pt-PT");

export function VehicleTable({
  vehicles,
  loading,
  onEdit,
  onDelete,
  canManage,
}: VehicleTableProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        title="Nenhuma viatura encontrada"
        description="Altere os filtros ou registe a primeira viatura da frota."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Viatura", "Matrícula", "Tipo", "Ano", "Quilometragem", "Estado"].map(
              (heading) => (
                <th
                  className="h-[42px] whitespace-nowrap bg-[#fafbfa] px-[15px] text-left text-[9px] font-bold uppercase tracking-[0.8px] text-[#89948d] max-md:hidden"
                  key={heading}
                >
                  {heading}
                </th>
              ),
            )}
            <th className="bg-[#fafbfa] max-md:hidden" aria-label="Ações" />
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              className="relative border-t border-[#edf0ed] transition hover:bg-[#fbfcfb] max-md:block max-md:px-[52px] max-md:py-[15px] max-md:pl-[15px]"
              key={vehicle.id}
            >
              <td className="h-[69px] whitespace-nowrap px-[15px] text-[11px] text-[#5f6d65] max-md:flex max-md:h-auto max-md:justify-start max-md:p-0 max-md:pb-[7px]">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-[35px] w-[35px] place-items-center rounded-[9px] bg-[#edf3ea] text-xs font-extrabold text-club-800">
                    {vehicle.make.slice(0, 1)}
                  </span>
                  <div>
                    <strong className="block text-xs text-[#28362f]">{vehicle.make}</strong>
                    <span className="mt-[3px] block text-[10px] text-[#89948d]">
                      {vehicle.model}
                    </span>
                  </div>
                </div>
              </td>
              <td
                data-label="Matrícula"
                className="h-[69px] whitespace-nowrap px-[15px] text-[11px] text-[#5f6d65] max-md:flex max-md:h-auto max-md:items-center max-md:justify-between max-md:p-[5px_0] before:max-md:content-[attr(data-label)] before:max-md:text-[9px] before:max-md:font-bold before:max-md:uppercase before:max-md:text-[#939d96]"
              >
                <span className="rounded border border-[#dce2dd] bg-[#fafbfa] px-[7px] py-1 font-mono text-[11px] font-bold tracking-[0.4px] text-[#3d4942]">
                  {vehicle.plate}
                </span>
              </td>
              <td data-label="Tipo" className="h-[69px] whitespace-nowrap px-[15px] text-[11px] text-[#5f6d65] max-md:flex max-md:h-auto max-md:items-center max-md:justify-between max-md:p-[5px_0] before:max-md:content-[attr(data-label)] before:max-md:text-[9px] before:max-md:font-bold before:max-md:uppercase before:max-md:text-[#939d96]">
                {vehicleTypeLabels[vehicle.type]}
              </td>
              <td data-label="Ano" className="h-[69px] whitespace-nowrap px-[15px] text-[11px] text-[#5f6d65] max-md:flex max-md:h-auto max-md:items-center max-md:justify-between max-md:p-[5px_0] before:max-md:content-[attr(data-label)] before:max-md:text-[9px] before:max-md:font-bold before:max-md:uppercase before:max-md:text-[#939d96]">
                {vehicle.year}
              </td>
              <td data-label="Quilometragem" className="h-[69px] whitespace-nowrap px-[15px] text-[11px] text-[#5f6d65] max-md:flex max-md:h-auto max-md:items-center max-md:justify-between max-md:p-[5px_0] before:max-md:content-[attr(data-label)] before:max-md:text-[9px] before:max-md:font-bold before:max-md:uppercase before:max-md:text-[#939d96]">
                {numberFormatter.format(vehicle.mileage)} km
              </td>
              <td data-label="Estado" className="h-[69px] whitespace-nowrap px-[15px] text-[11px] text-[#5f6d65] max-md:flex max-md:h-auto max-md:items-center max-md:justify-between max-md:p-[5px_0] before:max-md:content-[attr(data-label)] before:max-md:text-[9px] before:max-md:font-bold before:max-md:uppercase before:max-md:text-[#939d96]">
                <StatusBadge status={vehicle.status} />
              </td>
              <td className={`w-[52px] px-[15px] text-right max-md:absolute max-md:right-3 max-md:top-3.5 max-md:w-auto max-md:p-0 ${canManage ? "" : "hidden"}`}>
                <details className="relative inline-block">
                  <summary
                    className="grid h-[31px] w-[31px] list-none place-items-center rounded-[7px] hover:bg-[#f0f3f0] open:bg-[#f0f3f0]"
                    aria-label={`Ações para ${vehicle.plate}`}
                  >
                    <MoreHorizontal size={20} />
                  </summary>
                  <div className="absolute right-0 top-[35px] z-10 min-w-[135px] rounded-lg border border-[#dde4de] bg-white p-[5px] shadow-[0_10px_35px_rgba(25,52,40,0.12)]">
                    <button
                      className="flex w-full items-center gap-2 rounded-md border-0 bg-transparent p-2 text-[11px] text-[#435148] hover:bg-[#f4f6f4]"
                      type="button"
                      onClick={() => onEdit(vehicle)}
                    >
                      <Pencil size={16} /> Editar
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-md border-0 bg-transparent p-2 text-[11px] text-[#b84b4b] hover:bg-[#f4f6f4]"
                      type="button"
                      onClick={() => onDelete(vehicle)}
                    >
                      <Trash2 size={16} /> Remover
                    </button>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
