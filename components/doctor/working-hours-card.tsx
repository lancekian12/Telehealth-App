"use client";

import { Clock3 } from "lucide-react";
import { WorkingHour } from "@/types/doctor";

type WorkingHourView = WorkingHour & {
  date?: string;
  day?: string;
  isAvailable?: boolean;
};

type WorkingHoursCardProps = {
  workingHours: WorkingHour[];
  onViewAll?: () => void;
  limit?: number;
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

export default function WorkingHoursCard({
  workingHours,
  onViewAll,
  limit = 5,
}: WorkingHoursCardProps) {
  const previewItems = workingHours.slice(0, limit);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-primary" />
          <h4 className="font-semibold text-slate-800">Working Hours</h4>
        </div>

        {workingHours.length > limit && onViewAll ? (
          <button
            onClick={onViewAll}
            className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            View all
          </button>
        ) : null}
      </div>

      {workingHours.length === 0 ? (
        <p className="text-sm text-slate-500">No working hours found.</p>
      ) : (
        <div className="space-y-2">
          {previewItems.map((item, index) => {
            const workingHour = item as WorkingHourView;
            const dateLabel = workingHour.date
              ? formatShortDate(workingHour.date)
              : workingHour.day || "Working hour";

            return (
              <div
                key={`${workingHour.date || workingHour.day || "working"}-${index}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{dateLabel}</p>
                  <p className="text-slate-500">
                    {workingHour.startTime && workingHour.endTime
                      ? formatTimeRange(
                          workingHour.startTime,
                          workingHour.endTime,
                        )
                      : "No time set"}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    workingHour.isAvailable
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {workingHour.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}