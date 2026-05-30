"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CancelAppointmentModal from "@/components/patient/CancelAppointmentModal";
import RescheduleAppointmentModal from "@/components/patient/RescheduleAppointmentModal";
import {
  Video,
  MapPin,
  RefreshCw,
  ChevronDown,
  CircleDashed,
  Clock3,
  CircleX,
  CircleCheckBig,
  Filter,
  X,
  Navigation2,
  LocateFixed,
  ArrowRight,
} from "lucide-react";
import AppointmentFilterModal from "@/components/patient/AppointmentFilterModal";
import {
  AppointmentApiResponse,
  AppointmentItem,
  AppointmentStatus,
  DoctorApiItem,
  DoctorWorkingHour,
} from "@/types/appointment";

type FilterStatus = "all" | "pending" | "accepted" | "rejected" | "completed";

function isValidAppointmentStatus(
  value: string | null,
): value is AppointmentStatus {
  return (
    value === "pending" ||
    value === "accepted" ||
    value === "rejected" ||
    value === "completed" ||
    value === "cancelled"
  );
}

function getDoctorName(appointment: AppointmentItem) {
  if (typeof appointment.doctor === "string") return "Doctor";
  return appointment.doctor.fullName || "Doctor";
}

function getDoctorSpecialty(appointment: AppointmentItem) {
  if (typeof appointment.doctor === "string") return "";
  return appointment.doctor.specialization || "";
}

function getDoctorClinicAddress(appointment: AppointmentItem) {
  if (typeof appointment.doctor === "string") return "";
  return appointment.doctor.clinicAddress || "";
}

function getDoctorPhoto(appointment: AppointmentItem) {
  if (typeof appointment.doctor === "string") return "";
  return appointment.doctor.profilePicture || "";
}

function getAppointmentDateTime(appointment: AppointmentItem) {
  const dateKey = appointment.appointmentDate
    ? new Date(appointment.appointmentDate).toISOString().slice(0, 10)
    : "";

  const iso = `${dateKey}T${appointment.startTime || "00:00"}:00`;
  const parsed = new Date(iso);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTime(date: Date | null) {
  if (!date) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSmallDate(date: Date | null) {
  if (!date) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status: AppointmentStatus) {
  switch (status) {
    case "accepted":
      return "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary";
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    case "completed":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300";
    case "rejected":
      return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
    case "cancelled":
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function statusLabel(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "completed":
      return "Completed";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function filterIcon(status: FilterStatus) {
  switch (status) {
    case "pending":
      return <CircleDashed size={14} />;
    case "accepted":
      return <Clock3 size={14} />;
    case "rejected":
      return <CircleX size={14} />;
    case "completed":
      return <CircleCheckBig size={14} />;
    default:
      return <CircleDashed size={14} />;
  }
}

function getAppointmentPriority(appointment: AppointmentItem) {
  if (appointment.status === "accepted") return 0;
  if (appointment.status === "pending" && !appointment.rescheduleReason)
    return 1;
  if (appointment.status === "pending" && appointment.rescheduleReason)
    return 2;
  if (appointment.status === "rejected") return 3;
  if (appointment.status === "cancelled") return 4;
  if (appointment.status === "completed") return 5;
  return 6;
}

function getDirectionsUrl(address: string) {
  if (!address.trim()) return "#";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

export default function AppointmentHistoryClient(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientId = searchParams.get("patientId") || "";
  const doctorId = searchParams.get("doctorId") || "";
  const statusParam = searchParams.get("status");

  const [doctorWorkingHours, setDoctorWorkingHours] = useState<
    DoctorWorkingHour[]
  >([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedCancelAppointment, setSelectedCancelAppointment] =
    useState<AppointmentItem | null>(null);

  const ITEMS_PER_PAGE = 2;

  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterStatus>(() => {
    if (
      statusParam === "pending" ||
      statusParam === "accepted" ||
      statusParam === "rejected" ||
      statusParam === "completed"
    ) {
      return statusParam;
    }

    return "all";
  });
  const [filterOpen, setFilterOpen] = useState(false);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [selectedRescheduleAppointment, setSelectedRescheduleAppointment] =
    useState<AppointmentItem | null>(null);

  const [directionsOpen, setDirectionsOpen] = useState(false);
  const [selectedDirectionsAppointment, setSelectedDirectionsAppointment] =
    useState<AppointmentItem | null>(null);

  function getAppointmentDoctorId(
    appointment: AppointmentItem,
    fallbackDoctorId: string,
  ) {
    if (typeof appointment.doctor === "string") {
      return appointment.doctor;
    }

    return appointment.doctor._id || fallbackDoctorId;
  }

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeFilter]);

  useEffect(() => {
    if (!rescheduleOpen || !selectedRescheduleAppointment) return;

    const controller = new AbortController();

    async function loadDoctorWorkingHours() {
      try {
        const res = await fetch("/api/doctors", {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setDoctorWorkingHours([]);
          return;
        }

        const targetDoctorId = selectedRescheduleAppointment
          ? getAppointmentDoctorId(selectedRescheduleAppointment, doctorId)
          : doctorId;

        const doctor = (data.doctors as DoctorApiItem[]).find(
          (item) => item.id === targetDoctorId,
        );

        setDoctorWorkingHours(doctor?.workingHours || []);
      } catch {
        setDoctorWorkingHours([]);
      }
    }

    loadDoctorWorkingHours();

    return () => controller.abort();
  }, [rescheduleOpen, selectedRescheduleAppointment, doctorId]);

  const availableSlotsForSelectedDate = useMemo(() => {
    if (!selectedRescheduleAppointment) return [];

    const selectedDate = selectedRescheduleAppointment
      ? getYmdInputValue(selectedRescheduleAppointment.appointmentDate)
      : "";

    return doctorWorkingHours
      .filter(
        (slot) => slot.date === selectedDate && slot.isAvailable !== false,
      )
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [doctorWorkingHours, selectedRescheduleAppointment]);

  const handleConfirmReschedule = async (data: {
    newAppointmentDate: string;
    newStartTime: string;
    newEndTime: string;
    rescheduleReason: string;
  }) => {
    if (!selectedRescheduleAppointment) return;

    try {
      setRescheduleLoading(true);

      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: selectedRescheduleAppointment._id,
          action: "reschedule",
          newAppointmentDate: data.newAppointmentDate,
          newStartTime: data.newStartTime,
          newEndTime: data.newEndTime,
          rescheduleReason: data.rescheduleReason,
        }),
      });

      const response = (await res.json()) as {
        success: boolean;
        message?: string;
        appointment?: AppointmentItem;
      };

      if (!res.ok || !response.success) {
        throw new Error(response.message || "Failed to reschedule appointment");
      }

      if (response.appointment) {
        setAppointments((prev) =>
          prev.map((item) =>
            item._id === selectedRescheduleAppointment._id
              ? response.appointment!
              : item,
          ),
        );
      } else {
        setAppointments((prev) =>
          prev.map((item) =>
            item._id === selectedRescheduleAppointment._id
              ? {
                  ...item,
                  appointmentDate: data.newAppointmentDate,
                  startTime: data.newStartTime,
                  endTime: data.newEndTime,
                  status: "pending",
                  rescheduleReason: data.rescheduleReason,
                  rejectionReason: "",
                }
              : item,
          ),
        );
      }

      setRescheduleOpen(false);
      setSelectedRescheduleAppointment(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while rescheduling",
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!selectedCancelAppointment) return;

    try {
      setCancelLoading(true);

      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: selectedCancelAppointment._id,
          action: "cancel",
          cancellationReason: reason,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === selectedCancelAppointment._id
            ? {
                ...item,
                status: "cancelled",
              }
            : item,
        ),
      );

      setCancelOpen(false);
      setSelectedCancelAppointment(null);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling",
      );
    } finally {
      setCancelLoading(false);
    }
  };

  function getYmdInputValue(dateValue: string) {
    if (!dateValue) return "";
    return new Date(dateValue).toISOString().slice(0, 10);
  }

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (patientId) params.set("patientId", patientId);
    if (doctorId) params.set("doctorId", doctorId);

    return params.toString();
  }, [doctorId, patientId]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAppointments() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/appointments${queryString ? `?${queryString}` : ""}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const data: AppointmentApiResponse = await res.json();

        if (!res.ok || !data.success) {
          setAppointments([]);
          setError(
            !data.success && "message" in data && data.message
              ? data.message
              : "Failed to load appointments",
          );
          return;
        }

        const sorted = [...data.appointments].sort((a, b) => {
          const priorityA = getAppointmentPriority(a);
          const priorityB = getAppointmentPriority(b);
          if (priorityA !== priorityB) return priorityA - priorityB;

          const aDate = getAppointmentDateTime(a)?.getTime() ?? 0;
          const bDate = getAppointmentDateTime(b)?.getTime() ?? 0;
          if (aDate !== bDate) return aDate - bDate;

          return a.startTime.localeCompare(b.startTime);
        });

        setAppointments(sorted);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError("Something went wrong while loading appointments.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();

    return () => controller.abort();
  }, [queryString]);

  const visibleAppointments = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? appointments
        : appointments.filter(
            (appointment) => appointment.status === activeFilter,
          );

    return [...filtered].sort((a, b) => {
      const priorityA = getAppointmentPriority(a);
      const priorityB = getAppointmentPriority(b);
      if (priorityA !== priorityB) return priorityA - priorityB;

      const aDate = getAppointmentDateTime(a)?.getTime() ?? 0;
      const bDate = getAppointmentDateTime(b)?.getTime() ?? 0;
      if (aDate !== bDate) return aDate - bDate;

      return a.startTime.localeCompare(b.startTime);
    });
  }, [appointments, activeFilter]);

  const paginatedAppointments = useMemo(() => {
    return visibleAppointments.slice(0, visibleCount);
  }, [visibleAppointments, visibleCount]);

  const hasMoreAppointments = visibleCount < visibleAppointments.length;

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      accepted: appointments.filter((a) => a.status === "accepted").length,
      rejected: appointments.filter((a) => a.status === "rejected").length,
      completed: appointments.filter((a) => a.status === "completed").length,
    };
  }, [appointments]);

  const filters: Array<{ key: FilterStatus; label: string; count: number }> = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "accepted", label: "Accepted", count: counts.accepted },
    { key: "rejected", label: "Rejected", count: counts.rejected },
    { key: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div className="min-h-screen mt-20 flex flex-col font-sans bg-organic-pattern bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/20">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fixed top-20 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-slate-900/5 dark:bg-white/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Your Care Journey
            </h1>
            <p className="text-slate-500 mt-1">
              Track your appointments and health history
            </p>
          </div>

          <div className="relative flex justify-end w-full md:w-auto">
            <button
              onClick={() => setFilterOpen(true)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2"
            >
              <Filter size={16} />
              <span>Filter</span>
              <span className="text-xs rounded-full px-2 py-0.5 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                {activeFilter === "all" ? counts.all : counts[activeFilter]}
              </span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 p-6">
            <p className="text-slate-500">Loading appointments...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 p-6 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && visibleAppointments.length === 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              No appointments found
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {activeFilter === "all"
                ? "Your appointment history will appear here."
                : "Try another filter or clear your selection."}
            </p>
          </div>
        )}

        {!loading && !error && visibleAppointments.length > 0 && (
          <div className="relative space-y-0 pl-2">
            {paginatedAppointments.map((a) => {
              const appointmentDateTime = getAppointmentDateTime(a);
              const isVideo = a.consultationType === "video";
              const isRescheduled =
                a.status === "pending" && Boolean(a.rescheduleReason);

              return (
                <div
                  key={a._id}
                  className="timeline-item relative flex gap-6 pb-10"
                >
                  <div className="timeline-connector" />

                  <div className="hidden sm:flex flex-col items-end w-32 pt-1 shrink-0">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatSmallDate(appointmentDateTime)}
                    </span>
                    {a.startTime && (
                      <span className="text-sm text-primary font-medium">
                        {formatTime(appointmentDateTime)}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 mt-1">
                      {a.endTime
                        ? `${a.startTime} - ${a.endTime}`
                        : a.startTime}
                    </span>
                  </div>

                  <div className="relative z-10 shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-background-dark ${
                        a.status === "accepted"
                          ? "bg-primary text-white"
                          : a.status === "pending"
                            ? isRescheduled
                              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : a.status === "completed"
                              ? "bg-emerald-500 text-white"
                              : a.status === "rejected"
                                ? "bg-rose-500 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isVideo ? <Video size={20} /> : <MapPin size={20} />}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div
                      className={`glass-panel rounded-2xl p-6 hover:shadow-xl transition-shadow relative overflow-hidden border-l-4 ${
                        a.status === "accepted"
                          ? "border-l-primary"
                          : a.status === "pending"
                            ? isRescheduled
                              ? "border-l-violet-400"
                              : "border-l-amber-400"
                            : a.status === "completed"
                              ? "border-l-emerald-500"
                              : a.status === "rejected"
                                ? "border-l-rose-500"
                                : "border-l-slate-300 dark:border-l-slate-600"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div
                          className={`flex gap-4 items-start ${
                            a.status === "completed" || a.status === "cancelled"
                              ? "opacity-90"
                              : ""
                          }`}
                        >
                          <div className="relative">
                            {getDoctorPhoto(a) ? (
                              <img
                                alt={getDoctorName(a)}
                                className={`w-16 h-16 rounded-2xl object-cover shadow-md transition-all ${
                                  a.status === "completed" ||
                                  a.status === "cancelled"
                                    ? "grayscale opacity-80"
                                    : ""
                                }`}
                                src={getDoctorPhoto(a)}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                {getDoctorName(a).slice(0, 1)}
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {getDoctorName(a)}
                              </h3>
                              <span
                                className={`status-badge ${statusBadge(a.status)}`}
                              >
                                {isRescheduled
                                  ? "Rescheduled"
                                  : statusLabel(a.status)}
                              </span>
                            </div>

                            <p className="font-medium text-sm text-primary">
                              {getDoctorSpecialty(a)}
                            </p>

                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              {isVideo ? (
                                <Video size={14} />
                              ) : (
                                <MapPin size={14} />
                              )}
                              <span className="ml-1 text-xs text-slate-500">
                                {isVideo
                                  ? "Video Consultation"
                                  : getDoctorClinicAddress(a) ||
                                    "In-person consultation"}
                              </span>
                            </div>

                            {a.reasonForVisit && (
                              <p className="text-sm text-slate-500 mt-2">
                                Reason: {a.reasonForVisit}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center items-start md:items-end gap-3 md:border-l md:border-slate-100 dark:md:border-slate-700 md:pl-6">
                          <div className="sm:hidden mb-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatSmallDate(appointmentDateTime)}
                            </span>
                          </div>

                          {a.notes && (
                            <p className="text-sm text-slate-500 mb-1">
                              {a.notes}
                            </p>
                          )}

                          {a.status === "pending" && (
                            <p className="text-sm font-medium text-primary mb-1">
                              {isRescheduled
                                ? "Waiting for new schedule confirmation"
                                : "Waiting for doctor confirmation"}
                            </p>
                          )}

                          {a.status === "pending" && a.rescheduleReason && (
                            <p className="text-sm text-violet-600 dark:text-violet-300 mb-1">
                              Reschedule reason: {a.rescheduleReason}
                            </p>
                          )}

                          {a.status === "rejected" && a.rejectionReason && (
                            <p className="text-sm text-rose-500 mb-1">
                              {a.rejectionReason}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            {a.status === "pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRescheduleAppointment(a);
                                    setRescheduleOpen(true);
                                  }}
                                  className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                                >
                                  Reschedule
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedCancelAppointment(a);
                                    setCancelOpen(true);
                                  }}
                                  className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {a.status === "accepted" && (
                              <>
                                {isVideo ? (
                                  <button
                                    onClick={() =>
                                      router.push(`/consultation/${a._id}`)
                                    }
                                    className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                  >
                                    <Video size={16} />
                                    Join Call
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedDirectionsAppointment(a);
                                      setDirectionsOpen(true);
                                    }}
                                    className="flex-1 md:flex-none px-5 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm transition-all flex items-center justify-center gap-2"
                                  >
                                    <MapPin size={16} />
                                    Get Directions
                                  </button>
                                )}
                              </>
                            )}

                            {a.status === "completed" && (
                              <>
                                <button
                                  onClick={() => router.push("/medicalrecords")}
                                  className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                  <RefreshCw size={16} />
                                  View Prescription
                                </button>

                                <button
                                  onClick={() => router.push("/finddoctor")}
                                  className="flex-1 md:flex-none px-4 py-2 rounded-lg text-primary hover:bg-primary/5 font-medium text-sm transition-colors"
                                >
                                  Book Again
                                </button>
                              </>
                            )}

                            {a.status === "cancelled" && (
                              <p className="text-xs text-slate-400 italic">
                                Cancelled
                              </p>
                            )}

                            {a.status === "rejected" && (
                              <p className="text-xs text-slate-400 italic">
                                Rejected
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMoreAppointments && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() =>
                    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                >
                  Load More History
                  <ChevronDown size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <RescheduleAppointmentModal
        open={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false);
          setSelectedRescheduleAppointment(null);
        }}
        onConfirm={handleConfirmReschedule}
        loading={rescheduleLoading}
        appointmentTitle={
          selectedRescheduleAppointment
            ? getDoctorName(selectedRescheduleAppointment)
            : "this appointment"
        }
        defaultDate={
          selectedRescheduleAppointment
            ? getYmdInputValue(selectedRescheduleAppointment.appointmentDate)
            : ""
        }
        defaultStartTime={selectedRescheduleAppointment?.startTime || ""}
        defaultReason={selectedRescheduleAppointment?.rescheduleReason || ""}
        availableSlots={availableSlotsForSelectedDate}
      />

      {filterOpen && (
        <AppointmentFilterModal
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          counts={counts}
        />
      )}

      <CancelAppointmentModal
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setSelectedCancelAppointment(null);
        }}
        onConfirm={handleConfirmCancel}
        loading={cancelLoading}
        appointmentTitle={
          selectedCancelAppointment
            ? getDoctorName(selectedCancelAppointment)
            : "this appointment"
        }
      />

      {directionsOpen && selectedDirectionsAppointment && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Clinic location
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  Doctor: {getDoctorName(selectedDirectionsAppointment)}
                </h3>
              </div>

              <button
                onClick={() => {
                  setDirectionsOpen(false);
                  setSelectedDirectionsAppointment(null);
                }}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {getDoctorSpecialty(selectedDirectionsAppointment) ||
                        "Clinic"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {getDoctorClinicAddress(selectedDirectionsAppointment) ||
                        "Clinic address not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <a
                  href={getDirectionsUrl(
                    getDoctorClinicAddress(selectedDirectionsAppointment),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-110"
                >
                  Open in Maps
                  <MapPin size={16} />
                </a>

                <button
                  onClick={() => {
                    setDirectionsOpen(false);
                    setSelectedDirectionsAppointment(null);
                  }}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
