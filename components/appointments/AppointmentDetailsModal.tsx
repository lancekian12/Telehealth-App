"use client";

import {
  CalendarDays,
  Cake,
  Clock3,
  FileText,
  Mail,
  Phone,
  Stethoscope,
  User2,
  Weight,
  Ruler,
  Video,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type ConsultationType = "video" | "in_person";

type PopulatedPerson = {
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

export type Appointment = {
  _id: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  consultationSessionLink?: string;
  reasonForVisit?: string;
  rejectionReason?: string;
  notes?: string;
  doctor?: PopulatedDoctor | string;
  patient?: PopulatedPerson | string;
};

function formatDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatBirthday(dateValue?: string) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function calculateAge(dateValue?: string) {
  if (!dateValue) return "—";
  const birth = new Date(dateValue);
  if (Number.isNaN(birth.getTime())) return "—";

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return String(age);
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

function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Accepted
      </span>
    );
  }

  if (status === "rejected" || status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <XCircle className="h-3.5 w-3.5" />
        {getStatusLabel(status)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
      Pending
    </span>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function AppointmentDetailsModal({
  appointment,
  onClose,
}: {
  appointment: Appointment | null;
  onClose: () => void;
}) {
  if (!appointment) return null;

  const patient =
    appointment.patient && typeof appointment.patient !== "string"
      ? appointment.patient
      : undefined;

  const initials = (patient?.fullName || "Patient")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.28)] dark:bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-secondary/80 opacity-95" />
          <div className="relative flex items-start justify-between gap-4 px-6 py-5 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                {patient?.profilePicture ? (
                  <img
                    src={patient.profilePicture}
                    alt={patient.fullName || "Patient"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-extrabold">{initials}</span>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/75">
                  Appointment Details
                </p>
                <h3 className="mt-1 text-2xl font-extrabold tracking-tight">
                  {getPersonName(appointment.patient, "Unknown Patient")}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(appointment.appointmentDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatTimeRange(appointment.startTime, appointment.endTime)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <InfoTile
              icon={<FileText className="h-4 w-4 text-primary" />}
              label="Status"
              value={getStatusLabel(appointment.status)}
            />
            <InfoTile
              icon={<Video className="h-4 w-4 text-primary" />}
              label="Type"
              value={
                appointment.consultationType === "video"
                  ? "Video consultation"
                  : "In-clinic consultation"
              }
            />
            <InfoTile
              icon={<Stethoscope className="h-4 w-4 text-primary" />}
              label="Doctor"
              value={getDoctorSubtitle(appointment.doctor) || "General"}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                <FileText className="h-4 w-4 text-primary" />
                Reason for Visit
              </div>
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                {appointment.reasonForVisit || "No reason provided."}
              </p>

              {appointment.notes && (
                <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/50">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    <FileText className="h-4 w-4 text-primary" />
                    Doctor Note
                  </div>
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                <FileText className="h-4 w-4 text-primary" />
                Patient Profile
              </div>

              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {patient?.email || "—"}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {patient?.phone || "—"}
                </p>
                <p className="flex items-center gap-2">
                  <Cake className="h-4 w-4 text-primary" />
                  {formatBirthday(patient?.birthday)}
                </p>
                <p className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-primary" />
                  Age: {calculateAge(patient?.birthday)}
                </p>
                <p className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  Height: {patient?.height ? `${patient.height} cm` : "—"}
                </p>
                <p className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-primary" />
                  Weight: {patient?.weight ? `${patient.weight} kg` : "—"}
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950/50">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  <FileText className="h-4 w-4 text-primary" />
                  Medical History
                </div>
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {patient?.basicMedicalHistory || "No medical history provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}