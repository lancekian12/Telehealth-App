"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

type CancelAppointmentModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  appointmentTitle?: string;
};

export default function CancelAppointmentModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  appointmentTitle = "this appointment",
}: CancelAppointmentModalProps) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">
              <AlertTriangle size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Cancel appointment
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                This will cancel {appointmentTitle}.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close cancel modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            Please add a reason so the doctor knows why you are cancelling.
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Cancellation reason
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Example: I am not feeling well / I have an emergency / I need to reschedule later"
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              disabled={loading}
            >
              Keep appointment
            </button>

            <button
              onClick={handleConfirm}
              disabled={loading || reason.trim().length === 0}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cancelling..." : "Yes, cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}