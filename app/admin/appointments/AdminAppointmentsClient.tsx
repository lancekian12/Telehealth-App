"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  Clock,
  Loader2,
  MapPin,
  MoreHorizontal,
  Search,
  Stethoscope,
  Video,
} from "lucide-react";
import type {
  AppointmentBoardCard,
  AppointmentColumnKey,
} from "@/types/admin";

type LoadState = "idle" | "loading" | "success" | "error";

const COLUMN_CONFIG: {
  key: AppointmentColumnKey;
  label: string;
  dotClass: string;
  borderClass: string;
}[] = [
  { key: "pending", label: "Pending", dotClass: "bg-orange-400", borderClass: "border-l-slate-200" },
  { key: "confirmed", label: "Confirmed", dotClass: "bg-blue-400", borderClass: "border-l-primary" },
  { key: "in_progress", label: "In-Progress", dotClass: "bg-secondary", borderClass: "border-l-secondary" },
  { key: "completed", label: "Completed", dotClass: "bg-slate-400", borderClass: "border-l-slate-300" },
  { key: "cancelled", label: "Cancelled / Unattended", dotClass: "bg-rose-500", borderClass: "border-l-rose-400" },
];

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function formatTime12(time: string) {
  const [hourStr, minuteStr = "00"] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

function formatDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = getLocalDateString(new Date());
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  if (dateStr === yesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function AppointmentCard({ card }: { card: AppointmentBoardCard }) {
  const isLive = card.column === "in_progress";
  const isCancelled = card.column === "cancelled";

  return (
    <div
      className={`rounded-xl border border-slate-200/70 border-l-[4px] p-5 shadow-sm transition-shadow hover:shadow-md ${
        COLUMN_CONFIG.find((c) => c.key === card.column)?.borderClass
      } ${isLive ? "bg-secondary/10" : "bg-white"} ${isCancelled ? "opacity-75" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Live
          </span>
        ) : (
          <span
            className={`max-w-[60%] truncate rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              card.column === "confirmed"
                ? "border border-primary/25 bg-primary/5 text-primary"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {card.doctorSpecialization || card.status}
          </span>
        )}
        <span className="shrink-0 text-xs font-medium text-slate-400">
          #AP-{card.shortId}
        </span>
      </div>

      <p className="truncate text-base font-bold text-slate-900">
        {card.patientName}
      </p>

      <div className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
        <Stethoscope size={14} className="shrink-0" />
        <span className="truncate">{card.doctorName}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-primary">
        {card.consultationType === "video" ? (
          <Video size={14} />
        ) : (
          <MapPin size={14} className="text-secondary" />
        )}
        <span className={card.consultationType === "video" ? "" : "text-secondary"}>
          {card.consultationType === "video" ? "Online" : "Clinic"}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span
          className={`flex items-center gap-2 text-sm font-bold ${
            isLive ? "text-secondary" : "text-slate-800"
          }`}
        >
          <Clock size={15} className={isLive ? "text-secondary" : "text-slate-500"} />
          {isLive
            ? `Started: ${formatTime12(card.startTime)}`
            : formatTime12(card.startTime)}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
          {initials(card.patientName)}
        </span>
      </div>
    </div>
  );
}

export default function AdminAppointmentsClient() {
  const [date, setDate] = useState(() => getLocalDateString(new Date()));
  const [search, setSearch] = useState("");
  const [state, setState] = useState<LoadState>("idle");
  const [columns, setColumns] = useState<
    Record<AppointmentColumnKey, AppointmentBoardCard[]> | null
  >(null);

  const load = useCallback(async (selectedDate: string, searchTerm: string) => {
    setState("loading");
    try {
      const params = new URLSearchParams({ date: selectedDate, search: searchTerm });
      const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setColumns(data.columns);
      setState("success");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load(date, search);
  }, [date, search, load]);

  const totalCount = columns
    ? Object.values(columns).reduce((sum, list) => sum + list.length, 0)
    : 0;

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white pb-16">
      <div className="pointer-events-none fixed left-0 top-16 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarClock size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
              <p className="mt-1 text-sm text-slate-500">
                {totalCount} appointment{totalCount === 1 ? "" : "s"} on{" "}
                {formatDateLabel(date)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient or doctor..."
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5">
              <button
                onClick={() => setDate((d) => addDays(d, -1))}
                className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ‹
              </button>
              <span className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-700">
                <Calendar size={14} className="text-primary" />
                {formatDateLabel(date)}
              </span>
              <button
                onClick={() => setDate((d) => addDays(d, 1))}
                className="rounded-full px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ›
              </button>
            </div>

            {date !== getLocalDateString(new Date()) && (
              <button
                onClick={() => setDate(getLocalDateString(new Date()))}
                className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20"
              >
                Jump to today
              </button>
            )}
          </div>
        </div>

        <div className="mt-6">
          {state === "error" ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} />
              Couldn&apos;t load appointments.
              <button
                onClick={() => load(date, search)}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : state === "loading" || !columns ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex gap-7 overflow-x-auto pb-4">
              {COLUMN_CONFIG.map((col) => {
                const cards = columns[col.key];
                return (
                  <div
                    key={col.key}
                    className="flex max-h-[68vh] w-[340px] shrink-0 flex-col rounded-3xl border border-slate-200/60 bg-slate-50/70 shadow-sm"
                  >
                    <div className="flex shrink-0 items-center justify-between px-6 pb-3 pt-6">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${col.dotClass}`} />
                        <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-800">
                          {col.label}
                        </h2>
                        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-200/70 px-2 text-sm font-bold text-slate-600">
                          {cards.length}
                        </span>
                      </div>
                      <MoreHorizontal size={18} className="text-slate-400" />
                    </div>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-2">
                      {cards.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                          No appointments
                        </p>
                      ) : (
                        cards.map((card) => (
                          <AppointmentCard key={card.id} card={card} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
