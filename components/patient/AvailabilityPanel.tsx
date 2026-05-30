"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { FindDoctor } from "@/types/doctor";

type SelectedDateItem = {
  key: string;
  day: string;
  date: number;
  fullDate: string;
  active: boolean;
  muted: boolean;
};

type WorkingHour = {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
};

type ScheduleOverride = {
  date: string;
  action: "rescheduled" | "cancelled";
  startTime?: string | null;
  endTime?: string | null;
  newDate?: string | null;
  newStartTime?: string | null;
  newEndTime?: string | null;
  reason?: string;
};

type UnavailableSlot = {
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  reason?: string;
};

type DoctorDetailsResponse = {
  success: boolean;
  message?: string;
  doctor?: {
    id: string;
    clerkId?: string;
    fullName: string;
    workingHours?: WorkingHour[];
    scheduleOverrides?: ScheduleOverride[];
    unavailableSlots?: UnavailableSlot[];
    consultationDurationMinutes?: number;
  };
};

type AvailabilityPanelProps = {
  open: boolean;
  onClose: () => void;
  activeDoctor: FindDoctor | null;
  selectedDate: SelectedDateItem[];
  selectedDayIndex: number;
  setSelectedDayIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedTime: string;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
};

type TimeRange = {
  startTime: string;
  endTime: string;
};

type Slot = { startTime: string; endTime: string; label: string };

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
}

function formatMinutesToTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${meridiem}`;
}

function formatTimeLabel(time: string) {
  const minutes = parseTimeToMinutes(time);
  return minutes === null ? time : formatMinutesToTime(minutes);
}

function isFullDayBlocked(slot: UnavailableSlot) {
  return (
    slot.allDay === true ||
    (!slot.startTime && !slot.endTime) ||
    (slot.startTime === "00:00" && slot.endTime === "23:59")
  );
}

function overlaps(a: TimeRange, b: TimeRange) {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

function subtractRanges(base: TimeRange, blocks: TimeRange[]) {
  let segments: TimeRange[] = [base];

  const sortedBlocks = [...blocks].sort((x, y) =>
    x.startTime.localeCompare(y.startTime),
  );

  for (const block of sortedBlocks) {
    const nextSegments: TimeRange[] = [];

    for (const segment of segments) {
      if (!overlaps(segment, block)) {
        nextSegments.push(segment);
        continue;
      }

      if (segment.startTime < block.startTime) {
        nextSegments.push({
          startTime: segment.startTime,
          endTime: block.startTime,
        });
      }

      if (block.endTime < segment.endTime) {
        nextSegments.push({
          startTime: block.endTime,
          endTime: segment.endTime,
        });
      }
    }

    segments = nextSegments;
  }

  return segments.filter((segment) => segment.startTime < segment.endTime);
}

function dedupeSlots(slots: Slot[]) {
  return slots.filter(
    (slot, index, arr) =>
      arr.findIndex(
        (x) => x.startTime === slot.startTime && x.endTime === slot.endTime,
      ) === index,
  );
}

export default function AvailabilityPanel({
  open,
  onClose,
  activeDoctor,
  selectedDate,
  selectedDayIndex,
  setSelectedDayIndex,
  selectedTime,
  setSelectedTime,
}: AvailabilityPanelProps) {
  const router = useRouter();

  const doctorId = activeDoctor?.id ?? null;
  const doctorName = activeDoctor?.name ?? "Doctor Schedule";

  const [doctorSchedule, setDoctorSchedule] = useState<{
    fullName: string;
    workingHours: WorkingHour[];
    scheduleOverrides: ScheduleOverride[];
    unavailableSlots: UnavailableSlot[];
    consultationDurationMinutes: number;
  }>({
    fullName: doctorName,
    workingHours: [],
    scheduleOverrides: [],
    unavailableSlots: [],
    consultationDurationMinutes: 60,
  });

  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !doctorId) return;

    const controller = new AbortController();

    async function loadDoctorSchedule() {
      setLoadingSchedule(true);
      setScheduleError(null);

      try {
        const url = `/api/doctor/${doctorId}`;

        const res = await fetch(url, {
          method: "GET",
          signal: controller.signal,
        });

        const json: DoctorDetailsResponse = await res.json();

        if (!res.ok || !json.success || !json.doctor) {
          throw new Error(json.message || "Failed to load doctor schedule");
        }

        setDoctorSchedule({
          fullName: json.doctor.fullName || doctorName || "Doctor Schedule",
          workingHours: json.doctor.workingHours || [],
          scheduleOverrides: json.doctor.scheduleOverrides || [],
          unavailableSlots: json.doctor.unavailableSlots || [],
          consultationDurationMinutes:
            json.doctor.consultationDurationMinutes || 60,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        setScheduleError(
          error instanceof Error ? error.message : "Something went wrong",
        );
        setDoctorSchedule({
          fullName: doctorName || "Doctor Schedule",
          workingHours: [],
          scheduleOverrides: [],
          unavailableSlots: [],
          consultationDurationMinutes: 60,
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSchedule(false);
        }
      }
    }

    void loadDoctorSchedule();

    return () => controller.abort();
  }, [doctorId, doctorName, open]);

  const dayAvailability = useMemo(() => {
    return selectedDate.map((item) => {
      const unavailableForDay = doctorSchedule.unavailableSlots.filter(
        (slot) => slot.date === item.fullDate,
      );

      const blockedByFullDayUnavailable = unavailableForDay.some((slot) =>
        isFullDayBlocked(slot),
      );

      const cancelledOverride = doctorSchedule.scheduleOverrides.some(
        (override) =>
          override.date === item.fullDate && override.action === "cancelled",
      );

      const workingHoursForDay = doctorSchedule.workingHours.filter(
        (hour) => hour.date === item.fullDate && hour.isAvailable !== false,
      );

      const rescheduledSlots: Slot[] = doctorSchedule.scheduleOverrides
        .filter(
          (override) =>
            override.action === "rescheduled" &&
            override.newDate === item.fullDate &&
            override.newStartTime &&
            override.newEndTime,
        )
        .map((override) => ({
          startTime: override.newStartTime as string,
          endTime: override.newEndTime as string,
          label: `${formatTimeLabel(override.newStartTime as string)} - ${formatTimeLabel(override.newEndTime as string)}`,
        }));

      const blockedRanges = unavailableForDay
        .filter(
          (slot) => !isFullDayBlocked(slot) && slot.startTime && slot.endTime,
        )
        .map((slot) => ({
          startTime: slot.startTime as string,
          endTime: slot.endTime as string,
        }));

      const baseSlots: Slot[] = workingHoursForDay.flatMap((slot) => {
        const remaining = subtractRanges(
          {
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
          blockedRanges,
        );

        return remaining.map((range) => ({
          startTime: range.startTime,
          endTime: range.endTime,
          label: `${formatTimeLabel(range.startTime)} - ${formatTimeLabel(range.endTime)}`,
        }));
      });

      const slots =
        blockedByFullDayUnavailable || cancelledOverride
          ? []
          : [...baseSlots, ...rescheduledSlots];

      const uniqueSlots = dedupeSlots(slots);

      return {
        ...item,
        disabled:
          uniqueSlots.length === 0 ||
          blockedByFullDayUnavailable ||
          cancelledOverride,
        slots: uniqueSlots,
        blockedByFullDayUnavailable,
        cancelledOverride,
      };
    });
  }, [selectedDate, doctorSchedule]);

  const selectedDayInfo = dayAvailability[selectedDayIndex];
  const availableSlots = selectedDayInfo?.slots ?? [];
  const isBlockedDay = Boolean(
    selectedDayInfo?.blockedByFullDayUnavailable ||
      selectedDayInfo?.cancelledOverride,
  );
  const isDisabledDay = Boolean(selectedDayInfo?.disabled);

  if (!open) return null;

  const handleConfirm = () => {
    if (!doctorId) return;
    if (isBlockedDay || isDisabledDay || !selectedTime) return;

    const selected = selectedDate[selectedDayIndex];
    const params = new URLSearchParams({
      doctorId,
      date: selected?.fullDate || "",
      time: selectedTime,
    });

    router.push(`/bookappointment?${params.toString()}`);
  };

  const canConfirm = !!doctorId && !!selectedTime && !isBlockedDay && !isDisabledDay;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/35 backdrop-blur-[1px] sm:bg-black/30"
        onClick={onClose}
      />

      <aside
        className={[
          "fixed bottom-0 left-0 right-0 z-[210] flex h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 sm:bottom-0 sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-w-md sm:rounded-none",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full",
        ].join(" ")}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e8e8e8] bg-white px-4 py-4 sm:px-8 sm:py-6">
          <div className="min-w-0 pr-3">
            <h3 className="truncate font-['Manrope'] text-xl font-bold text-[#0f766e] sm:text-2xl">
              {doctorSchedule.fullName}
            </h3>
            <p className="mt-1 text-sm text-[#5a6664]">
              Select an available time
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6d7a77] transition hover:bg-[#f2f4f4] hover:text-[#1a1c1c]"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
          <div className="space-y-7 sm:space-y-8">
            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
                This Week
              </h4>

              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                {dayAvailability.map((item, index) => {
                  const isSelected = index === selectedDayIndex;
                  const disabled = item.disabled;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      disabled={disabled}
                      aria-disabled={disabled}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedDayIndex(index);
                        setSelectedTime("");
                      }}
                      className={[
                        "flex min-w-[64px] flex-col items-center rounded-xl border px-3 py-3 transition-all duration-200 sm:min-w-[72px]",
                        disabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-80"
                          : isSelected
                            ? "border-[#0f766e] bg-[#0f766e] text-white shadow-md"
                            : "border-[#0f766e]/30 bg-[#0f766e]/5 text-[#0f766e] hover:border-[#0f766e] hover:bg-[#0f766e]/10",
                      ].join(" ")}
                    >
                      <span className="text-[11px] uppercase leading-none">
                        {item.day}
                      </span>
                      <span className="mt-1 text-lg font-bold leading-none">
                        {item.date}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
                Available Slots
              </h4>

              {loadingSchedule ? (
                <div className="rounded-2xl border border-dashed border-[#bcc9c6]/50 px-4 py-6 text-center text-sm text-[#6d7a77]">
                  Loading doctor schedule...
                </div>
              ) : scheduleError ? (
                <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
                  {scheduleError}
                </div>
              ) : isBlockedDay ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Doctor is unavailable on this date.
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {availableSlots.map((slot) => {
                    const selected =
                      slot.startTime === selectedTime ||
                      slot.label === selectedTime;

                    return (
                      <button
                        key={`${slot.startTime}-${slot.endTime}`}
                        type="button"
                        onClick={() => setSelectedTime(slot.startTime)}
                        className={[
                          "rounded-xl border px-4 py-3 text-center text-sm font-medium transition active:scale-[0.99]",
                          selected
                            ? "border-[#0f766e] bg-[#0f766e]/5 text-[#0f766e]"
                            : "border-[#bcc9c6]/40 text-[#1a1c1c] hover:border-[#0f766e] hover:text-[#0f766e]",
                        ].join(" ")}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No available slots for this day
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-[#e8e8e8] bg-[#f9f9f9] px-4 py-4 sm:p-8">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full rounded-full bg-[#0f766e] py-4 text-base font-bold text-white transition hover:bg-[#0b5f59] disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
          >
            Confirm {selectedTime || "Time"}
          </button>
          <p className="mt-3 text-center text-xs text-[#5a6664] sm:mt-4">
            A confirmation will be sent to your registered email.
          </p>
        </div>
      </aside>
    </>
  );
}