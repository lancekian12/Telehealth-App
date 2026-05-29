"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  MessageSquareText,
  MoreHorizontal,
  Stethoscope,
  Video,
  XCircle,
} from "lucide-react";

import { useSearchParams } from "next/navigation";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";
import RejectAppointmentModal from "@/components/appointments/RejectAppointmentModal";

type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type ConsultationType = "video" | "in_person";

type PopulatedPerson = {
  _id?: string;
  fullName?: string;
  email?: string;
  profilePicture?: string;
  phone?: string;
  birthday?: string;
  height?: string;
  weight?: string;
  basicMedicalHistory?: string;
};

type PopulatedDoctor = PopulatedPerson & {
  specialization?: string;
  clinicAddress?: string;
};

type Appointment = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  consultationSessionLink?: string;
  reasonForVisit?: string;
  rejectionReason?: string;
  rescheduleReason?: string;
  cancellationReason?: string;
  notes?: string;
  doctor?: PopulatedDoctor | string;
  patient?: PopulatedPerson | string;
};

type ApiResponse =
  | { success: true; appointments: Appointment[] }
  | { success: false; message?: string };

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

function getPersonName(
  person: Appointment["patient"] | Appointment["doctor"] | undefined,
  fallback: string,
) {
  if (!person || typeof person === "string") return fallback;
  return person.fullName || fallback;
}

function getDoctorSubtitle(doctor: Appointment["doctor"]) {
  if (!doctor || typeof doctor === "string") return "";
  return doctor.specialization || doctor.clinicAddress || "";
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles = {
    pending: {
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Pending",
    },
    accepted: {
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Accepted",
    },
    rejected: {
      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: "Rejected",
    },
    cancelled: {
      className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: "Cancelled",
    },
    completed: {
      className:
        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Completed",
    },
  };

  const current = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.icon}
      {current.label}
    </span>
  );
}

function TypeIcon({ type }: { type: ConsultationType }) {
  return type === "video" ? (
    <Video className="h-4 w-4 text-primary" />
  ) : (
    <Stethoscope className="h-4 w-4 text-primary" />
  );
}

function AppointmentCard({
  appointment,
  onAccept,
  onReject,
  onJoin,
  onShowDetails,
  loadingId,
}: {
  appointment: Appointment;
  onAccept: (appointmentId: string) => void;
  onReject: (appointment: Appointment) => void;
  onJoin: (link?: string) => void;
  onShowDetails: (appointment: Appointment) => void;
  loadingId: string | null;
}) {
  const completed = appointment.status === "completed";
  const patientName = getPersonName(appointment.patient, "Unknown Patient");
  const doctorSubtitle = getDoctorSubtitle(appointment.doctor);
  const isPending = appointment.status === "pending";
  const isAccepted = appointment.status === "accepted";
  const isVideo = appointment.consultationType === "video";
  const isLoading = loadingId === appointment._id;

  const avatarUrl =
    appointment.patient && typeof appointment.patient !== "string"
      ? appointment.patient.profilePicture || ""
      : "";

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-800",
        completed
          ? "border-slate-100 opacity-85 dark:border-slate-700"
          : "border-slate-100 hover:border-primary/20 dark:border-slate-700",
      ].join(" ")}
    >
      <div
        className={[
          "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-all duration-500",
          appointment.status === "pending" && "bg-amber-400",
          appointment.status === "accepted" && "bg-emerald-500",
          appointment.status === "rejected" && "bg-rose-500",
          appointment.status === "cancelled" && "bg-slate-500",
          appointment.status === "completed" && "bg-slate-300",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      <div className="flex flex-col gap-6 pl-3 md:flex-row md:items-start md:gap-8">
        <div className="flex items-center justify-between gap-4 md:w-36 md:flex-col md:items-start">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {formatDate(appointment.appointmentDate)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {formatTimeRange(appointment.startTime, appointment.endTime)}
            </p>
          </div>

          <StatusBadge status={appointment.status} />
        </div>

        <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-start">
          <img
            src={avatarUrl || "/placeholder-avatar.png"}
            alt={patientName}
            className={[
              "h-16 w-16 rounded-full object-cover shadow-sm ring-4",
              completed
                ? "grayscale ring-slate-100 dark:ring-slate-700"
                : "ring-white dark:ring-slate-700",
            ].join(" ")}
          />

          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {patientName}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <TypeIcon type={appointment.consultationType} />
                  <span>
                    {appointment.consultationType === "video"
                      ? "Online Consultation"
                      : "In-Clinic"}
                  </span>
                  {doctorSubtitle && (
                    <span className="text-slate-400">• {doctorSubtitle}</span>
                  )}
                </div>
              </div>

              <button className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              {appointment.reasonForVisit || "No reason provided."}
            </p>

            {appointment.status === "pending" &&
              appointment.rescheduleReason && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                    <CalendarDays className="h-4 w-4" />
                    Reschedule request
                  </div>
                  <p className="text-sm leading-7 text-amber-800 dark:text-amber-200">
                    {appointment.rescheduleReason}
                  </p>
                </div>
              )}

            {appointment.rejectionReason &&
              appointment.status === "rejected" && (
                <div className="mt-4 rounded-2xl bg-rose-50 p-4 dark:bg-rose-950/20">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-300">
                    <XCircle className="h-4 w-4" />
                    Rejection reason
                  </div>
                  <p className="text-sm leading-7 text-rose-700 dark:text-rose-300">
                    {appointment.rejectionReason}
                  </p>
                </div>
              )}

            {appointment.cancellationReason &&
              appointment.status === "cancelled" && (
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    <XCircle className="h-4 w-4" />
                    Cancellation reason
                  </div>
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {appointment.cancellationReason}
                  </p>
                </div>
              )}

            {appointment.notes && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <FileText className="h-4 w-4 text-primary" />
                  Doctor Note
                </div>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {appointment.notes}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {isPending && (
                <>
                  <button
                    onClick={() => onAccept(appointment._id)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Accept
                  </button>

                  <button
                    onClick={() => onReject(appointment)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </>
              )}

              {isAccepted && isVideo && appointment.consultationSessionLink && (
                <button
                  onClick={() => onJoin(appointment.consultationSessionLink)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 hover:shadow-xl"
                >
                  <Video className="h-4 w-4" />
                  Join Call
                </button>
              )}

              <button
                onClick={() => onShowDetails(appointment)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <MessageSquareText className="h-4 w-4" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ScheduleClient() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId") || "";
  const patientId = searchParams.get("patientId") || "";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [selectedRejectAppointment, setSelectedRejectAppointment] =
    useState<Appointment | null>(null);

  async function loadAppointments() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (doctorId) params.set("doctorId", doctorId);
      if (patientId) params.set("patientId", patientId);

      const res = await fetch(
        `/api/appointments${params.toString() ? `?${params.toString()}` : ""}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = (await res.json()) as ApiResponse;

      if (!res.ok || !data.success) {
        throw new Error(
          data.success
            ? "Failed to load appointments"
            : data.message || "Failed to load appointments",
        );
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAppointments() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (doctorId) params.set("doctorId", doctorId);
        if (patientId) params.set("patientId", patientId);

        const res = await fetch(
          `/api/appointments${params.toString() ? `?${params.toString()}` : ""}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = (await res.json()) as ApiResponse;

        if (!res.ok || !data.success) {
          throw new Error(
            data.success
              ? "Failed to load appointments"
              : data.message || "Failed to load appointments",
          );
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Failed to load appointments",
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchAppointments();

    return () => controller.abort();
  }, [doctorId, patientId]);

  const filteredAppointments = useMemo(() => {
    const selectedDateString = selectedDate.toDateString();

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        return appointmentDate.toDateString() === selectedDateString;
      })
      .sort((a, b) => {
        const aDate = new Date(a.appointmentDate).getTime();
        const bDate = new Date(b.appointmentDate).getTime();

        if (aDate !== bDate) return aDate - bDate;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [appointments, selectedDate]);

  async function patchAppointment(
    appointmentId: string,
    action: "accept" | "reject",
    rejectionReason?: string,
  ) {
    try {
      setActionLoadingId(appointmentId);

      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          action,
          rejectionReason: rejectionReason || "Rejected by doctor",
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        appointment?: Appointment;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to update appointment");
      }

      setAppointments((current) =>
        current.map((item) =>
          item._id === appointmentId ? { ...item, ...data.appointment } : item,
        ),
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to update appointment",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleAccept(appointmentId: string) {
    void patchAppointment(appointmentId, "accept");
  }

  function handleReject(appointment: Appointment) {
    setSelectedRejectAppointment(appointment);
    setRejectOpen(true);
  }

  async function handleConfirmReject(reason: string) {
    if (!selectedRejectAppointment) return;

    try {
      setRejectLoading(true);

      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedRejectAppointment._id,
          action: "reject",
          rejectionReason: reason,
        }),
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        appointment?: Appointment;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to reject appointment");
      }

      setAppointments((current) =>
        current.map((item) =>
          item._id === selectedRejectAppointment._id
            ? {
                ...item,
                ...(data.appointment || {}),
                status: "rejected",
                rejectionReason: reason,
              }
            : item,
        ),
      );

      setRejectOpen(false);
      setSelectedRejectAppointment(null);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to reject appointment",
      );
    } finally {
      setRejectLoading(false);
    }
  }

  function handleJoin(link?: string) {
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-background-light text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <style>{`
        body { font-family: Inter, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: Manrope, sans-serif; }
      `}</style>

      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-24">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Today&apos;s Roster
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Clinical Appointments
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Pending appointments can be accepted or rejected again, including
              rescheduled requests.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-slate-100 p-2 dark:bg-slate-800/70">
            <button
              onClick={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                setSelectedDate(prev);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-primary dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-primary shadow-sm dark:bg-slate-900 dark:text-slate-200">
              <CalendarDays className="h-4 w-4" />
              {selectedDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <button
              onClick={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                setSelectedDate(next);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-primary dark:hover:bg-slate-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading appointments...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              No appointments found.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Once a patient books a visit, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onAccept={handleAccept}
                onReject={handleReject}
                onJoin={handleJoin}
                onShowDetails={setSelectedAppointment}
                loadingId={actionLoadingId}
              />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => void loadAppointments()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 font-bold text-primary shadow-sm transition hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Refresh Schedule
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      <RejectAppointmentModal
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setSelectedRejectAppointment(null);
        }}
        onConfirm={handleConfirmReject}
        loading={rejectLoading}
        appointmentTitle={
          selectedRejectAppointment
            ? getPersonName(selectedRejectAppointment.patient, "this appointment")
            : "this appointment"
        }
        defaultReason={selectedRejectAppointment?.rejectionReason || ""}
      />
    </main>
  );
}