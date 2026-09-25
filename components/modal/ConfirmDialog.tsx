"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100010] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            danger
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          <AlertTriangle size={22} />
        </span>

        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:opacity-90"
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
