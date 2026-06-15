import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../services/error.service";
import { notificationApi } from "../api/notification.api";
import type { Notification } from "../types/notification";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotifications(await notificationApi.list());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);

  return { notifications, loading, error, reload: load };
}
