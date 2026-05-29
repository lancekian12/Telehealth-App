"use client";

import React, { useEffect, useState } from "react";
import { X, XCircle } from "lucide-react";

type Props = {
  open: boolean;
  loading?: boolean;
  appointmentTitle: string;
  defaultReason?: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
};

export default function RejectAppointmentModal({
  open,
  loading = false,
  appointmentTitle,
  defaultReason = "",
  onClose,
  onConfirm,
}: Props) {
  const [rejectionReason, setRejectionReason] = useState(defaultReason);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setRejectionReason(defaultReason);
    setError("");
  }, [open, defaultReason]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }

    setError("");
    await onConfirm(rejectionReason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reject appointment
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a reason for rejecting {appointmentTitle}. The appointment
              will switch to rejected.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Rejection reason
            </label>
            <div className="relative">
              <XCircle
                size={16}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Example: Schedule is full, doctor is unavailable, wrong slot, etc."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Rejecting..." : "Reject appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}