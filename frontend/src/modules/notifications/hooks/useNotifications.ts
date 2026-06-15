import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../services/error.service";
import { notificationApi } from "../api/notification.api";
import type { Notification } from "../types/notification";

export const NOTIFICATIONS_REFRESH_EVENT = "clubhub:notifications:refresh";

export function refreshNotifications() {
  window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
}

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

  useEffect(() => {
    const refresh = () => void load();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const interval = window.setInterval(refresh, 60_000);

    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load]);

  const dismiss = useCallback(
    async (notificationId: string) => {
      await notificationApi.dismiss(notificationId);
      setNotifications((items) =>
        items.filter((item) => item.id !== notificationId),
      );
      refreshNotifications();
    },
    [],
  );

  return { notifications, loading, error, reload: load, dismiss };
}
