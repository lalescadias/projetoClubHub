import { apiClient } from "../../../api/client";
import type { ApiResponse } from "../../../types/api";
import type { LoginResponse, SessionUser } from "../types/auth";

export const authApi = {
  async login(club: string, email: string, password: string) {
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", {
      club,
      email,
      password,
    });
    return response.data.data;
  },

  async me() {
    const response = await apiClient.get<ApiResponse<SessionUser>>("/auth/me");
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await apiClient.patch("/auth/password", { currentPassword, newPassword });
  },
};
