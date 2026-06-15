import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../services/error.service";
import { vehicleApi } from "../api/vehicle.api";
import type { VehicleDashboard } from "../types/vehicle";

const initialData: VehicleDashboard = {
  total: 0,
  active: 0,
  maintenance: 0,
  unavailable: 0,
};

export function useVehicleDashboard() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await vehicleApi.dashboard());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return { data, loading, error, reload: loadDashboard };
}
