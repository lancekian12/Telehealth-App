"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import type { NotificationItem } from "@/components/navigation/notification-modal";

type UseRealtimeNotificationsParams = {
  role: "patient" | "doctor" | null;
  userId: string | null;
  enabled?: boolean;
};

type NotificationPayload = {
  id: string;
  recipientId: string;
  recipientRole: "patient" | "doctor";
  appointmentId: string | null;
  type:
    | "appointment_booked"
    | "appointment_accepted"
    | "appointment_rejected"
    | "appointment_cancelled"
    | "appointment_rescheduled"
    | "appointment_upcoming"
    | "schedule_updated";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

function normalizeNotification(payload: NotificationPayload): NotificationItem {
  const hrefFromMetadata =
    typeof payload.metadata?.href === "string"
      ? payload.metadata.href
      : undefined;

  return {
    _id: payload.id,
    title: payload.title,
    message: payload.message,
    createdAt: payload.createdAt,
    read: false,
    href: hrefFromMetadata ?? "/appointments",
    type: payload.type,
  };
}

export function useRealtimeNotifications({
  role,
  userId,
  enabled = true,
}: UseRealtimeNotificationsParams) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const channelName = useMemo(() => {
    if (!role || !userId) return null;
    return `private-${role}-${userId}`;
  }, [role, userId]);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);

      const res = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.notifications)) {
        const mapped: NotificationItem[] = data.notifications.map(
          (item: any) => ({
            _id: String(item._id),
            title: String(item.title || ""),
            message: String(item.message || ""),
            createdAt: String(item.createdAt || new Date().toISOString()),
            read: Boolean(item.read),
            href: typeof item.href === "string" ? item.href : "/appointments",
            type: item.type,
          }),
        );

        if (mountedRef.current) {
          setNotifications(mapped);
        }
      } else if (mountedRef.current) {
        setNotifications([]);
      }
    } catch (error) {
      console.log("[useRealtimeNotifications] fetch error:", error);
      if (mountedRef.current) {
        setNotifications([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!enabled || !channelName) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!key || !cluster) {
      console.warn(
        "Missing NEXT_PUBLIC_PUSHER_KEY or NEXT_PUBLIC_PUSHER_CLUSTER",
      );
      return;
    }

    const pusher = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: "/api/pusher/auth",
        transport: "ajax",
      },
    });

    const channel = pusher.subscribe(channelName);

    channel.bind("notification:new", (payload: NotificationPayload) => {
      const incoming = normalizeNotification(payload);
      setNotifications((prev) => [incoming, ...prev]);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [channelName, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onFocus = () => {
      fetchNotifications();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, fetchNotifications]);

  useEffect(() => {
    if (!enabled) return;

    const interval = window.setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => window.clearInterval(interval);
  }, [enabled, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!enabled) return;

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAllAsRead" }),
      });
    } catch (error) {
      console.log("[useRealtimeNotifications] markAllAsRead error:", error);
    }
  }, [enabled]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!enabled || !notificationId) return;

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, read: true } : item,
        ),
      );

      try {
        const res = await fetch("/api/notifications", {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "markAsRead",
            notificationId,
          }),
        });
      } catch (error) {
        console.log("[markAsRead] error:", error);
      }
    },
    [enabled],
  );

  return {
    notifications,
    setNotifications,
    loading,
    refreshNotifications: fetchNotifications,
    markAllAsRead,
    markAsRead,
  };
}
