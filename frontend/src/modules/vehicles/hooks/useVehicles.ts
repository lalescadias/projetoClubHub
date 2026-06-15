import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../services/error.service";
import { vehicleApi } from "../api/vehicle.api";
import type {
  Vehicle,
  VehicleListParams,
  VehiclePayload,
} from "../types/vehicle";
import { refreshNotifications } from "../../notifications/hooks/useNotifications";

export function useVehicles(params: VehicleListParams) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await vehicleApi.list(params);
      setVehicles(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [params.limit, params.page, params.search, params.status]);

  useEffect(() => {
    void loadVehicles();
  }, [loadVehicles]);

  const createVehicle = async (payload: VehiclePayload) => {
    await vehicleApi.create(payload);
    await loadVehicles();
    refreshNotifications();
  };

  const updateVehicle = async (id: string, payload: VehiclePayload) => {
    await vehicleApi.update(id, payload);
    await loadVehicles();
    refreshNotifications();
  };

  const removeVehicle = async (id: string) => {
    await vehicleApi.remove(id);
    await loadVehicles();
    refreshNotifications();
  };

  return {
    vehicles,
    total,
    totalPages,
    loading,
    error,
    reload: loadVehicles,
    createVehicle,
    updateVehicle,
    removeVehicle,
  };
}
