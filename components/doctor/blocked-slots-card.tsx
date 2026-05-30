"use client";

import { Ban, CalendarDays, Clock3 } from "lucide-react";
import type { UnavailableSlot } from "@/types/doctor";

type BlockedSlotsCardProps = {
  selectedDate: string;
  slots: UnavailableSlot[];
};

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBlockTime(slot: UnavailableSlot) {
  if (slot.allDay || slot.startTime === "00:00" || slot.endTime === "23:59") {
    return "All day blocked";
  }

  return `${slot.startTime} - ${slot.endTime}`;
}

export default function BlockedSlotsCard({
  selectedDate,
  slots,
}: BlockedSlotsCardProps) {
  const selectedDateLabel = selectedDate ? formatDateLabel(selectedDate) : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Ban size={16} className="text-secondary" />
        <h4 className="font-semibold text-slate-800">Blocked Slots</h4>
      </div>

      <div className="mb-4 rounded-xl bg-slate-50 px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <CalendarDays size={14} className="text-slate-500" />
          <span>{selectedDateLabel}</span>
        </div>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-slate-500">
          No blocked slots on {selectedDateLabel}.
        </p>
      ) : (
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div
              key={`${slot.date}-${slot.startTime}-${slot.endTime}-${index}`}
              className="rounded-2xl border border-red-100 bg-red-50/60 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatShortDate(slot.date)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                    <Clock3 size={14} />
                    {formatBlockTime(slot)}
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">
                  Blocked
                </span>
              </div>

              {slot.reason ? (
                <p className="text-xs leading-relaxed text-slate-500">
                  {slot.reason}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}