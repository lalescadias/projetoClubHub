import {
  ArrowLeft,
  CalendarDays,
  Eye,
  Fuel,
  Gauge,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingState } from "../components/LoadingState";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../modules/auth/context/AuthContext";
import { refreshNotifications } from "../modules/notifications/hooks/useNotifications";
import { vehicleApi } from "../modules/vehicles/api/vehicle.api";
import { DeleteVehicleUsageModal } from "../modules/vehicles/components/DeleteVehicleUsageModal";
import { StatusBadge } from "../modules/vehicles/components/StatusBadge";
import { VehicleRevisionDetailsModal } from "../modules/vehicles/components/VehicleRevisionDetailsModal";
import { VehicleRevisionFormModal } from "../modules/vehicles/components/VehicleRevisionFormModal";
import { VehicleUsageFormModal } from "../modules/vehicles/components/VehicleUsageFormModal";
import {
  fuelTypeLabels,
  vehicleTypeLabels,
} from "../modules/vehicles/constants/vehicle-options";
import type {
  Vehicle,
  VehicleRevision,
  VehicleRevisionPayload,
  VehicleUsage,
  VehicleUsagePayload,
} from "../modules/vehicles/types/vehicle";
import { getErrorMessage } from "../services/error.service";

const numberFormatter = new Intl.NumberFormat("pt-PT");
const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});
const dateFormatter = new Intl.DateTimeFormat("pt-PT", { timeZone: "UTC" });

export function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { activeMembership } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [usages, setUsages] = useState<VehicleUsage[]>([]);
  const [revisions, setRevisions] = useState<VehicleRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [revisionForm, setRevisionForm] =
    useState<VehicleRevision | null | undefined>(undefined);
  const [revisionDetails, setRevisionDetails] =
    useState<VehicleRevision | null>(null);
  const [usageToDelete, setUsageToDelete] = useState<VehicleUsage | null>(null);
  const canManage = activeMembership?.role === "ADMIN";

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [vehicleData, usageData, revisionData] = await Promise.all([
        vehicleApi.getById(id),
        vehicleApi.listUsages(id, 1, 50),
        vehicleApi.listRevisions(id, 1, 100),
      ]);
      setVehicle(vehicleData);
      setUsages(usageData.data);
      setRevisions(revisionData.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => void load(), [load]);

  const latestRevision = revisions[0] ?? null;
  const nextRevision = useMemo(() => {
    const source = revisions.find(
      (revision) =>
        revision.nextRevisionDate || revision.nextRevisionMileage !== null,
    );
    if (!source) return "Não prevista";
    return [
      source.nextRevisionDate &&
        dateFormatter.format(new Date(source.nextRevisionDate)),
      source.nextRevisionMileage !== null &&
        `${numberFormatter.format(source.nextRevisionMileage)} km`,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [revisions]);

  const createUsage = async (payload: VehicleUsagePayload) => {
    if (!id) return;
    await vehicleApi.createUsage(id, payload);
    refreshNotifications();
    await load();
  };

  const removeUsage = async (confirmation: string) => {
    if (!id || !usageToDelete) return;
    await vehicleApi.removeUsage(id, usageToDelete.id, confirmation);
    refreshNotifications();
    await load();
  };

  const saveRevision = async (payload: VehicleRevisionPayload) => {
    if (!id) return;
    if (revisionForm) {
      await vehicleApi.updateRevision(id, revisionForm.id, payload);
    } else {
      await vehicleApi.createRevision(id, payload);
    }
    refreshNotifications();
    await load();
  };

  const removeRevision = async (revision: VehicleRevision) => {
    if (
      !id ||
      !window.confirm(`Apagar a revisão "${revision.description}"?`)
    ) {
      return;
    }
    try {
      await vehicleApi.removeRevision(id, revision.id);
      refreshNotifications();
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
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
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-club-600"
        to="/vehicles"
      >
        <ArrowLeft size={16} /> Voltar às viaturas
      </Link>
      <PageHeader
        eyebrow={vehicle.plate}
        title={`${vehicle.make} ${vehicle.model}`}
        description={[vehicle.version, vehicle.year].filter(Boolean).join(" · ")}
        actions={
          canManage ? (
            <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
              <button
                className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-club-700 bg-white px-4 text-xs font-bold text-club-800"
                type="button"
                onClick={() => setRevisionForm(null)}
              >
                <Wrench size={17} /> Nova revisão
              </button>
              {vehicle.status !== "UNAVAILABLE" && (
                <button
                  className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg bg-club-800 px-4 text-xs font-bold text-white"
                  type="button"
                  onClick={() => setShowUsageForm(true)}
                >
                  <Plus size={17} /> Registar utilização
                </button>
              )}
            </div>
          ) : undefined
        }
      />

      <section className="mb-5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <DetailCard
          icon={Gauge}
          label="Quilometragem atual"
          value={`${numberFormatter.format(vehicle.currentMileage)} km`}
        />
        <DetailCard
          icon={Fuel}
          label="Combustível"
          value={fuelTypeLabels[vehicle.fuelType]}
        />
        <DetailCard
          icon={CalendarDays}
          label="Tipo e ano"
          value={`${vehicleTypeLabels[vehicle.type]} · ${vehicle.year}`}
        />
        <article className="flex min-h-24 items-center rounded-xl border border-[#dde4de] bg-white p-4">
          <div>
            <span className="mb-2 block text-[10px] uppercase tracking-wide text-[#7c8981]">
              Estado
            </span>
            <StatusBadge status={vehicle.status} />
          </div>
        </article>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
        <DetailCard
          icon={Wrench}
          label="Última revisão"
          value={
            latestRevision
              ? `${dateFormatter.format(new Date(latestRevision.revisionDate))} · ${numberFormatter.format(latestRevision.mileage)} km`
              : "Sem revisões"
          }
        />
        <DetailCard
          icon={CalendarDays}
          label="Próxima revisão prevista"
          value={nextRevision}
        />
      </section>

      <HistorySection
        title="Histórico de revisões"
        eyebrow="Manutenção"
        count={`${revisions.length} ${revisions.length === 1 ? "revisão" : "revisões"}`}
      >
        {revisions.length === 0 ? (
          <EmptyHistory
            icon={Wrench}
            title="Sem revisões registadas"
            text="O histórico de manutenção desta viatura aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-[#edf0ed]">
            {revisions.map((revision) => (
              <article
                className="grid grid-cols-[130px_minmax(190px,1fr)_150px_160px_auto] items-center gap-4 p-5 max-lg:grid-cols-2 max-sm:grid-cols-1"
                key={revision.id}
              >
                <ListValue
                  label="Data"
                  value={dateFormatter.format(new Date(revision.revisionDate))}
                />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wide text-[#88938c]">
                    Revisão
                  </span>
                  <strong className="mt-1 block truncate text-xs">
                    {revision.description}
                  </strong>
                  <span className="mt-1 block truncate text-[11px] text-[#7c8981]">
                    {revision.workshop || "Oficina não indicada"}
                  </span>
                </div>
                <ListValue
                  label="Quilometragem"
                  value={`${numberFormatter.format(revision.mileage)} km`}
                />
                <ListValue
                  label="Custo"
                  value={
                    revision.cost === null
                      ? "Sem registo"
                      : currencyFormatter.format(revision.cost)
                  }
                />
                <div className="flex gap-2 max-lg:justify-self-end max-sm:justify-self-start">
                  <IconButton
                    label="Ver detalhes"
                    onClick={() => setRevisionDetails(revision)}
                  >
                    <Eye size={16} />
                  </IconButton>
                  {canManage && (
                    <IconButton
                      label="Editar revisão"
                      onClick={() => setRevisionForm(revision)}
                    >
                      <Pencil size={16} />
                    </IconButton>
                  )}
                  {canManage && (
                    <IconButton
                      danger
                      label="Apagar revisão"
                      onClick={() => void removeRevision(revision)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </HistorySection>

      <HistorySection
        title="Histórico de utilizações"
        eyebrow="Registos"
        count={`${usages.length} ${usages.length === 1 ? "utilização" : "utilizações"}`}
      >
        {usages.length === 0 ? (
          <EmptyHistory
            icon={Gauge}
            title="Sem utilizações registadas"
            text="O histórico desta viatura aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-[#edf0ed]">
            {usages.map((usage) => (
              <article
                className="grid grid-cols-[130px_minmax(180px,1fr)_150px_130px_auto] items-center gap-4 p-5 max-lg:grid-cols-2 max-sm:grid-cols-1"
                key={usage.id}
              >
                <ListValue
                  label="Data"
                  value={dateFormatter.format(new Date(usage.usageDate))}
                />
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#88938c]">
                    <MapPin size={13} /> Destino
                  </span>
                  <strong className="mt-1 block truncate text-xs">
                    {usage.destination}
                  </strong>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[#7c8981]">
                    <UserRound size={12} /> {usage.usedBy}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide text-[#88938c]">
                    Percurso
                  </span>
                  <strong className="mt-1 block text-xs">
                    {numberFormatter.format(
                      usage.endMileage - usage.startMileage,
                    )}{" "}
                    km
                  </strong>
                  <span className="mt-1 block text-[11px] text-[#7c8981]">
                    {numberFormatter.format(usage.startMileage)} →{" "}
                    {numberFormatter.format(usage.endMileage)}
                  </span>
                </div>
                <ListValue
                  label="Abastecimento"
                  value={
                    usage.fuelAmount !== null
                      ? `${usage.fuelAmount} L/kWh`
                      : "Sem registo"
                  }
                  subvalue={
                    usage.fuelCost !== null
                      ? currencyFormatter.format(usage.fuelCost)
                      : undefined
                  }
                />
                {canManage && usage.id === usages[0]?.id && (
                  <IconButton
                    danger
                    label="Apagar utilização"
                    onClick={() => setUsageToDelete(usage)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
                {usage.notes && (
                  <p className="col-span-full m-0 rounded-lg bg-[#f7f9f7] p-3 text-xs text-[#657269]">
                    {usage.notes}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </HistorySection>

      {showUsageForm && (
        <VehicleUsageFormModal
          vehicle={vehicle}
          onClose={() => setShowUsageForm(false)}
          onSubmit={createUsage}
        />
      )}
      {revisionForm !== undefined && (
        <VehicleRevisionFormModal
          vehicle={vehicle}
          revision={revisionForm}
          onClose={() => setRevisionForm(undefined)}
          onSubmit={saveRevision}
        />
      )}
      {revisionDetails && (
        <VehicleRevisionDetailsModal
          revision={revisionDetails}
          onClose={() => setRevisionDetails(null)}
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
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-club-100 text-club-600">
        <Icon size={19} />
      </span>
      <div>
        <span className="block text-[10px] uppercase tracking-wide text-[#7c8981]">
          {label}
        </span>
        <strong className="mt-1 block text-sm text-[#2d3a33]">{value}</strong>
      </div>
    </article>
  );
}

function HistorySection({
  title,
  eyebrow,
  count,
  children,
}: {
  title: string;
  eyebrow: string;
  count: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5 overflow-hidden rounded-[13px] border border-[#dde4de] bg-white">
      <header className="flex items-center justify-between border-b border-[#dde4de] p-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[1.3px] text-club-600">
            {eyebrow}
          </span>
          <h2 className="mt-1 font-display text-lg text-club-950">{title}</h2>
        </div>
        <span className="rounded-full bg-[#f2f5f2] px-3 py-1 text-[10px] font-bold text-[#657269]">
          {count}
        </span>
      </header>
      {children}
    </section>
  );
}

function EmptyHistory({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Gauge;
  title: string;
  text: string;
}) {
  return (
    <div className="grid min-h-52 place-content-center text-center">
      <Icon className="mx-auto mb-3 text-club-500" />
      <strong className="text-sm">{title}</strong>
      <span className="mt-1 text-xs text-[#7c8981]">{text}</span>
    </div>
  );
}

function ListValue({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div>
      <span className="block text-[10px] uppercase tracking-wide text-[#88938c]">
        {label}
      </span>
      <strong className="mt-1 block text-xs">{value}</strong>
      {subvalue && (
        <span className="mt-1 block text-[11px] text-[#7c8981]">
          {subvalue}
        </span>
      )}
    </div>
  );
}

function IconButton({
  label,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={`grid h-9 w-9 place-items-center rounded-lg border ${
        danger
          ? "border-[#efcece] text-[#b84b4b] hover:bg-[#fceaea]"
          : "border-[#dce3dd] text-club-700 hover:bg-club-100"
      }`}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
