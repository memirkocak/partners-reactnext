import { useNotification as useNotificationContext } from "@/context/NotificationContext";

export function useNotification() {
  return useNotificationContext();
}

