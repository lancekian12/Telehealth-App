"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notification";
import type { NotificationItem } from "@/components/navigation/notification-modal";

type FilterType = "all" | "unread" | "appointments" | "schedule";

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

function isAppointmentType(type?: NotificationItem["type"]) {
  return (
    type === "appointment_booked" ||
    type === "appointment_accepted" ||
    type === "appointment_rejected" ||
    type === "appointment_cancelled" ||
    type === "appointment_rescheduled" ||
    type === "appointment_upcoming"
  );
}

function getTypeStyles(type?: NotificationItem["type"]) {
  switch (type) {
    case "appointment_booked":
      return {
        label: "New booking",
        icon: Calendar,
        iconClass: "bg-[#008081]/10 text-[#008081] border-[#008081]/20",
        dotClass: "bg-[#008081]",
      };
    case "appointment_accepted":
      return {
        label: "Accepted",
        icon: CheckCircle,
        iconClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        dotClass: "bg-emerald-500",
      };
    case "appointment_rejected":
      return {
        label: "Rejected",
        icon: X,
        iconClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
        dotClass: "bg-rose-500",
      };
    case "appointment_cancelled":
      return {
        label: "Cancelled",
        icon: AlertTriangle,
        iconClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        dotClass: "bg-amber-500",
      };
    case "appointment_rescheduled":
      return {
        label: "Updated",
        icon: Clock3,
        iconClass: "bg-[#81B641]/10 text-[#5f8f2d] border-[#81B641]/20",
        dotClass: "bg-[#81B641]",
      };
    case "schedule_updated":
      return {
        label: "Schedule",
        icon: Clock3,
        iconClass: "bg-[#81B641]/10 text-[#5f8f2d] border-[#81B641]/20",
        dotClass: "bg-[#81B641]",
      };
    default:
      return {
        label: "Notification",
        icon: FileText,
        iconClass: "bg-slate-100 text-slate-600 border-slate-200",
        dotClass: "bg-slate-400",
      };
  }
}

export default function DoctorNotificationClient() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [doctorId, setDoctorId] = useState<string | null>(null);

  const {
    notifications,
    loading,
    markAllAsRead,
    markAsRead,
    refreshNotifications,
  } = useRealtimeNotifications({
    role: "doctor",
    userId: doctorId,
    enabled: !!doctorId,
  });

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await res.json();

        if (!active) return;

        if (data.success && data.recipientRole === "doctor") {
          setDoctorId(String(data.recipientId || ""));
          return;
        }

        setDoctorId(null);
      } catch {
        if (active) setDoctorId(null);
      }
    };

    loadContext();
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      appointments: notifications.filter((n) => isAppointmentType(n.type)).length,
      schedule: notifications.filter((n) => n.type === "schedule_updated").length,
    };
  }, [notifications]);

  const visible = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => {
      const aUnread = a.read ? 1 : 0;
      const bUnread = b.read ? 1 : 0;
      if (aUnread !== bUnread) return aUnread - bUnread;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (filter === "all") return sorted;
    if (filter === "unread") return sorted.filter((n) => !n.read);
    if (filter === "appointments") return sorted.filter((n) => isAppointmentType(n.type));
    if (filter === "schedule") return sorted.filter((n) => n.type === "schedule_updated");

    return sorted;
  }, [notifications, filter]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#008081]">
              eco
            </span>
            <span className="text-lg font-bold">
              Appoint<span className="text-[#81B641]">Care</span>
            </span>
          </div>
          <button className="text-slate-500" aria-label="Open menu" type="button">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white md:text-3xl">
                  Notifications
                </h1>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Stay updated with your patients and schedule.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={refreshNotifications}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[#008081] transition-colors hover:bg-[#008081]/5"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>

                <button
                  onClick={markAllAsRead}
                  type="button"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-[#008081] transition-colors hover:bg-[#008081]/5"
                >
                  Mark all as read
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Unread</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {counts.unread}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Appointments</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {counts.appointments}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">Schedule updates</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {counts.schedule}
                </p>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilter("all")}
                type="button"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-[#008081] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#008081]/25 hover:bg-[#008081]/5"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("unread")}
                type="button"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "border border-[#008081]/20 bg-white text-[#008081]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#008081]/25 hover:bg-[#008081]/5"
                }`}
              >
                Unread{" "}
                <span className="ml-1 rounded-full bg-[#008081]/10 px-1.5 py-0.5 text-xs text-[#008081]">
                  {counts.unread}
                </span>
              </button>

              <button
                onClick={() => setFilter("appointments")}
                type="button"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "appointments"
                    ? "border border-[#008081]/20 bg-white text-[#008081]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#008081]/25 hover:bg-[#008081]/5"
                }`}
              >
                Appointments
              </button>

              <button
                onClick={() => setFilter("schedule")}
                type="button"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "schedule"
                    ? "border border-[#008081]/20 bg-white text-[#008081]"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#008081]/25 hover:bg-[#008081]/5"
                }`}
              >
                Schedule
              </button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-2xl bg-white dark:bg-slate-800"
                    />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm dark:bg-slate-800">
                  No notifications.
                </div>
              ) : (
                visible.map((n) => {
                  const unread = !n.read;
                  const meta = getTypeStyles(n.type);
                  const Icon = meta.icon;

                  return (
                    <article
                      key={n._id}
                      onClick={() => {
                        if (!n.read) markAsRead(n._id);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!n.read) markAsRead(n._id);
                        }
                      }}
                      className={`relative flex cursor-pointer items-start gap-4 rounded-3xl border p-5 transition-all duration-200 ${
                        unread
                          ? "border-[#008081]/15 bg-[#008081]/[0.03] hover:bg-[#008081]/[0.05]"
                          : "border-slate-200 bg-white hover:border-[#008081]/15 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${meta.iconClass}`}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                                {meta.label}
                              </span>

                              {unread && (
                                <span className="rounded-full bg-[#008081]/10 px-2.5 py-1 text-[11px] font-semibold text-[#008081]">
                                  New
                                </span>
                              )}
                            </div>

                            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                              {n.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                              {n.message}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                            <Clock3 size={14} />
                            <span>{formatTimeAgo(n.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {n.read ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                              Already read
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#008081]/10 px-3 py-1.5 text-xs font-medium text-[#008081]">
                              Tap anywhere to mark as read
                            </span>
                          )}
                        </div>
                      </div>

                      
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}