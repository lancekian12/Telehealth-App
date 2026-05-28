"use client";

import { Ban } from "lucide-react";
import { UnavailableSlot } from "@/types/doctor";

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

export default function BlockedSlotsCard({
  selectedDate,
  slots,
}: BlockedSlotsCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Ban size={16} className="text-secondary" />
        <h4 className="font-semibold text-slate-800">Blocked Slots</h4>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-slate-500">
          No blocked slots on {formatDateLabel(selectedDate)}.
        </p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot, index) => (
            <div
              key={`${slot.date}-${slot.startTime}-${slot.endTime}-${index}`}
              className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">
                    {formatShortDate(slot.date)}
                  </p>
                  <p className="text-slate-500">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Blocked
                </span>
              </div>

              {slot.reason ? (
                <p className="mt-2 text-xs text-slate-500">{slot.reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}