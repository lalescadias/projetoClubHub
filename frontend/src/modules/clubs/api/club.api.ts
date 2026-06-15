import { apiClient } from "../../../api/client";
import type { ApiResponse } from "../../../types/api";
import type { ClubPayload, ManagedClub } from "../types/club";

export const clubApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<ManagedClub[]>>("/clubs");
    return response.data.data;
  },

  async create(payload: ClubPayload) {
    const response = await apiClient.post<ApiResponse<ManagedClub>>(
      "/clubs",
      payload,
    );
    return response.data.data;
  },

  async update(clubId: string, payload: Partial<ClubPayload>) {
    const response = await apiClient.patch<ApiResponse<ManagedClub>>(
      `/clubs/${clubId}`,
      payload,
    );
    return response.data.data;
  },

  async updateTheme(themeColor: string) {
    const response = await apiClient.patch<
      ApiResponse<Pick<ManagedClub, "id" | "name" | "slug" | "themeColor">>
    >("/clubs/current/theme", { themeColor });
    return response.data.data;
  },

  async remove(clubId: string, confirmation: string) {
    await apiClient.delete(`/clubs/${clubId}`, {
      data: { confirmation },
    });
  },
};
