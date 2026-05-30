"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Ban,
  Clock3,
  ShieldCheck,
  X,
  CalendarDays,
} from "lucide-react";
import type { UnavailableSlot, WorkingHour } from "@/types/doctor";

type SlotMode = "available" | "unavailable";

interface CreateScheduleProps {
  selectedDate: string;
  workingHours: WorkingHour[];
  unavailableSlots: UnavailableSlot[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const TIME_MIN = "08:00";
const TIME_MAX = "17:00";

function isTimeInRange(time: string, min: string, max: string) {
  return time >= min && time <= max;
}

function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) {
  return startA < endB && startB < endA;
}

function getFormattedDateFromDateString(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isFullDayBlocked(slot: UnavailableSlot) {
  return (
    slot.allDay === true ||
    (!slot.startTime && !slot.endTime) ||
    (slot.startTime === "00:00" && slot.endTime === "23:59")
  );
}

function formatTime12(time: string) {
  const [hourStr, minuteStr = "00"] = time.slice(0, 5).split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function padTimePart(value: number) {
  return String(value).padStart(2, "0");
}

function generateTimeOptions(
  start = "08:00",
  end = "17:00",
  stepMinutes = 30,
) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;

  const options: string[] = [];
  for (let total = startTotal; total <= endTotal; total += stepMinutes) {
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    options.push(`${padTimePart(hour)}:${padTimePart(minute)}`);
  }

  return options;
}

function TimeSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-3 block text-sm font-bold text-slate-900">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((time) => (
          <option key={time} value={time}>
            {formatTime12(time)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function CreateSchedule({
  selectedDate,
  workingHours,
  unavailableSlots,
  onClose,
  onSaved,
}: CreateScheduleProps) {
  const [slotDate, setSlotDate] = useState(selectedDate || "");
  const [slotMode, setSlotMode] = useState<SlotMode>("available");

  const [slotStartTime, setSlotStartTime] = useState("08:00");
  const [slotEndTime, setSlotEndTime] = useState("17:00");

  const [unavailableAllDay, setUnavailableAllDay] = useState(true);
  const [unavailableStartTime, setUnavailableStartTime] = useState("08:00");
  const [unavailableEndTime, setUnavailableEndTime] = useState("17:00");

  const [slotReason, setSlotReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const timeOptions = useMemo(
    () => generateTimeOptions(TIME_MIN, TIME_MAX, 30),
    [],
  );

  const selectedDateLabel = useMemo(
    () => getFormattedDateFromDateString(slotDate),
    [slotDate],
  );

  const selectedWorkingHours = useMemo(() => {
    return (workingHours ?? []).filter((hour) => hour.date === slotDate);
  }, [workingHours, slotDate]);

  const selectedUnavailableSlots = useMemo(() => {
    return (unavailableSlots ?? []).filter((slot) => slot.date === slotDate);
  }, [unavailableSlots, slotDate]);

  const hasFullDayUnavailableForDate = useMemo(() => {
    return selectedUnavailableSlots.some((slot) => isFullDayBlocked(slot));
  }, [selectedUnavailableSlots]);

  const hasAnyScheduleForDate = useMemo(() => {
    return selectedWorkingHours.length > 0 || selectedUnavailableSlots.length > 0;
  }, [selectedWorkingHours.length, selectedUnavailableSlots.length]);

  const selectedAvailableHasConflict = useMemo(() => {
    if (!slotDate) return false;

    const conflictsWithWorkingHours = selectedWorkingHours.some((hour) =>
      rangesOverlap(slotStartTime, slotEndTime, hour.startTime, hour.endTime),
    );

    const conflictsWithUnavailableSlots = selectedUnavailableSlots.some(
      (slot) => {
        if (isFullDayBlocked(slot)) return true;

        const start = slot.startTime || TIME_MIN;
        const end = slot.endTime || TIME_MAX;
        return rangesOverlap(slotStartTime, slotEndTime, start, end);
      },
    );

    return conflictsWithWorkingHours || conflictsWithUnavailableSlots;
  }, [
    slotDate,
    slotStartTime,
    slotEndTime,
    selectedWorkingHours,
    selectedUnavailableSlots,
  ]);

  const selectedUnavailableHasConflict = useMemo(() => {
    if (!slotDate) return false;

    if (unavailableAllDay) {
      return hasAnyScheduleForDate;
    }

    const conflictsWithWorkingHours = selectedWorkingHours.some((hour) =>
      rangesOverlap(
        unavailableStartTime,
        unavailableEndTime,
        hour.startTime,
        hour.endTime,
      ),
    );

    const conflictsWithUnavailableSlots = selectedUnavailableSlots.some(
      (slot) => {
        if (isFullDayBlocked(slot)) return true;

        const start = slot.startTime || TIME_MIN;
        const end = slot.endTime || TIME_MAX;
        return rangesOverlap(
          unavailableStartTime,
          unavailableEndTime,
          start,
          end,
        );
      },
    );

    return conflictsWithWorkingHours || conflictsWithUnavailableSlots;
  }, [
    slotDate,
    unavailableAllDay,
    unavailableStartTime,
    unavailableEndTime,
    hasAnyScheduleForDate,
    selectedWorkingHours,
    selectedUnavailableSlots,
  ]);

  useEffect(() => {
    setSlotDate(selectedDate || "");
  }, [selectedDate]);

  useEffect(() => {
    if (slotMode === "available") {
      setSlotStartTime("08:00");
      setSlotEndTime("17:00");
    }
  }, [slotMode]);

  useEffect(() => {
    if (slotMode !== "unavailable") return;

    if (unavailableAllDay) {
      setUnavailableStartTime("00:00");
      setUnavailableEndTime("23:59");
    } else {
      setUnavailableStartTime("08:00");
      setUnavailableEndTime("17:00");
    }
  }, [slotMode, unavailableAllDay]);

  useEffect(() => {
    if (hasFullDayUnavailableForDate && slotMode === "available") {
      setMessage(
        "This date is already blocked for the whole day, so working hours cannot be added here.",
      );
    }
  }, [hasFullDayUnavailableForDate, slotMode]);

  const canSubmit = useMemo(() => {
    if (!slotDate) return false;

    if (slotMode === "available") {
      return (
        slotStartTime < slotEndTime &&
        isTimeInRange(slotStartTime, TIME_MIN, TIME_MAX) &&
        isTimeInRange(slotEndTime, TIME_MIN, TIME_MAX) &&
        !selectedAvailableHasConflict
      );
    }

    if (unavailableAllDay) {
      return !hasAnyScheduleForDate;
    }

    return (
      unavailableStartTime < unavailableEndTime &&
      isTimeInRange(unavailableStartTime, TIME_MIN, TIME_MAX) &&
      isTimeInRange(unavailableEndTime, TIME_MIN, TIME_MAX) &&
      !selectedUnavailableHasConflict
    );
  }, [
    slotDate,
    slotMode,
    slotStartTime,
    slotEndTime,
    unavailableAllDay,
    unavailableStartTime,
    unavailableEndTime,
    selectedAvailableHasConflict,
    selectedUnavailableHasConflict,
    hasAnyScheduleForDate,
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!slotDate) {
      setMessage("Please choose a date.");
      return;
    }

    if (slotMode === "available") {
      if (slotStartTime >= slotEndTime) {
        setMessage("End time must be later than start time.");
        return;
      }

      if (!isTimeInRange(slotStartTime, TIME_MIN, TIME_MAX)) {
        setMessage("Start time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (!isTimeInRange(slotEndTime, TIME_MIN, TIME_MAX)) {
        setMessage("End time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (selectedAvailableHasConflict) {
        setMessage(
          "That working-hours range overlaps with an existing blocked time or working hours.",
        );
        return;
      }
    } else if (unavailableAllDay) {
      if (hasAnyScheduleForDate) {
        setMessage(
          "Full-day blocking is not allowed because this date already has a schedule item.",
        );
        return;
      }
    } else {
      if (unavailableStartTime >= unavailableEndTime) {
        setMessage("End time must be later than start time.");
        return;
      }

      if (!isTimeInRange(unavailableStartTime, TIME_MIN, TIME_MAX)) {
        setMessage("Start time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (!isTimeInRange(unavailableEndTime, TIME_MIN, TIME_MAX)) {
        setMessage("End time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (selectedUnavailableHasConflict) {
        setMessage(
          "That blocked time overlaps with an existing working-hours range or blocked time.",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const res =
        slotMode === "available"
          ? await fetch("/api/doctor/working-hours", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                date: slotDate,
                startTime: slotStartTime,
                endTime: slotEndTime,
              }),
            })
          : await fetch("/api/doctor/unavailable", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                date: slotDate,
                allDay: unavailableAllDay,
                startTime: unavailableAllDay ? undefined : unavailableStartTime,
                endTime: unavailableAllDay ? undefined : unavailableEndTime,
                reason: slotReason.trim() || "Unavailable",
              }),
            });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save schedule");
      }

      await onSaved();

      setMessage(
        slotMode === "available"
          ? "Working hours saved successfully."
          : unavailableAllDay
            ? "Unavailable day saved successfully."
            : "Unavailable time saved successfully.",
      );

      if (slotMode === "unavailable") {
        setSlotReason("");
      }
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
      >
        <style>{`
          .blob-shape {
            border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
          }
        `}</style>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        <div className="absolute inset-0 overflow-hidden">
          <div className="blob-shape absolute left-[-10%] top-[-10%] h-[400px] w-[400px] bg-[#81B641]/10 blur-3xl" />
          <div className="blob-shape absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] bg-[#008081]/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-h-[90vh] overflow-y-auto">
          <div className="p-6 pb-32 sm:p-8 lg:p-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#008081]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#008081]">
                <ShieldCheck className="h-4 w-4" />
                CREATE AVAILABILITY SLOT
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">
                Create New Slot
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                Choose a date, then mark it as available with a time window or
                mark it as unavailable for the whole day or a specific time.
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <label className="mb-4 block text-sm font-bold text-slate-900">
                  Select Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-4 text-sm font-semibold outline-none"
                    required
                  />
                </div>

                {slotDate ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Selected date:{" "}
                    <span className="font-semibold text-slate-700">
                      {selectedDateLabel}
                    </span>
                  </p>
                ) : null}

                {hasFullDayUnavailableForDate ? (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This date already has a full-day block. Nothing else can be
                    added here.
                  </div>
                ) : null}

                {hasAnyScheduleForDate && !hasFullDayUnavailableForDate ? (
                  <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    This date already has schedule items. Non-overlapping time
                    ranges are still allowed.
                  </div>
                ) : null}
              </section>

              <section>
                <label className="mb-4 block text-sm font-bold text-slate-900">
                  Slot Type
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasFullDayUnavailableForDate) {
                        setSlotMode("available");
                      }
                    }}
                    disabled={hasFullDayUnavailableForDate}
                    className={`group rounded-[28px] border p-5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      slotMode === "available"
                        ? "border-[#008081] bg-[#008081]/5 shadow-lg"
                        : "border-slate-200 bg-white hover:border-[#008081]/40 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                            slotMode === "available"
                              ? "bg-[#008081] text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-[#008081]/10 group-hover:text-[#008081]"
                          }`}
                        >
                          <Clock3 className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">
                            Available
                          </h3>
                          <p className="text-sm text-slate-500">
                            Set a working-hours time window
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          slotMode === "available"
                            ? "border-[#008081] bg-[#008081]"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlotMode("unavailable")}
                    className={`group rounded-[28px] border p-5 text-left transition-all ${
                      slotMode === "unavailable"
                        ? "border-[#81B641] bg-[#81B641]/5 shadow-lg"
                        : "border-slate-200 bg-white hover:border-[#81B641]/40 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${
                            slotMode === "unavailable"
                              ? "bg-[#81B641] text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-[#81B641]/10 group-hover:text-[#81B641]"
                          }`}
                        >
                          <Ban className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-slate-900">
                            Unavailable
                          </h3>
                          <p className="text-sm text-slate-500">
                            Block the whole day or a time window
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border-2 ${
                          slotMode === "unavailable"
                            ? "border-[#81B641] bg-[#81B641]"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </section>

              {slotMode === "available" ? (
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#008081]/10 text-[#008081]">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Time Window
                      </h3>
                      <p className="text-sm text-slate-500">
                        Earliest 08:00 AM, latest 05:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <TimeSelect
                      label="Start Time"
                      value={slotStartTime}
                      onChange={setSlotStartTime}
                      options={timeOptions}
                    />

                    <TimeSelect
                      label="End Time"
                      value={slotEndTime}
                      onChange={setSlotEndTime}
                      options={timeOptions}
                    />
                  </div>
                </section>
              ) : (
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#81B641]/10 text-[#81B641]">
                      <Ban className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Unavailable Type
                      </h3>
                      <p className="text-sm text-slate-500">
                        Choose between blocking the entire day or a specific
                        time window.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setUnavailableAllDay(true)}
                      disabled={hasAnyScheduleForDate}
                      className={`rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        unavailableAllDay
                          ? "border-[#81B641] bg-[#81B641]/5"
                          : "border-slate-200 bg-slate-50 hover:bg-white"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">
                        Block all day
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        No time needed. This blocks the full date.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUnavailableAllDay(false)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        !unavailableAllDay
                          ? "border-[#81B641] bg-[#81B641]/5"
                          : "border-slate-200 bg-slate-50 hover:bg-white"
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900">
                        Block specific time
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Default is 08:00 AM to 05:00 PM.
                      </div>
                    </button>
                  </div>

                  {!unavailableAllDay ? (
                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <TimeSelect
                        label="Start Time"
                        value={unavailableStartTime}
                        onChange={setUnavailableStartTime}
                        options={timeOptions}
                      />

                      <TimeSelect
                        label="End Time"
                        value={unavailableEndTime}
                        onChange={setUnavailableEndTime}
                        options={timeOptions}
                      />
                    </div>
                  ) : null}
                </section>
              )}

              {slotMode === "unavailable" ? (
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="mb-4 block text-sm font-bold text-slate-900">
                    Reason
                  </label>

                  <textarea
                    value={slotReason}
                    onChange={(e) => setSlotReason(e.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                    placeholder="Example: Clinic closed, emergency, lunch break, rest day"
                  />
                </section>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}

              <div className="mt-10 bg-transparent sm:px-8">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !canSubmit}
                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#008081] px-6 text-sm font-bold text-white shadow-lg shadow-[#008081]/20 transition-all hover:bg-[#006d6e] hover:shadow-xl hover:shadow-[#008081]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Slot"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}