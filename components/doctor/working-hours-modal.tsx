"use client";

import { X, Clock3 } from "lucide-react";
import { WorkingHour } from "@/types/doctor";

type WorkingHourView = WorkingHour & {
  date?: string;
  day?: string;
  isAvailable?: boolean;
};

type WorkingHoursModalProps = {
  open: boolean;
  onClose: () => void;
  workingHours: WorkingHour[];
};

function formatShortDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

export default function WorkingHoursModal({
  open,
  onClose,
  workingHours,
}: WorkingHoursModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-wide text-primary">
              <Clock3 className="h-4 w-4" />
              ALL WORKING HOURS
            </div>

            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
              Working Hours List
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              All working hours you created.
            </p>
          </div>

          <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            {workingHours.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                No working hours found.
              </div>
            ) : (
              workingHours.map((item, index) => {
                const workingHour = item as WorkingHourView;
                const dateLabel = workingHour.date
                  ? formatShortDate(workingHour.date)
                  : workingHour.day || "Working hour";

                return (
                  <div
                    key={`${workingHour.date || workingHour.day || "working"}-${index}`}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {dateLabel}
                      </p>
                      <p className="text-sm text-slate-600">
                        {workingHour.startTime && workingHour.endTime
                          ? formatTimeRange(
                              workingHour.startTime,
                              workingHour.endTime,
                            )
                          : "No time set"}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                        workingHour.isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {workingHour.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}