import { Activity, Ban, BusFront, Wrench } from "lucide-react";
import type { VehicleDashboard } from "../types/vehicle";

type VehicleStatsProps = {
  data: VehicleDashboard;
  loading?: boolean;
};

const cards = [
  {
    key: "total",
    label: "Total de viaturas",
    icon: BusFront,
    tone: "bg-club-800 text-[#e9f4dc]",
  },
  {
    key: "active",
    label: "Viaturas ativas",
    icon: Activity,
    tone: "bg-[#e9f5ed] text-[#2c8058]",
  },
  {
    key: "maintenance",
    label: "Em manutenção",
    icon: Wrench,
    tone: "bg-[#fff4df] text-[#c07b1a]",
  },
  {
    key: "unavailable",
    label: "Indisponíveis",
    icon: Ban,
    tone: "bg-[#fceaea] text-[#b84b4b]",
  },
] as const;

export function VehicleStats({ data, loading = false }: VehicleStatsProps) {
  return (
    <section
      className="mb-[22px] grid grid-cols-4 gap-[15px] max-xl:grid-cols-2 max-[480px]:grid-cols-1 max-md:gap-[9px]"
      aria-label="Resumo da frota"
    >
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <article
          className="flex min-h-28 items-center gap-[15px] rounded-[13px] border border-[#dde4de] bg-white p-5 shadow-[0_3px_16px_rgba(25,52,40,0.035)] max-md:min-h-[95px] max-md:gap-2.5 max-md:p-3.5"
          key={key}
        >
          <div
            className={`grid h-[43px] w-[43px] shrink-0 place-items-center rounded-[10px] max-md:h-9 max-md:w-9 ${tone}`}
          >
            <Icon size={21} />
          </div>
          <div>
            <span className="mb-[5px] block text-xs text-[#6e7c74] max-md:text-[10px]">
              {label}
            </span>
            <strong
              className={`block font-display text-[27px] leading-none text-club-950 max-md:text-[22px] ${
                loading
                  ? "animate-pulse rounded-[5px] bg-[#edf1ed] text-transparent"
                  : ""
              }`}
            >
              {loading ? "00" : data[key]}
            </strong>
          </div>
        </article>
      ))}
    </section>
  );
}
