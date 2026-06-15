import { apiClient } from "../../../api/client";
import type { ApiResponse } from "../../../types/api";
import type {
  ClubUser,
  CreateClubUserPayload,
  UpdateClubUserPayload,
} from "../types/user";

export const userApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<ClubUser[]>>("/users");
    return response.data.data;
  },

  async create(payload: CreateClubUserPayload) {
    const response = await apiClient.post<ApiResponse<ClubUser>>("/users", payload);
    return response.data.data;
  },

  async update(
    membershipId: string,
    payload: UpdateClubUserPayload,
  ) {
    const response = await apiClient.patch<ApiResponse<ClubUser>>(
      `/users/${membershipId}`,
      payload,
    );
    return response.data.data;
  },

  async remove(membershipId: string, confirmation: string) {
    await apiClient.delete(`/users/${membershipId}`, {
      data: { confirmation },
    });
  },
};
