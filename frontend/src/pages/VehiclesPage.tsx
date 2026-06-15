import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DeleteVehicleModal } from "../modules/vehicles/components/DeleteVehicleModal";
import { VehicleFormModal } from "../modules/vehicles/components/VehicleFormModal";
import { VehicleStats } from "../modules/vehicles/components/VehicleStats";
import { VehicleTable } from "../modules/vehicles/components/VehicleTable";
import { vehicleStatusLabels } from "../modules/vehicles/constants/vehicle-options";
import { useVehicleDashboard } from "../modules/vehicles/hooks/useVehicleDashboard";
import { useVehicles } from "../modules/vehicles/hooks/useVehicles";
import {
  vehicleStatuses,
  type Vehicle,
  type VehiclePayload,
  type VehicleStatus,
} from "../modules/vehicles/types/vehicle";
import { useAuth } from "../modules/auth/context/AuthContext";

export function VehiclesPage() {
  const navigate = useNavigate();
  const { activeMembership } = useAuth();
  const canManage = activeMembership?.role === "ADMIN";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [page, setPage] = useState(1);
  const [formVehicle, setFormVehicle] = useState<Vehicle | null | undefined>();
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const vehicleList = useVehicles({
    search: debouncedSearch || undefined,
    status: status || undefined,
    page,
    limit: 10,
  });
  const dashboard = useVehicleDashboard();

  const openCreate = () => setFormVehicle(null);
  const closeForm = () => setFormVehicle(undefined);

  const submitVehicle = async (payload: VehiclePayload) => {
    if (formVehicle) {
      await vehicleList.updateVehicle(formVehicle.id, payload);
    } else {
      await vehicleList.createVehicle(payload);
    }
    await dashboard.reload();
  };

  const confirmDelete = async () => {
    if (!deleteVehicle) return;
    await vehicleList.removeVehicle(deleteVehicle.id);
    await dashboard.reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="Operações"
        title="Gestão de viaturas"
        description="Controle a frota, documentação e disponibilidade do clube."
        actions={canManage ? (
          <button
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[9px] bg-club-800 px-[17px] text-[13px] font-bold text-white shadow-[0_6px_15px_rgba(29,70,53,0.16)] transition hover:-translate-y-px hover:bg-club-900 max-[480px]:w-full"
            type="button"
            onClick={openCreate}
          >
            <Plus size={18} />
            Nova viatura
          </button>
        ) : undefined}
      />

      <VehicleStats data={dashboard.data} loading={dashboard.loading} />

      <section className="rounded-[13px] border border-[#dde4de] bg-white shadow-[0_3px_16px_rgba(25,52,40,0.035)]">
        <header className="flex items-center justify-between gap-3.5 border-b border-[#dde4de] p-[18px] py-4 max-md:flex-col max-md:items-stretch">
          <div className="flex h-10 w-full max-w-[390px] items-center gap-[9px] rounded-lg border border-[#dde4de] bg-white px-3 text-[#829087] max-md:max-w-none">
            <Search size={18} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-xs text-[#35433b] outline-none placeholder:text-[#9ca69f]"
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Pesquisar matrícula, marca ou modelo..."
              aria-label="Pesquisar viaturas"
            />
          </div>
          <div className="flex h-10 items-center gap-[9px] rounded-lg border border-[#dde4de] bg-white pl-3 pr-2 text-[#829087]">
            <SlidersHorizontal size={17} />
            <select
              className="min-w-0 flex-1 border-0 bg-transparent pr-2 text-xs text-[#35433b] outline-none"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as VehicleStatus | "");
                setPage(1);
              }}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos os estados</option>
              {vehicleStatuses.map((option) => (
                <option value={option} key={option}>
                  {vehicleStatusLabels[option]}
                </option>
              ))}
            </select>
          </div>
        </header>

        {vehicleList.error && (
          <div className="mx-[18px] mt-3 flex items-center justify-between rounded-lg border border-[#efcaca] bg-[#fff0f0] px-[13px] py-[11px] text-xs text-[#974141]">
            {vehicleList.error}
            <button
              className="border-0 bg-transparent font-bold text-inherit underline"
              type="button"
              onClick={() => void vehicleList.reload()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        <VehicleTable
          vehicles={vehicleList.vehicles}
          loading={vehicleList.loading}
          onEdit={setFormVehicle}
          onDelete={setDeleteVehicle}
          onView={(vehicle) => navigate(`/vehicles/${vehicle.id}`)}
          canManage={canManage}
        />

        <footer className="flex min-h-[60px] items-center justify-between border-t border-[#dde4de] px-[18px] text-[10px] text-[#849087] max-[480px]:justify-center">
          <span className="max-[480px]:hidden">
            {vehicleList.total} {vehicleList.total === 1 ? "viatura" : "viaturas"}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              className="grid h-[31px] w-[31px] place-items-center rounded-[9px] border border-[#dde4de] bg-white text-[#536159] hover:bg-[#f7f9f7] disabled:opacity-55"
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              Página {page} de {vehicleList.totalPages}
            </span>
            <button
              className="grid h-[31px] w-[31px] place-items-center rounded-[9px] border border-[#dde4de] bg-white text-[#536159] hover:bg-[#f7f9f7] disabled:opacity-55"
              type="button"
              disabled={page >= vehicleList.totalPages}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Página seguinte"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      </section>

      {formVehicle !== undefined && (
        <VehicleFormModal
          vehicle={formVehicle}
          onClose={closeForm}
          onSubmit={submitVehicle}
        />
      )}

      {deleteVehicle && (
        <DeleteVehicleModal
          vehicle={deleteVehicle}
          onClose={() => setDeleteVehicle(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
