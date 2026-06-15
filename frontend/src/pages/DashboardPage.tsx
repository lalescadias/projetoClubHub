import { ArrowRight, CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { VehicleStats } from "../modules/vehicles/components/VehicleStats";
import { StatusBadge } from "../modules/vehicles/components/StatusBadge";
import { useVehicleDashboard } from "../modules/vehicles/hooks/useVehicleDashboard";
import { useVehicles } from "../modules/vehicles/hooks/useVehicles";

export function DashboardPage() {
  const dashboard = useVehicleDashboard();
  const vehicles = useVehicles({ page: 1, limit: 5 });
  const today = new Intl.DateTimeFormat("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  const activePercentage =
    dashboard.data.total > 0
      ? Math.round((dashboard.data.active / dashboard.data.total) * 100)
      : 0;

  return (
    <>
      <PageHeader
        eyebrow={today}
        title="Bom dia, Nuno."
        description="Aqui está o ponto de situação do clube."
      />

      {(dashboard.error || vehicles.error) && (
        <div className="mb-[18px] rounded-lg border border-[#efcaca] bg-[#fff0f0] px-[13px] py-[11px] text-xs text-[#974141]">
          Não foi possível atualizar todos os dados. Confirme se a API está disponível.
        </div>
      )}

      <VehicleStats data={dashboard.data} loading={dashboard.loading} />

      <div className="grid grid-cols-[minmax(0,1.75fr)_minmax(280px,0.8fr)] gap-[18px] max-xl:grid-cols-1">
        <section className="rounded-[13px] border border-[#dde4de] bg-white shadow-[0_3px_16px_rgba(25,52,40,0.035)]">
          <header className="flex items-center justify-between gap-5 border-b border-[#edf0ed] px-[23px] pb-[17px] pt-[22px]">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
                Frota
              </span>
              <h2 className="m-0 font-display text-[17px] tracking-[-0.35px] text-club-950">
                Viaturas recentes
              </h2>
            </div>
            <Link className="flex items-center gap-[5px] text-xs font-bold text-club-600" to="/vehicles">
              Ver todas <ArrowRight size={16} />
            </Link>
          </header>

          <div className="px-[23px] pb-2.5 pt-[5px]">
            {vehicles.vehicles.map((vehicle) => (
              <div
                className="grid min-h-[65px] grid-cols-[38px_minmax(140px,1fr)_125px_100px] items-center gap-3 border-b border-[#eff2ef] last:border-0 max-md:grid-cols-[38px_1fr_auto]"
                key={vehicle.id}
              >
                <span className="grid h-[35px] w-[35px] place-items-center rounded-[9px] bg-[#edf3ea] text-xs font-extrabold text-club-800">
                  {vehicle.make.slice(0, 1)}
                </span>
                <div>
                  <strong className="block text-xs text-[#27352e]">
                    {vehicle.make} {vehicle.model}
                  </strong>
                  <span className="mt-[3px] block text-[11px] text-[#859088]">
                    {vehicle.plate}
                  </span>
                </div>
                <StatusBadge status={vehicle.status} />
                <span className="mt-[3px] text-right text-[11px] text-[#859088] max-md:hidden">
                  {new Intl.NumberFormat("pt-PT").format(vehicle.mileage)} km
                </span>
              </div>
            ))}
            {!vehicles.loading && vehicles.vehicles.length === 0 && (
              <div className="py-10 text-center text-[13px] text-[#6e7c74]">
                Ainda não existem viaturas registadas.
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-[13px] border border-[#dde4de] bg-white shadow-[0_3px_16px_rgba(25,52,40,0.035)]">
          <header className="flex items-center justify-between gap-5 border-b border-[#edf0ed] px-[23px] pb-[17px] pt-[22px]">
            <div>
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
                Disponibilidade
              </span>
              <h2 className="m-0 font-display text-[17px] tracking-[-0.35px] text-club-950">
                Saúde da frota
              </h2>
            </div>
            <CheckCircle2 size={20} className="text-club-500" />
          </header>

          <div className="px-[23px] pb-[17px] pt-7">
            <strong className="mb-0.5 block font-display text-4xl tracking-[-1.5px] text-club-950">
              {activePercentage}%
            </strong>
            <span className="block text-[11px] text-[#6e7c74]">da frota está operacional</span>
          </div>
          <div className="mx-[23px] mb-[27px] h-[7px] overflow-hidden rounded-full bg-[#edf0ed]">
            <span
              className="block h-full rounded-[inherit] bg-linear-to-r from-club-600 to-[#6eaa6b] transition-[width] duration-400"
              style={{ width: `${activePercentage}%` }}
            />
          </div>
          <div className="grid gap-[13px] px-[23px] pb-[25px]">
            <div className="grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[11px] text-[#66736c]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#4b9a6d]" />
              Ativas
              <strong className="text-[#26332c]">{dashboard.data.active}</strong>
            </div>
            <div className="grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[11px] text-[#66736c]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#daa142]" />
              Manutenção
              <strong className="text-[#26332c]">{dashboard.data.maintenance}</strong>
            </div>
            <div className="grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[11px] text-[#66736c]">
              <span className="h-[7px] w-[7px] rounded-full bg-[#c76262]" />
              Indisponíveis
              <strong className="text-[#26332c]">{dashboard.data.unavailable}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-[18px] flex items-center gap-[15px] rounded-[13px] border border-[#dce6d5] bg-linear-to-r from-[#f1f6eb] to-white px-[22px] py-[18px]">
        <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px] bg-[#dfead7] text-club-600">
          <CalendarDays size={21} />
        </div>
        <div className="flex-1">
          <span className="mb-[3px] block text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
            Próximos passos
          </span>
          <strong className="mb-[3px] block text-[13px] text-[#25362d]">Documentação da frota</strong>
          <p className="m-0 text-[11px] text-[#6e7c74]">
            As datas de inspeção e seguro já podem ser registadas em cada viatura.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-club-600 max-md:hidden">
          <Clock3 size={15} /> Acompanhar
        </span>
      </section>
    </>
  );
}
