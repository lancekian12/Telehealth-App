"use client";

import React, { useEffect, useMemo } from "react";
import { CheckCircle2, X } from "lucide-react";

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  href?: string;
  type?:
    | "appointment_booked"
    | "appointment_accepted"
    | "appointment_rejected"
    | "appointment_cancelled"
    | "appointment_rescheduled"
    | "appointment_upcoming"
    | "schedule_updated"
    | "appointment_completed";
};

type NotificationModalProps = {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  loading?: boolean;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
};

function getNotificationLabel(type?: NotificationItem["type"]) {
  switch (type) {
    case "appointment_booked":
      return "Booked";
    case "appointment_accepted":
      return "Accepted";
    case "appointment_rejected":
      return "Rejected";
    case "appointment_cancelled":
      return "Cancelled";
    case "appointment_rescheduled":
      return "Updated";
    case "appointment_upcoming":
      return "Upcoming";
    case "schedule_updated":
      return "Schedule updated";
    default:
      return "Notification";
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (Number.isNaN(date.getTime())) return "";
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export default function NotificationModal({
  open,
  onClose,
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const aUnread = a.read ? 1 : 0;
      const bUnread = b.read ? 1 : 0;

      if (aUnread !== bUnread) return aUnread - bUnread;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [notifications]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  if (!open) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[10000] w-[24rem] max-w-[calc(100vw-1rem)] pointer-events-auto">
      <div
        className="overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#008081]/10 px-2 py-0.5 text-[11px] font-semibold text-[#008081] dark:bg-[#008081]/20 dark:text-[#7dd3fc]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Latest updates</p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  console.log("[NotificationModal] Mark all read clicked");
                  onMarkAllAsRead();
                }}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Mark all read
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                console.log("[NotificationModal] Close clicked");
                onClose();
              }}
              aria-label="Close notifications"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div
          className="max-h-[24rem] overflow-y-auto p-2"
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="space-y-2 p-2">
              <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : sortedNotifications.length > 0 ? (
            sortedNotifications.map((item) => {
              const isRead = !!item.read;

              return (
                <div
                  key={item._id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();

                    console.log("[NotificationModal] clicked:", item._id);

                    onMarkAsRead(item._id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      console.log(
                        "[NotificationModal] keyboard clicked:",
                        item._id,
                      );
                      onMarkAsRead(item._id);
                    }
                  }}
                  className={[
                    "mb-2 flex w-full cursor-pointer gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 outline-none",
                    isRead
                      ? "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      : "border-[#008081]/15 bg-[#008081]/8 hover:bg-[#008081]/12 dark:border-[#008081]/25 dark:bg-[#008081]/10",
                  ].join(" ")}
                >
                  <div className="mt-1 shrink-0">
                    {isRead ? (
                      <CheckCircle2 className="h-5 w-5 text-[#008081]" />
                    ) : (
                      <span className="mt-1 block h-2.5 w-2.5 rounded-full bg-[#008081] shadow-sm" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                            {getNotificationLabel(item.type)}
                          </span>

                          {!isRead && (
                            <span className="rounded-full bg-[#008081]/10 px-2 py-0.5 text-[10px] font-semibold text-[#008081] dark:bg-[#008081]/20 dark:text-[#7dd3fc]">
                              New
                            </span>
                          )}
                        </div>

                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {item.title}
                        </p>
                      </div>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.message}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#008081]/10 text-[#008081] dark:bg-[#008081]/20">
                <span className="text-lg">🔔</span>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                No notifications yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                You will see updates here when something arrives.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
