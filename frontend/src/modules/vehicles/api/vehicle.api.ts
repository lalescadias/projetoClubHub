import { apiClient } from "../../../api/client";
import type { ApiResponse, PaginatedResponse } from "../../../types/api";
import type {
  Vehicle,
  VehicleDashboard,
  VehicleListParams,
  VehiclePayload,
} from "../types/vehicle";

export const vehicleApi = {
  async list(params: VehicleListParams = {}) {
    const response = await apiClient.get<PaginatedResponse<Vehicle>>("/vehicles", {
      params,
    });
    return response.data;
  },

  async dashboard() {
    const response = await apiClient.get<ApiResponse<VehicleDashboard>>(
      "/vehicles/dashboard",
    );
    return response.data.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return response.data.data;
  },

  async create(payload: VehiclePayload) {
    const response = await apiClient.post<ApiResponse<Vehicle>>("/vehicles", payload);
    return response.data.data;
  },

  async update(id: string, payload: Partial<VehiclePayload>) {
    const response = await apiClient.patch<ApiResponse<Vehicle>>(
      `/vehicles/${id}`,
      payload,
    );
    return response.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/vehicles/${id}`);
  },
};
