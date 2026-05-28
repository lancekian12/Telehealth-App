"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, Ban, Clock3, ShieldCheck, X, CalendarDays } from "lucide-react";

type SlotMode = "available" | "unavailable";

interface CreateScheduleProps {
  selectedDate: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

function isWeekday(day: string) {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day);
}

function isTimeInRange(time: string, min: string, max: string) {
  return time >= min && time <= max;
}

export default function CreateSchedule({
  selectedDate,
  onClose,
  onSaved,
}: CreateScheduleProps) {
  const [slotDate, setSlotDate] = useState(selectedDate || "");
  const [slotMode, setSlotMode] = useState<SlotMode>("available");
  const [slotStartTime, setSlotStartTime] = useState("08:00");
  const [slotEndTime, setSlotEndTime] = useState("17:00");
  const [slotReason, setSlotReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const selectedDateLabel = useMemo(
    () => getFormattedDateFromDateString(slotDate),
    [slotDate],
  );

  const canSubmit = useMemo(() => {
    if (!slotDate) return false;

    const validTime =
      isTimeInRange(slotStartTime, "08:00", "17:00") &&
      isTimeInRange(slotEndTime, "08:00", "17:00") &&
      slotStartTime < slotEndTime;

    return validTime;
  }, [slotDate, slotStartTime, slotEndTime]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlotDate(selectedDate || "");
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!slotDate) {
      setMessage("Please choose a date.");
      return;
    }

    if (slotMode === "available") {
      if (!isTimeInRange(slotStartTime, "08:00", "17:00")) {
        setMessage("Start time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (!isTimeInRange(slotEndTime, "08:00", "17:00")) {
        setMessage("End time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (slotStartTime >= slotEndTime) {
        setMessage("End time must be later than start time.");
        return;
      }
    } else {
      if (!isTimeInRange(slotStartTime, "08:00", "17:00")) {
        setMessage("Start time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (!isTimeInRange(slotEndTime, "08:00", "17:00")) {
        setMessage("End time must be between 08:00 AM and 05:00 PM.");
        return;
      }

      if (slotStartTime >= slotEndTime) {
        setMessage("End time must be later than start time.");
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
                startTime: slotStartTime,
                endTime: slotEndTime,
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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl"
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
          <div className="blob-shape absolute top-[-10%] left-[-10%] h-[400px] w-[400px] bg-[#81B641]/10 blur-3xl" />
          <div className="blob-shape absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] bg-[#008081]/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-h-[90vh] overflow-y-auto">
          <div className="p-6 sm:p-8 lg:p-10 pb-32">
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
                mark it as unavailable for part of the day.
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
              </section>

              <section>
                <label className="mb-4 block text-sm font-bold text-slate-900">
                  Slot Type
                </label>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSlotMode("available")}
                    className={`group rounded-[28px] border p-5 text-left transition-all ${
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
                            Block part of the day
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
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      Start Time
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        type="time"
                        min="08:00"
                        max="17:00"
                        step="1800"
                        value={slotStartTime}
                        onChange={(e) => setSlotStartTime(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm font-semibold outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      End Time
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        type="time"
                        min="08:00"
                        max="17:00"
                        step="1800"
                        value={slotEndTime}
                        onChange={(e) => setSlotEndTime(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-4 text-sm font-semibold outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {slotMode === "unavailable" ? (
                <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="mb-4 block text-sm font-bold text-slate-900">
                    Reason
                  </label>

                  <textarea
                    value={slotReason}
                    onChange={(e) => setSlotReason(e.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                    placeholder="Example: Half-day rest, emergency, clinic closed"
                  />
                </section>
              ) : null}

              {message ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}

              <div className="mt-10 bg-transparent  sm:px-8 ">
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
