import { vehicleStatusLabels } from "../constants/vehicle-options";
import type { VehicleStatus } from "../types/vehicle";

type StatusBadgeProps = {
  status: VehicleStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tones: Record<VehicleStatus, string> = {
    ACTIVE: "bg-[#e9f5ed] text-[#287a50]",
    MAINTENANCE: "bg-[#fff4df] text-[#a86c15]",
    UNAVAILABLE: "bg-[#fceaea] text-[#aa4747]",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-[5px] text-[10px] font-bold ${tones[status]}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      {vehicleStatusLabels[status]}
    </span>
  );
}
