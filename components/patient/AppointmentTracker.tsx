"use client";

import { CalendarCheck, CheckCircle2, Hourglass, PlayCircle, Pill } from "lucide-react";

export type TrackerStage = "pending" | "accepted" | "in_progress" | "completed" | "prescription";

const STAGES: { key: TrackerStage; label: string; icon: React.ReactNode }[] = [
  { key: "pending", label: "Pending", icon: <Hourglass size={14} /> },
  { key: "accepted", label: "Accepted", icon: <CalendarCheck size={14} /> },
  { key: "in_progress", label: "Ongoing", icon: <PlayCircle size={14} /> },
  { key: "completed", label: "Completed", icon: <CheckCircle2 size={14} /> },
  { key: "prescription", label: "Prescription", icon: <Pill size={14} /> },
];

export default function AppointmentTracker({
  stage,
}: {
  stage: TrackerStage;
}) {
  const currentIndex = STAGES.findIndex((s) => s.key === stage);

  return (
    <div className="flex items-center">
      {STAGES.map((s, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFilled = isDone || isCurrent;

        return (
          <div
            key={s.key}
            className={`flex items-center ${index === STAGES.length - 1 ? "" : "flex-1"}`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isFilled
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-800",
                  isCurrent ? "ring-4 ring-primary/15" : "",
                ].join(" ")}
              >
                {s.icon}
              </span>
              <span
                className={[
                  "whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide",
                  isFilled ? "text-primary" : "text-slate-400",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>

            {index !== STAGES.length - 1 && (
              <div
                className={[
                  "mx-1.5 mb-4 h-0.5 flex-1 rounded-full transition-colors",
                  isDone ? "bg-primary" : "bg-slate-200 dark:bg-slate-700",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
