"use client";

import React, { useMemo } from "react";
import { X } from "lucide-react";
import { FindDoctor } from "@/types/doctor";

type SelectedDateItem = {
  key: string;
  day: string;
  date: number;
  fullDate: string; // YYYY-MM-DD
  active: boolean;
  muted: boolean;
};

type WorkingHour = {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type ScheduleOverride = {
  date: string; // YYYY-MM-DD
  status: "available" | "blocked";
  startTime?: string | null;
  endTime?: string | null;
  reason?: string;
};

type AvailabilitySchedule = {
  workingHours: WorkingHour[];
  scheduleOverrides: ScheduleOverride[];
} | null;

type AvailabilityPanelProps = {
  open: boolean;
  onClose: () => void;
  activeDoctor: FindDoctor | null;
  selectedDate: SelectedDateItem[];
  selectedDayIndex: number;
  setSelectedDayIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedTime: string;
  setSelectedTime: React.Dispatch<React.SetStateAction<string>>;
  schedule: AvailabilitySchedule;
};

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function formatMinutesToTime(totalMinutes: number) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${meridiem}`;
}

function generateTimeSlots(start: string, end: string) {
  const slots: string[] = [];

  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);

  if (
    startMinutes === null ||
    endMinutes === null ||
    startMinutes >= endMinutes
  ) {
    return slots;
  }

  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    slots.push(formatMinutesToTime(minutes));
  }

  return slots;
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
  schedule,
}: AvailabilityPanelProps) {
  const selectedDay = selectedDate[selectedDayIndex];
  const selectedFullDate = selectedDay?.fullDate;
  const selectedDayName = selectedDay?.day;

  const workingHour = schedule?.workingHours?.find(
    (item) => item.day === selectedDayName && item.isAvailable,
  );

  const dateOverride = schedule?.scheduleOverrides?.find(
    (item) => item.date === selectedFullDate,
  );

  const availableSlots = useMemo(() => {
    if (!selectedDay || !selectedFullDate) return [];

    if (dateOverride?.status === "blocked") {
      return [];
    }

    const isAvailableOverride = dateOverride?.status === "available";

    let startTime = "";
    let endTime = "";

    if (
      isAvailableOverride &&
      dateOverride?.startTime &&
      dateOverride?.endTime
    ) {
      startTime = dateOverride.startTime;
      endTime = dateOverride.endTime;
    } else if (workingHour) {
      startTime = workingHour.startTime;
      endTime = workingHour.endTime;
    } else if (isAvailableOverride) {
      startTime = "00:00";
      endTime = "23:59";
    }

    if (!startTime || !endTime) return [];

    return generateTimeSlots(startTime, endTime);
  }, [selectedDay, selectedFullDate, dateOverride, workingHour]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/30" onClick={onClose} />

      <aside
        className={[
          "fixed right-0 top-0 z-[210] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-[#e8e8e8] bg-white px-8 py-6">
          <div>
            <h3 className="font-['Manrope'] text-2xl font-bold text-[#0f766e]">
              {activeDoctor?.name ?? "Doctor Schedule"}
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
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-grow space-y-8 overflow-y-auto px-8 py-6">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
              This Week
            </h4>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {selectedDate.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                  className={[
                    "flex min-w-[60px] flex-col items-center rounded-lg p-3 transition-colors",
                    item.active
                      ? "bg-[#0f766e] text-white"
                      : item.muted
                        ? "bg-[#f3f3f4] text-[#bcc9c6]"
                        : "bg-[#f3f3f4] text-[#1a1c1c] hover:bg-[#e8e8e8]",
                  ].join(" ")}
                >
                  <span className="text-xs uppercase">{item.day}</span>
                  <span className="text-lg font-bold">{item.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
              Available Slots
            </h4>

            {dateOverride?.status === "blocked" ? (
              <div className="rounded-lg border border-dashed border-[#bcc9c6]/50 px-4 py-6 text-center text-sm text-[#6d7a77]">
                Doctor is unavailable on this date
                {dateOverride.reason ? `: ${dateOverride.reason}` : "."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.length > 0 ? (
                  availableSlots.map((time) => {
                    const selected = time === selectedTime;

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={[
                          "rounded-lg border px-4 py-3 text-center text-sm font-medium transition",
                          selected
                            ? "border-[#0f766e] bg-[#0f766e]/5 text-[#0f766e]"
                            : "border-[#bcc9c6]/40 text-[#1a1c1c] hover:border-[#0f766e] hover:text-[#0f766e]",
                        ].join(" ")}
                      >
                        {time}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 rounded-lg border border-dashed border-[#bcc9c6]/50 px-4 py-6 text-center text-sm text-[#6d7a77]">
                    No available slots for this day
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto border-t border-[#e8e8e8] bg-[#f9f9f9] p-8">
          <button
            type="button"
            className="w-full rounded-full bg-[#0f766e] py-4 text-lg font-bold text-white transition hover:bg-[#0b5f59]"
          >
            Confirm {selectedTime || "Time"}
          </button>
          <p className="mt-4 text-center text-xs text-[#5a6664]">
            A confirmation will be sent to your registered email.
          </p>
        </div>
      </aside>
    </>
  );
}