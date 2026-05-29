"use client";

import React from "react";
import {
  CircleDashed,
  Clock3,
  CircleX,
  CircleCheckBig,
  X,
} from "lucide-react";

export type FilterStatus =
  | "all"
  | "pending"
  | "accepted"
  | "rejected"
  | "completed";

type AppointmentFilterModalProps = {
  open: boolean;
  onClose: () => void;
  activeFilter: FilterStatus;
  setActiveFilter: (value: FilterStatus) => void;
  counts: {
    all: number;
    pending: number;
    accepted: number;
    rejected: number;
    completed: number;
  };
};

function filterIcon(status: FilterStatus) {
  switch (status) {
    case "pending":
      return <CircleDashed size={14} />;
    case "accepted":
      return <Clock3 size={14} />;
    case "rejected":
      return <CircleX size={14} />;
    case "completed":
      return <CircleCheckBig size={14} />;
    default:
      return <CircleDashed size={14} />;
  }
}

export default function AppointmentFilterModal({
  open,
  onClose,
  activeFilter,
  setActiveFilter,
  counts,
}: AppointmentFilterModalProps) {
  if (!open) return null;

  const filters: Array<{ key: FilterStatus; label: string; count: number }> = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "accepted", label: "Accepted", count: counts.accepted },
    { key: "rejected", label: "Rejected", count: counts.rejected },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Filter appointments
            </h2>
            <p className="text-sm text-slate-500">Choose one status to view</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close filter modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <button
                key={filter.key}
                onClick={() => {
                  setActiveFilter(filter.key);
                  onClose();
                }}
                className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-primary/40"
                }`}
              >
                <span className="flex items-center gap-3 font-medium">
                  {filter.key === "all" ? (
                    <CircleDashed size={15} />
                  ) : (
                    filterIcon(filter.key)
                  )}
                  {filter.label}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
