import { apiClient } from "../../../api/client";
import type { ApiResponse } from "../../../types/api";
import type { Notification } from "../types/notification";

export const notificationApi = {
  async list() {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      "/notifications",
    );
    return response.data.data;
  },
};
