import { apiClient } from "../../../api/client";
import type { ApiResponse, PaginatedResponse } from "../../../types/api";
import type {
  Vehicle,
  VehicleDashboard,
  VehicleListParams,
  VehiclePayload,
  VehicleUsage,
  VehicleUsagePayload,
  VehicleRevision,
  VehicleRevisionPayload,
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

  async listUsages(id: string, page = 1, limit = 20) {
    const response = await apiClient.get<PaginatedResponse<VehicleUsage>>(
      `/vehicles/${id}/usages`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async createUsage(id: string, payload: VehicleUsagePayload) {
    const response = await apiClient.post<
      ApiResponse<{ usage: VehicleUsage; currentMileage: number }>
    >(`/vehicles/${id}/usages`, payload);
    return response.data.data;
  },

  async removeUsage(vehicleId: string, usageId: string, confirmation: string) {
    const response = await apiClient.delete<
      ApiResponse<{ currentMileage: number }>
    >(`/vehicles/${vehicleId}/usages/${usageId}`, {
      data: { confirmation },
    });
    return response.data.data;
  },

  async listRevisions(id: string, page = 1, limit = 20) {
    const response = await apiClient.get<PaginatedResponse<VehicleRevision>>(
      `/vehicles/${id}/revisions`,
      { params: { page, limit } },
    );
    return response.data;
  },

  async getRevision(vehicleId: string, revisionId: string) {
    const response = await apiClient.get<ApiResponse<VehicleRevision>>(
      `/vehicles/${vehicleId}/revisions/${revisionId}`,
    );
    return response.data.data;
  },

  async createRevision(vehicleId: string, payload: VehicleRevisionPayload) {
    const response = await apiClient.post<ApiResponse<VehicleRevision>>(
      `/vehicles/${vehicleId}/revisions`,
      payload,
    );
    return response.data.data;
  },

  async updateRevision(
    vehicleId: string,
    revisionId: string,
    payload: Partial<VehicleRevisionPayload>,
  ) {
    const response = await apiClient.patch<ApiResponse<VehicleRevision>>(
      `/vehicles/${vehicleId}/revisions/${revisionId}`,
      payload,
    );
    return response.data.data;
  },

  async removeRevision(vehicleId: string, revisionId: string) {
    await apiClient.delete(`/vehicles/${vehicleId}/revisions/${revisionId}`);
  },
};
