"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, Clock3, Send, X } from "lucide-react";
import {
  getAppointmentWindow,
  getUnattendedInfo,
} from "@/config/appointmentStatus";

type Props = {
  appointment: {
    appointmentDate: string;
    startTime?: string;
    endTime?: string;
    createdAt?: string;
    acceptedAt?: string | null;
    unattendedAt?: string | null;
    unattendedFrom?: string | null;
    unattendedReason?: string;
  };
  role: "patient" | "doctor";
};

function fmt(value?: string | Date | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function UnattendedJourney({ appointment, role }: Props) {
  const [open, setOpen] = useState(false);
  const { from, reason } = getUnattendedInfo(appointment);
  const timeWindow = getAppointmentWindow(appointment);
  const wasAccepted = from === "accepted";

  const steps: {
    title: string;
    detail: string;
    icon: React.ReactNode;
    tone: "done" | "missed" | "final";
  }[] = [
    {
      title:
        role === "patient"
          ? "You requested this appointment"
          : "Patient requested this appointment",
      detail: fmt(appointment.createdAt),
      icon: <Send size={13} />,
      tone: "done",
    },
    wasAccepted
      ? {
          title: role === "patient" ? "Doctor accepted" : "You accepted",
          detail: fmt(appointment.acceptedAt),
          icon: <Check size={13} />,
          tone: "done",
        }
      : {
          title:
            role === "patient"
              ? "Doctor never responded"
              : "No response from you",
          detail: "The request stayed pending",
          icon: <Clock3 size={13} />,
          tone: "missed",
        },
    {
      title: wasAccepted
        ? "Consultation did not happen"
        : "Scheduled time passed",
      detail: timeWindow ? `Ended ${fmt(timeWindow.end)}` : "",
      icon: <Clock3 size={13} />,
      tone: "missed",
    },
    {
      title: "Marked as unattended",
      detail: fmt(appointment.unattendedAt),
      icon: <AlertTriangle size={13} />,
      tone: "final",
    },
  ];

  const toneClass = {
    done: "border-primary bg-primary text-white",
    missed:
      "border-orange-300 bg-orange-100 text-orange-600 dark:bg-orange-900/30",
    final: "border-orange-500 bg-orange-500 text-white",
  } as const;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300"
      >
        <AlertTriangle size={13} />
        Why unattended?
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-label="Unattended appointment details"
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <AlertTriangle size={16} className="text-orange-500" />
                  Unattended
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="mb-4 rounded-xl bg-orange-50 p-3 text-sm leading-6 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                {reason}
              </p>

              <ol className="space-y-3">
                {steps.map((step, i) => (
                  <li key={step.title} className="relative flex gap-3">
                    {i < steps.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-[calc(100%-4px)] w-px bg-orange-200 dark:bg-orange-900/50" />
                    )}
                    <span
                      className={`z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${toneClass[step.tone]}`}
                    >
                      {step.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">
                        {step.title}
                      </p>
                      {step.detail && (
                        <p className="text-xs text-slate-500">{step.detail}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
