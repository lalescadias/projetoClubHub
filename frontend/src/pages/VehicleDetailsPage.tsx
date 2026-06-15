import {
  ArrowLeft,
  CalendarDays,
  Fuel,
  Gauge,
  MapPin,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../modules/auth/context/AuthContext";
import { vehicleApi } from "../modules/vehicles/api/vehicle.api";
import { StatusBadge } from "../modules/vehicles/components/StatusBadge";
import { VehicleUsageFormModal } from "../modules/vehicles/components/VehicleUsageFormModal";
import { DeleteVehicleUsageModal } from "../modules/vehicles/components/DeleteVehicleUsageModal";
import {
  fuelTypeLabels,
  vehicleTypeLabels,
} from "../modules/vehicles/constants/vehicle-options";
import type {
  Vehicle,
  VehicleUsage,
  VehicleUsagePayload,
} from "../modules/vehicles/types/vehicle";
import { getErrorMessage } from "../services/error.service";

const numberFormatter = new Intl.NumberFormat("pt-PT");
const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});
const dateFormatter = new Intl.DateTimeFormat("pt-PT");

export function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { activeMembership } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [usages, setUsages] = useState<VehicleUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [usageToDelete, setUsageToDelete] = useState<VehicleUsage | null>(null);
  const canManage = activeMembership?.role === "ADMIN";

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [vehicleData, usageData] = await Promise.all([
        vehicleApi.getById(id),
        vehicleApi.listUsages(id, 1, 50),
      ]);
      setVehicle(vehicleData);
      setUsages(usageData.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => void load(), [load]);

  const createUsage = async (payload: VehicleUsagePayload) => {
    if (!id) return;
    await vehicleApi.createUsage(id, payload);
    await load();
  };

  const removeUsage = async (confirmation: string) => {
    if (!id || !usageToDelete) return;
    await vehicleApi.removeUsage(id, usageToDelete.id, confirmation);
    await load();
  };

  if (loading) return <LoadingState />;
  if (!vehicle || error) {
    return (
      <div className="rounded-xl border border-[#efcaca] bg-white p-8 text-center text-sm text-[#974141]">
        {error ?? "Viatura não encontrada."}
      </div>
    );
  }

  return (
    <>
      <Link className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-club-600" to="/vehicles">
        <ArrowLeft size={16} /> Voltar às viaturas
      </Link>
      <PageHeader
        eyebrow={vehicle.plate}
        title={`${vehicle.make} ${vehicle.model}`}
        description={[vehicle.version, vehicle.year].filter(Boolean).join(" · ")}
        actions={
          canManage && vehicle.status !== "UNAVAILABLE" ? (
            <button
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-club-800 px-4 text-xs font-bold text-white max-sm:w-full"
              type="button"
              onClick={() => setShowUsageForm(true)}
            >
              <Plus size={17} /> Registar utilização
            </button>
          ) : undefined
        }
      />

      <section className="mb-5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <DetailCard icon={Gauge} label="Quilometragem atual" value={`${numberFormatter.format(vehicle.currentMileage)} km`} />
        <DetailCard icon={Fuel} label="Combustível" value={fuelTypeLabels[vehicle.fuelType]} />
        <DetailCard icon={CalendarDays} label="Tipo e ano" value={`${vehicleTypeLabels[vehicle.type]} · ${vehicle.year}`} />
        <article className="flex min-h-24 items-center rounded-xl border border-[#dde4de] bg-white p-4">
          <div><span className="mb-2 block text-[10px] uppercase tracking-wide text-[#7c8981]">Estado</span><StatusBadge status={vehicle.status} /></div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[13px] border border-[#dde4de] bg-white">
        <header className="flex items-center justify-between border-b border-[#dde4de] p-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">Registos</span>
            <h2 className="mt-1 font-display text-lg text-club-950">Histórico de utilizações</h2>
          </div>
          <span className="rounded-full bg-[#f2f5f2] px-3 py-1 text-[10px] font-bold text-[#657269]">
            {usages.length} {usages.length === 1 ? "utilização" : "utilizações"}
          </span>
        </header>

        {usages.length === 0 ? (
          <div className="grid min-h-52 place-content-center text-center">
            <Gauge className="mx-auto mb-3 text-club-500" />
            <strong className="text-sm">Sem utilizações registadas</strong>
            <span className="mt-1 text-xs text-[#7c8981]">O histórico desta viatura aparecerá aqui.</span>
          </div>
        ) : (
          <div className="divide-y divide-[#edf0ed]">
            {usages.map((usage) => (
              <article className="grid grid-cols-[130px_minmax(180px,1fr)_150px_130px_auto] items-center gap-4 p-5 max-lg:grid-cols-2 max-sm:grid-cols-1" key={usage.id}>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-[#88938c]">Data</span>
                  <strong className="mt-1 block text-xs">{dateFormatter.format(new Date(usage.usageDate))}</strong>
                </div>
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#88938c]"><MapPin size={13} /> Destino</span>
                  <strong className="mt-1 block truncate text-xs">{usage.destination}</strong>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[#7c8981]"><UserRound size={12} /> {usage.usedBy}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-[#88938c]">Percurso</span>
                  <strong className="mt-1 block text-xs">{numberFormatter.format(usage.endMileage - usage.startMileage)} km</strong>
                  <span className="mt-1 block text-[11px] text-[#7c8981]">{numberFormatter.format(usage.startMileage)} → {numberFormatter.format(usage.endMileage)}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-[#88938c]">Abastecimento</span>
                  <strong className="mt-1 block text-xs">{usage.fuelAmount !== null ? `${usage.fuelAmount} L/kWh` : "Sem registo"}</strong>
                  {usage.fuelCost !== null && <span className="mt-1 block text-[11px] text-[#7c8981]">{currencyFormatter.format(usage.fuelCost)}</span>}
                </div>
                {canManage && usage.id === usages[0]?.id && (
                  <button
                    className="grid h-9 w-9 place-items-center rounded-lg border border-[#efcece] text-[#b84b4b] hover:bg-[#fceaea] max-lg:justify-self-end max-sm:justify-self-start"
                    type="button"
                    onClick={() => setUsageToDelete(usage)}
                    aria-label="Apagar utilização"
                    title="Apagar a utilização mais recente"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                {usage.notes && <p className="col-span-full m-0 rounded-lg bg-[#f7f9f7] p-3 text-xs text-[#657269]">{usage.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      {showUsageForm && (
        <VehicleUsageFormModal
          vehicle={vehicle}
          onClose={() => setShowUsageForm(false)}
          onSubmit={createUsage}
        />
      )}
      {usageToDelete && (
        <DeleteVehicleUsageModal
          usage={usageToDelete}
          onClose={() => setUsageToDelete(null)}
          onConfirm={removeUsage}
        />
      )}
    </>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <article className="flex min-h-24 items-center gap-3 rounded-xl border border-[#dde4de] bg-white p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-club-100 text-club-600"><Icon size={19} /></span>
      <div><span className="block text-[10px] uppercase tracking-wide text-[#7c8981]">{label}</span><strong className="mt-1 block text-sm text-[#2d3a33]">{value}</strong></div>
    </article>
  );
}
