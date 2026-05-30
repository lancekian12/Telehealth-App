"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Loader2,
  Sparkles,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import { useRealtimeNotifications } from "@/hooks/use-realtime-notification";

type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type ConsultationType = "video" | "in_person";

type DoctorData = {
  id: string;
  fullName: string;
  specialization: string;
  profilePicture?: string;
  acceptsNewPatients: boolean;
  email?: string;
  phone?: string;
  clinicAddress?: string;
  consultationFee?: number;
  consultationModes?: string[];
  languages?: string[];
  verified?: boolean;
};

type PopulatedPatient = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
  phone?: string;
};

type PopulatedPrescription = {
  _id?: string;
  diagnosis?: string;
  medication?: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  notes?: string;
  status?: string;
  issuedAt?: string;
  finalizedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Appointment = {
  _id: string;
  doctor: string;
  patient: PopulatedPatient | string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  consultationSessionLink?: string;
  reasonForVisit?: string;
  notes?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  prescription?: PopulatedPrescription | string | null;
};

type DoctorResponse = {
  success: boolean;
  doctor?: DoctorData;
  message?: string;
};

type AppointmentsResponse = {
  success: boolean;
  appointments?: Appointment[];
  message?: string;
};

function formatDateShort(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string) {
  if (!value) return "—";
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toUtcYmd(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return `${first}${last}`.toUpperCase() || "D";
}

function getPatientName(patient: Appointment["patient"]) {
  if (typeof patient === "string") return "Patient";
  return patient?.fullName?.trim() || "Patient";
}

function normalizePrescription(value: unknown): PopulatedPrescription | null {
  if (!value || typeof value !== "object") return null;

  const p = value as PopulatedPrescription;

  return {
    _id: p._id,
    diagnosis: p.diagnosis || "",
    medication: p.medication || "",
    dosage: p.dosage || "",
    duration: p.duration || "",
    instructions: p.instructions || "",
    notes: p.notes || "",
    status: p.status || "",
    issuedAt: p.issuedAt,
    finalizedAt: p.finalizedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function hasPrescriptionContent(prescription: PopulatedPrescription | null) {
  if (!prescription) return false;

  return Boolean(
    prescription.diagnosis?.trim() ||
      prescription.medication?.trim() ||
      prescription.dosage?.trim() ||
      prescription.duration?.trim() ||
      prescription.instructions?.trim() ||
      prescription.notes?.trim(),
  );
}

function prescriptionTitle(prescription: PopulatedPrescription | null) {
  if (!prescription) return "No prescription";
  return prescription.diagnosis?.trim() || "Prescription";
}

function prescriptionSubtitle(prescription: PopulatedPrescription | null) {
  if (!prescription) return "";
  const parts = [
    prescription.medication?.trim(),
    prescription.dosage?.trim(),
    prescription.duration?.trim(),
  ].filter(Boolean);

  return parts.length ? parts.join(" • ") : "";
}

function statusClass(status: AppointmentStatus) {
  switch (status) {
    case "accepted":
      return "bg-secondary/10 text-secondary ring-1 ring-inset ring-secondary/20";
    case "completed":
      return "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20";
    case "pending":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    case "rejected":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    case "cancelled":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
}

function StatusChip({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

function PrescriptionField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

const TODAY_PAGE_SIZE = 2;
const COMPLETED_PAGE_SIZE = 2;

export default function DoctorHomeClient() {
  const [currentDate, setCurrentDate] = useState("");
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayPage, setTodayPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);

  const doctorId = doctor?.id ?? null;

  const { notifications } = useRealtimeNotifications({
    role: "doctor",
    userId: doctorId,
    enabled: !!doctorId,
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const doctorProfilePicture = doctor?.profilePicture || "";
  const doctorInitials =
    doctor?.fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "DR";

  const loadData = async () => {
    setError("");

    try {
      const doctorRes = await fetch("/api/doctor", {
        cache: "no-store",
      });
      const doctorJson = (await doctorRes.json()) as DoctorResponse;

      if (!doctorRes.ok || !doctorJson.success || !doctorJson.doctor) {
        throw new Error(doctorJson.message || "Failed to load doctor");
      }

      setDoctor(doctorJson.doctor);

      const appointmentsRes = await fetch(
        `/api/appointments?doctorId=${encodeURIComponent(doctorJson.doctor.id)}`,
        {
          cache: "no-store",
        },
      );
      const appointmentsJson =
        (await appointmentsRes.json()) as AppointmentsResponse;

      if (
        !appointmentsRes.ok ||
        !appointmentsJson.success ||
        !Array.isArray(appointmentsJson.appointments)
      ) {
        throw new Error(
          appointmentsJson.message || "Failed to load appointments",
        );
      }

      setAppointments(appointmentsJson.appointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const d = new Date();
    setCurrentDate(
      d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );

    loadData();
  }, []);

  const todayYmd = useMemo(() => toUtcYmd(new Date()), []);

  const dashboard = useMemo(() => {
    const sorted = [...appointments].sort((a, b) => {
      const dateA = new Date(
        a.updatedAt || a.createdAt || a.appointmentDate,
      ).getTime();
      const dateB = new Date(
        b.updatedAt || b.createdAt || b.appointmentDate,
      ).getTime();

      if (dateA !== dateB) return dateB - dateA;
      return a.startTime.localeCompare(b.startTime);
    });

    const todayAppointments = sorted.filter(
      (appointment) => toUtcYmd(appointment.appointmentDate) === todayYmd,
    );

    const pendingAppointments = sorted.filter(
      (appointment) => appointment.status === "pending",
    );

    const completedAppointments = sorted.filter(
      (appointment) => appointment.status === "completed",
    );

    const completedWithPrescription = completedAppointments
      .map((appointment) => ({
        ...appointment,
        normalizedPrescription: normalizePrescription(appointment.prescription),
      }))
      .find((appointment) =>
        hasPrescriptionContent(appointment.normalizedPrescription),
      );

    return {
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      completedWithPrescription: completedWithPrescription || null,
    };
  }, [appointments, todayYmd]);

  const stats = [
    {
      label: "Today",
      value: dashboard.todayAppointments.length,
      icon: <CalendarClock className="h-5 w-5" />,
    },
    {
      label: "Pending",
      value: dashboard.pendingAppointments.length,
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      label: "Completed",
      value: dashboard.completedAppointments.length,
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
  ];

  const totalTodayPages = Math.max(
    1,
    Math.ceil(dashboard.todayAppointments.length / TODAY_PAGE_SIZE),
  );
  const totalCompletedPages = Math.max(
    1,
    Math.ceil(dashboard.completedAppointments.length / COMPLETED_PAGE_SIZE),
  );

  const todayPageSafe = Math.min(todayPage, totalTodayPages);
  const completedPageSafe = Math.min(completedPage, totalCompletedPages);

  useEffect(() => {
    setTodayPage(1);
  }, [dashboard.todayAppointments.length]);

  useEffect(() => {
    setCompletedPage(1);
  }, [dashboard.completedAppointments.length]);

  useEffect(() => {
    if (todayPageSafe !== todayPage) {
      setTodayPage(todayPageSafe);
    }
  }, [todayPageSafe, todayPage]);

  useEffect(() => {
    if (completedPageSafe !== completedPage) {
      setCompletedPage(completedPageSafe);
    }
  }, [completedPageSafe, completedPage]);

  const todayPageItems = useMemo(() => {
    const start = (todayPageSafe - 1) * TODAY_PAGE_SIZE;
    return [...dashboard.todayAppointments]
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(start, start + TODAY_PAGE_SIZE);
  }, [dashboard.todayAppointments, todayPageSafe]);

  const completedPageItems = useMemo(() => {
    const start = (completedPageSafe - 1) * COMPLETED_PAGE_SIZE;
    return dashboard.completedAppointments.slice(
      start,
      start + COMPLETED_PAGE_SIZE,
    );
  }, [dashboard.completedAppointments, completedPageSafe]);

  function handleJoinCall(appointment: Appointment) {
    window.open(
      `/consultation/${appointment._id}?role=doctor`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <style>{`
        body { font-family: Inter, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: Manrope, sans-serif; }
      `}</style>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative rounded-3xl bg-primary p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                Today&apos;s overview
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back{doctor?.fullName ? `, Dr. ${doctor.fullName}` : ""}.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
                {currentDate || "Loading date..."}.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                    Specialization
                  </p>
                  <p className="mt-1 font-semibold">
                    {doctor?.specialization || "Not set"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                    Availability
                  </p>
                  <p className="mt-1 font-semibold">
                    {doctor?.acceptsNewPatients
                      ? "Accepting patients"
                      : "Closed"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-7 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                    Status
                  </p>
                  <p className="mt-1 font-semibold">
                    {loading ? "Loading..." : "Ready"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-2 pr-4">
                <div className="h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-white/20">
                  {doctorProfilePicture ? (
                    <img
                      src={doctorProfilePicture}
                      alt={doctor?.fullName || "Doctor profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/10 font-bold">
                      {doctorInitials}
                    </div>
                  )}
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">
                    Dr. {doctor?.fullName}
                  </p>
                  <p className="text-xs text-white/70">
                    {doctor?.specialization}
                  </p>
                </div>
              </div>

              <Link
                href="/doctor/notifications"
                className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
                aria-label="Open notifications"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#008081] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-6 flex items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading dashboard...</span>
            </div>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Could not load dashboard</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              {stats.map((item) => (
                <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                />
              ))}
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                        Today&apos;s appointments
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Simple view of what needs attention today.
                      </p>
                    </div>
                  </div>

                  {dashboard.todayAppointments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                      <Clock3 className="mx-auto h-10 w-10 text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                        No appointments today
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Your schedule is clear for today.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {todayPageItems.map((appointment) => {
                          const patientName = getPatientName(appointment.patient);
                          const isAccepted = appointment.status === "accepted";
                          const isVideo = appointment.consultationType === "video";
                          const canJoin =
                            isAccepted &&
                            isVideo &&
                            Boolean(appointment.consultationSessionLink);

                          return (
                            <div
                              key={appointment._id}
                              className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                  {getInitials(patientName)}
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                      {patientName}
                                    </h3>

                                    <StatusChip
                                      label={
                                        appointment.consultationType === "video"
                                          ? "Video"
                                          : "In person"
                                      }
                                      className="bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
                                    />

                                    <StatusChip
                                      label={appointment.status}
                                      className={statusClass(appointment.status)}
                                    />
                                  </div>

                                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {formatTime(appointment.startTime)}–
                                    {formatTime(appointment.endTime)}
                                    {" • "}
                                    {appointment.reasonForVisit?.trim() ||
                                      "No reason provided"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {canJoin ? (
                                  <button
                                    type="button"
                                    onClick={() => handleJoinCall(appointment)}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                                  >
                                    <Video className="h-4 w-4" />
                                    Join Video Call
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {dashboard.todayAppointments.length > TODAY_PAGE_SIZE && (
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setTodayPage((p) => Math.max(1, p - 1))}
                            disabled={todayPageSafe === 1}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                          </button>

                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Page {todayPageSafe} of {totalTodayPages}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setTodayPage((p) => Math.min(totalTodayPages, p + 1))
                            }
                            disabled={todayPageSafe === totalTodayPages}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                        Completed bookings
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Finished appointments marked as completed.
                      </p>
                    </div>
                  </div>

                  {dashboard.completedAppointments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                        No completed bookings yet
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Completed visits will appear here automatically.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {completedPageItems.map((appointment) => {
                          const patientName = getPatientName(appointment.patient);

                          return (
                            <div
                              key={appointment._id}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/30"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                      {patientName}
                                    </h3>

                                    <StatusChip
                                      label="Completed"
                                      className={statusClass("completed")}
                                    />
                                  </div>

                                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {formatDateShort(appointment.appointmentDate)}{" "}
                                    • {formatTime(appointment.startTime)}–
                                    {formatTime(appointment.endTime)}
                                  </p>

                                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    {appointment.reasonForVisit?.trim() ||
                                      "No reason provided."}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  {appointment.prescription &&
                                  typeof appointment.prescription !== "string" ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                                      <FileText className="h-3.5 w-3.5" />
                                      Prescription saved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                      <FileText className="h-3.5 w-3.5" />
                                      No prescription
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {dashboard.completedAppointments.length > COMPLETED_PAGE_SIZE && (
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setCompletedPage((p) => Math.max(1, p - 1))
                            }
                            disabled={completedPageSafe === 1}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Prev
                          </button>

                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Page {completedPageSafe} of {totalCompletedPages}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setCompletedPage((p) =>
                                Math.min(totalCompletedPages, p + 1),
                              )
                            }
                            disabled={completedPageSafe === totalCompletedPages}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                        Recent prescription
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Latest completed case with real prescription details.
                      </p>
                    </div>
                  </div>

                  {dashboard.completedWithPrescription ? (
                    <div className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800">
                      {(() => {
                        const appointment = dashboard.completedWithPrescription;
                        const prescription = normalizePrescription(
                          appointment.prescription,
                        );
                        const patientName = getPatientName(appointment.patient);

                        return (
                          <div className="flex h-full flex-col">
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {prescriptionTitle(prescription)}
                                </p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  {patientName} •{" "}
                                  {formatDateShort(
                                    appointment.completedAt ||
                                      appointment.appointmentDate,
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3">
                              <PrescriptionField
                                label="Medication"
                                value={prescription?.medication || ""}
                              />
                              <PrescriptionField
                                label="Dosage"
                                value={prescription?.dosage || ""}
                              />
                              <PrescriptionField
                                label="Duration"
                                value={prescription?.duration || ""}
                              />
                              <PrescriptionField
                                label="Instructions"
                                value={prescription?.instructions || ""}
                              />
                              <PrescriptionField
                                label="Notes"
                                value={prescription?.notes || ""}
                              />
                            </div>

                            {prescriptionSubtitle(prescription) ? (
                              <div className="mt-5 rounded-2xl bg-secondary/10 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                                  Summary
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {prescriptionSubtitle(prescription)}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="min-h-[420px] rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                      <FileText className="mx-auto h-10 w-10 text-slate-400" />
                      <p className="mt-3 font-semibold text-slate-900 dark:text-white">
                        No recent prescription
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Once a completed visit has prescription details, it will
                        show here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}