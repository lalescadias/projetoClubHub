import { apiClient } from "../../../api/client";
import type { ApiResponse } from "../../../types/api";
import type { ClubRole } from "../../auth/types/auth";
import type { ClubUser, CreateClubUserPayload } from "../types/user";

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
    payload: { role?: ClubRole; isActive?: boolean },
  ) {
    const response = await apiClient.patch<ApiResponse<ClubUser>>(
      `/users/${membershipId}`,
      payload,
    );
    return response.data.data;
  },
};
