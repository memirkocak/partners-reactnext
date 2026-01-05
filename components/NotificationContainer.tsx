"use client";

import { useNotification } from "@/context/NotificationContext";
import { useEffect, useState } from "react";

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "warning":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-500/10 border-green-500/20",
          icon: "text-green-400",
          title: "text-green-400",
          message: "text-green-300/80",
        };
      case "error":
        return {
          bg: "bg-red-500/10 border-red-500/20",
          icon: "text-red-400",
          title: "text-red-400",
          message: "text-red-300/80",
        };
      case "warning":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/20",
          icon: "text-yellow-400",
          title: "text-yellow-400",
          message: "text-yellow-300/80",
        };
      case "info":
        return {
          bg: "bg-blue-500/10 border-blue-500/20",
          icon: "text-blue-400",
          title: "text-blue-400",
          message: "text-blue-300/80",
        };
      default:
        return {
          bg: "bg-neutral-800/50 border-neutral-700",
          icon: "text-neutral-400",
          title: "text-neutral-300",
          message: "text-neutral-400",
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((notification) => {
        const styles = getStyles(notification.type);
        return (
          <div
            key={notification.id}
            className={`pointer-events-auto rounded-xl border ${styles.bg} backdrop-blur-sm p-4 shadow-lg animate-in slide-in-from-right-full duration-300`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 ${styles.icon}`}>{getIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold ${styles.title} mb-1`}>{notification.title}</h4>
                {notification.message && (
                  <p className={`text-xs ${styles.message}`}>{notification.message}</p>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-neutral-400 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

