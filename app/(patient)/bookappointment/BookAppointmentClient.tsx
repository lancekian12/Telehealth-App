"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Video,
  Stethoscope,
  Star,
  CreditCard,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type ConsultationType = "video" | "in_person";

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
    fullName: string;
    specialization: string;
    profilePicture?: string;
    consultationFee?: number;
    clinicAddress?: string;
    rating?: number;
    consultationDurationMinutes?: number;
    workingHours?: WorkingHour[];
    unavailableSlots?: UnavailableSlot[];
    scheduleOverrides?: ScheduleOverride[];
    bookedSlots?: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }>;
  };
};

type PatientMeResponse = {
  success: boolean;
  message?: string;
  patient?: {
    id: string;
    clerkId: string;
    role: string;
    fullName: string;
    profilePicture?: string;
    email?: string;
  };
};

type TimeSlot = {
  startTime: string;
  endTime: string;
  label: string;
};

type TimeRange = {
  startTime: string;
  endTime: string;
};

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

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateWeek(anchor: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const d = addDays(anchor, index);
    const day = d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

    return {
      key: toYmd(d),
      day,
      date: d.getDate(),
      fullDate: toYmd(d),
    };
  });
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

function dedupeSlots(slots: TimeSlot[]) {
  return slots.filter(
    (slot, index, arr) =>
      arr.findIndex(
        (x) => x.startTime === slot.startTime && x.endTime === slot.endTime,
      ) === index,
  );
}

export default function BookAppointmentClient(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const doctorId = searchParams.get("doctorId") || "";
  const initialDate = searchParams.get("date") || "";
  const initialTime = searchParams.get("time") || "";

  const [patientId, setPatientId] = useState("");
  const [patientLoading, setPatientLoading] = useState(false);

  const [consultationType, setConsultationType] =
    useState<ConsultationType>("video");
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  const [doctor, setDoctor] = useState<DoctorDetailsResponse["doctor"] | null>(
    null,
  );
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasClinicAddress = useMemo(() => {
    return !!doctor?.clinicAddress?.trim();
  }, [doctor?.clinicAddress]);

  const anchorDate = useMemo(() => {
    if (!initialDate) return new Date();
    const [year, month, day] = initialDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [initialDate]);

  const dates = useMemo(() => {
    const start = addDays(anchorDate, -3);
    return generateWeek(start);
  }, [anchorDate]);

  useEffect(() => {
    if (!initialDate) return;
    const idx = dates.findIndex((d) => d.fullDate === initialDate);
    if (idx >= 0) setSelectedDateIdx(idx);
  }, [dates, initialDate]);

  useEffect(() => {
    if (!doctorId) return;

    const controller = new AbortController();

    async function loadDoctor() {
      try {
        setLoadingDoctor(true);
        setDoctorError(null);

        const res = await fetch(`/api/doctor/${doctorId}`, {
          signal: controller.signal,
        });

        const json: DoctorDetailsResponse = await res.json();

        if (!res.ok || !json.success || !json.doctor) {
          throw new Error(json.message || "Failed to load doctor");
        }

        setDoctor(json.doctor);
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        setDoctorError(
          error instanceof Error ? error.message : "Failed to load doctor",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingDoctor(false);
      }
    }

    void loadDoctor();
    return () => controller.abort();
  }, [doctorId]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMe() {
      try {
        setPatientLoading(true);
        const res = await fetch("/api/patient", {
          signal: controller.signal,
        });

        const json: PatientMeResponse = await res.json();

        if (!res.ok || !json.success || !json.patient) {
          throw new Error(json.message || "Failed to load patient");
        }

        setPatientId(json.patient.id);
      } catch {
        // ignore
      } finally {
        if (!controller.signal.aborted) setPatientLoading(false);
      }
    }

    void loadMe();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasClinicAddress && consultationType === "in_person") {
      setConsultationType("video");
    }
  }, [hasClinicAddress, consultationType]);

  const selectedDate = dates[selectedDateIdx];

  const workingHoursForSelectedDate = useMemo<TimeSlot[]>(() => {
    if (!doctor || !selectedDate) return [];

    const day = selectedDate.fullDate;

    const unavailableForDay = doctor.unavailableSlots?.filter(
      (slot) => slot.date === day,
    ) || [];

    const blockedByFullDayUnavailable = unavailableForDay.some((slot) =>
      isFullDayBlocked(slot),
    );

    const cancelledOverride = doctor.scheduleOverrides?.some(
      (item) => item.date === day && item.action === "cancelled",
    );

    if (blockedByFullDayUnavailable || cancelledOverride) {
      return [];
    }

    const workingHoursForDay = (doctor.workingHours || []).filter(
      (hour) => hour.date === day && hour.isAvailable !== false,
    );

    const blockedRanges = unavailableForDay
      .filter(
        (slot) =>
          !isFullDayBlocked(slot) && slot.startTime && slot.endTime,
      )
      .map((slot) => ({
        startTime: slot.startTime as string,
        endTime: slot.endTime as string,
      }));

    const bookedRanges = (doctor.bookedSlots || [])
      .filter((slot) => slot.date === day)
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }));

    const rescheduledSlots = (doctor.scheduleOverrides || [])
      .filter(
        (item) =>
          item.action === "rescheduled" &&
          item.newDate === day &&
          item.newStartTime &&
          item.newEndTime,
      )
      .map((item) => ({
        startTime: item.newStartTime as string,
        endTime: item.newEndTime as string,
        label: `${formatTimeLabel(item.newStartTime as string)} - ${formatTimeLabel(
          item.newEndTime as string,
        )}`,
      }));

    const baseSlots = workingHoursForDay.flatMap((slot) => {
      const remaining = subtractRanges(
        {
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        [...blockedRanges, ...bookedRanges],
      );

      return remaining.map((range) => ({
        startTime: range.startTime,
        endTime: range.endTime,
        label: `${formatTimeLabel(range.startTime)} - ${formatTimeLabel(
          range.endTime,
        )}`,
      }));
    });

    return dedupeSlots([...baseSlots, ...rescheduledSlots]);
  }, [doctor, selectedDate]);

  useEffect(() => {
    if (workingHoursForSelectedDate.length === 0) {
      setSelectedTime("");
      return;
    }

    const stillValid = workingHoursForSelectedDate.some(
      (slot) => slot.startTime === selectedTime,
    );

    if (!stillValid) {
      if (initialTime) {
        const matchedInitialSlot = workingHoursForSelectedDate.find(
          (slot) => slot.startTime === initialTime,
        );

        if (matchedInitialSlot) {
          setSelectedTime(matchedInitialSlot.startTime);
          return;
        }
      }

      setSelectedTime(workingHoursForSelectedDate[0].startTime);
    }
  }, [workingHoursForSelectedDate, initialTime, selectedTime]);

  const selectedSlot = useMemo(() => {
    return (
      workingHoursForSelectedDate.find((slot) => slot.startTime === selectedTime) ||
      null
    );
  }, [workingHoursForSelectedDate, selectedTime]);

  const canConfirm = useMemo(() => {
    return (
      !!doctorId &&
      !!patientId &&
      !!selectedTime &&
      !!selectedDate &&
      !!doctor &&
      !!selectedSlot &&
      !submitting &&
      !patientLoading
    );
  }, [
    doctorId,
    patientId,
    selectedTime,
    selectedDate,
    doctor,
    selectedSlot,
    submitting,
    patientLoading,
  ]);

  async function confirm() {
    if (!doctorId || !patientId) {
      setBookingError("Missing doctorId or patientId.");
      return;
    }

    if (!doctor || !selectedDate || !selectedSlot) {
      setBookingError("Please select a valid date and time.");
      return;
    }

    try {
      setSubmitting(true);
      setBookingError(null);
      setBookingSuccess(null);
      setShowSuccessOverlay(false);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          patientId,
          appointmentDate: selectedDate.fullDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          consultationType,
          reasonForVisit: "",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to book appointment");
      }

      setBookingSuccess("Appointment booked successfully.");
      setShowSuccessOverlay(true);

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        router.push("/appointments");
      }, 1800);
    } catch (error: unknown) {
      setBookingError(
        error instanceof Error ? error.message : "Failed to book appointment",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 dark:bg-[#0f172a] dark:text-slate-100">
      {showSuccessOverlay ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white p-8 text-center shadow-2xl dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={34} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Appointment booked
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
              Your appointment was saved successfully. Redirecting you now...
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-[#008081]">
              <Loader2 size={16} className="animate-spin" />
              Taking you to your appointments
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <a className="transition-colors hover:text-[#008081]" href="#">
            Home
          </a>
          <ChevronRight className="text-[14px]" />
          <a className="transition-colors hover:text-[#008081]" href="#">
            Find Doctor
          </a>
          <ChevronRight className="text-[14px]" />
          <span className="font-semibold text-[#008081]">Book Appointment</span>
        </nav>

        {doctorError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {doctorError}
          </div>
        ) : null}

        {bookingError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {bookingError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80">
              <div className="absolute left-0 top-0 z-0 h-32 w-full bg-gradient-to-br from-[#008081]/10 to-[#81B641]/10" />
              <div className="relative z-10 mt-4 flex flex-col items-center text-center">
                <div className="mb-4 h-32 w-32 rounded-full bg-white p-1 shadow-xl">
                  <img
                    alt={doctor?.fullName || "Doctor"}
                    className="h-full w-full rounded-full object-cover"
                    src={
                      doctor?.profilePicture ||
                      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400"
                    }
                  />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loadingDoctor ? "Loading..." : doctor?.fullName || "Doctor"}
                </h1>
                <p className="mt-1 font-medium text-[#008081]">
                  {doctor?.specialization || "Specialist"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {doctor?.clinicAddress || "Clinic address"}
                </p>

                <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-600 dark:bg-slate-700/50">
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {(doctor?.rating ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-8 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 opacity-70 dark:text-white">
                  About
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Book your consultation with the selected doctor.
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div>
                  <p className="mb-0.5 text-xs text-slate-500">
                    Consultation Fee
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ₱{doctor?.consultationFee ?? 0}
                  </p>
                </div>
                <CreditCard size={32} className="text-slate-300" />
              </div>
            </div>
          </div>

          <div className="space-y-8 pb-12 lg:col-span-8">
            <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008081] font-bold text-white shadow-lg">
                  1
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Select Consultation Type
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="relative block">
                  <input
                    name="consultation_type"
                    type="radio"
                    checked={consultationType === "video"}
                    onChange={() => setConsultationType("video")}
                    className="sr-only"
                  />
                  <div
                    className={`h-full rounded-2xl border bg-white p-5 text-left transition-all dark:bg-slate-900 ${
                      consultationType === "video"
                        ? "border-[#008081] bg-[#008081]/5 text-[#008081]"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30">
                        <Video size={20} />
                      </div>
                      <div>
                        <h3 className="mb-1 font-bold text-slate-900 dark:text-white">
                          Video Consultation
                        </h3>
                        <p className="mb-2 text-xs leading-relaxed text-slate-500">
                          Connect remotely via secure video call.
                        </p>
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900/30">
                          Available Now
                        </span>
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative block ${
                    !hasClinicAddress ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <input
                    name="consultation_type"
                    type="radio"
                    checked={consultationType === "in_person"}
                    onChange={() => {
                      if (hasClinicAddress) setConsultationType("in_person");
                    }}
                    disabled={!hasClinicAddress}
                    className="sr-only"
                  />
                  <div
                    className={`h-full rounded-2xl border bg-white p-5 text-left transition-all dark:bg-slate-900 ${
                      consultationType === "in_person" && hasClinicAddress
                        ? "border-[#81B641] bg-[#81B641]/5 text-[#81B641]"
                        : "border-transparent"
                    } ${!hasClinicAddress ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#81B641]/10 text-[#81B641]">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h3 className="mb-1 font-bold text-slate-900 dark:text-white">
                          In-Person Visit
                        </h3>
                        <p className="mb-2 text-xs leading-relaxed text-slate-500">
                          {hasClinicAddress
                            ? "Visit the clinic on your chosen schedule."
                            : "Unavailable because the clinic address is not set."}
                        </p>
                        <span className="text-xs font-semibold text-slate-500">
                          {hasClinicAddress ? "Requires Confirmation" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008081] font-bold text-white shadow-lg">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Choose Date
                  </h2>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4">
                {dates.map((d, i) => {
                  const selected = i === selectedDateIdx;

                  return (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDateIdx(i)}
                      className={`flex min-w-[80px] flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                        selected
                          ? "border-[#008081] bg-[#008081] text-white shadow-lg"
                          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <span
                        className={`mb-1 text-xs font-medium uppercase ${
                          selected ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        {d.day}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          selected ? "text-white" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {d.date}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedDate ? (
                <p className="mt-3 text-sm text-slate-500">
                  Selected date: {formatDateLabel(selectedDate.fullDate)}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80 sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#008081] font-bold text-white shadow-lg">
                  3
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Pick a Time
                </h2>
              </div>

              {workingHoursForSelectedDate.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {workingHoursForSelectedDate.map((slot) => {
                    const selected = selectedTime === slot.startTime;

                    return (
                      <button
                        key={`${slot.startTime}-${slot.endTime}`}
                        type="button"
                        onClick={() => setSelectedTime(slot.startTime)}
                        className={`rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                          selected
                            ? "border-[#008081] bg-[#008081] text-white shadow-lg"
                            : "border-[#E2E8F0] bg-white hover:border-[#008081]/50 hover:bg-[#008081]/5 hover:text-[#008081] dark:border-slate-700 dark:bg-slate-800"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">
                  No available slots for this selected date.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={confirm}
                disabled={!canConfirm}
                className={`flex w-full items-center justify-center gap-2 rounded-full bg-[#008081] px-8 py-4 text-lg font-bold text-white shadow-xl transition-all hover:bg-[#00736f] sm:w-auto ${
                  !canConfirm ? "cursor-not-allowed opacity-60" : "hover:-translate-y-1"
                }`}
              >
                {submitting ? "Booking..." : "Confirm Appointment"}
                <ArrowRight size={18} />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {bookingSuccess}
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}