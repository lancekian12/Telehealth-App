"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, FileText, X } from "lucide-react";

type AvailableSlot = {
  startTime: string;
  endTime: string;
};

type Props = {
  open: boolean;
  loading?: boolean;
  appointmentTitle: string;
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  defaultReason?: string;
  availableSlots?: AvailableSlot[];
  onClose: () => void;
  onConfirm: (data: {
    newAppointmentDate: string;
    newStartTime: string;
    newEndTime: string;
    rescheduleReason: string;
  }) => Promise<void> | void;
};

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const base = parseTimeToMinutes(time);
  if (base === null) return null;

  const total = (base + minutesToAdd) % 1440;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export default function RescheduleAppointmentModal({
  open,
  loading = false,
  appointmentTitle,
  defaultDate = "",
  defaultStartTime = "",
  defaultReason = "",
  availableSlots = [],
  onClose,
  onConfirm,
}: Props) {
  const [newAppointmentDate, setNewAppointmentDate] = useState(defaultDate);
  const [newStartTime, setNewStartTime] = useState(defaultStartTime);
  const [newEndTime, setNewEndTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState(defaultReason);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setNewAppointmentDate(defaultDate);
    setNewStartTime(defaultStartTime);
    setRescheduleReason(defaultReason);
    setError("");
  }, [open, defaultDate, defaultStartTime, defaultReason]);

  useEffect(() => {
    if (!newStartTime) {
      setNewEndTime("");
      return;
    }

    const computedEnd = addMinutesToTime(newStartTime, 60);
    setNewEndTime(computedEnd || "");
  }, [newStartTime]);

  const slotLabels = useMemo(() => {
    return availableSlots.map((slot) => ({
      ...slot,
      label: `${slot.startTime} - ${slot.endTime}`,
    }));
  }, [availableSlots]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAppointmentDate || !newStartTime || !newEndTime) {
      setError("Please choose a valid schedule slot.");
      return;
    }

    if (!rescheduleReason.trim()) {
      setError("Please enter a reason for the reschedule.");
      return;
    }

    const expectedEndTime = addMinutesToTime(newStartTime, 60);
    if (expectedEndTime !== newEndTime) {
      setError("Only 60-minute slots are allowed.");
      return;
    }

    const selectedSlot = availableSlots.find(
      (slot) => slot.startTime === newStartTime && slot.endTime === newEndTime,
    );

    if (!selectedSlot) {
      setError("That slot is not available in the doctor’s schedule.");
      return;
    }

    setError("");
    await onConfirm({
      newAppointmentDate,
      newStartTime,
      newEndTime,
      rescheduleReason: rescheduleReason.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reschedule appointment
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pick only one available 60-minute slot for {appointmentTitle}. The
              request goes back to pending for doctor review.
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
              New appointment date
            </label>
            <div className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="date"
                value={newAppointmentDate}
                onChange={(e) => setNewAppointmentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-primary dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Available 60-minute slots
              </label>
              <span className="text-xs text-slate-400">
                Only doctor-approved slots are shown
              </span>
            </div>

            {slotLabels.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950">
                No available slots for this date.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {slotLabels.map((slot) => {
                  const active = newStartTime === slot.startTime;

                  return (
                    <button
                      key={`${slot.startTime}-${slot.endTime}`}
                      type="button"
                      onClick={() => setNewStartTime(slot.startTime)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <Clock3 size={16} />
                        {slot.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason for rescheduling
            </label>
            <div className="relative">
              <FileText
                size={16}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={4}
                placeholder="Example: I have a work conflict, still feeling unwell, or I need a different schedule."
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
              disabled={loading || slotLabels.length === 0}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending request..." : "Submit reschedule request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
