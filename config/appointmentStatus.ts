// Pure helpers (no server imports) shared by API routes and client components.

export type DisplayStatus =
  | "pending"
  | "accepted"
  | "ongoing"
  | "completed"
  | "unattended"
  | "cancelled"
  | "rejected";

type AppointmentLike = {
  status: string;
  appointmentDate: string | Date;
  startTime?: string;
  endTime?: string;
  prescription?: unknown;
};

// The app serves the Philippines, so appointment times are wall-clock UTC+8.
const PH_OFFSET = "+08:00";

export function getDateKey(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function getAppointmentWindow(appt: {
  appointmentDate: string | Date;
  startTime?: string;
  endTime?: string;
}) {
  const key = getDateKey(appt.appointmentDate);
  const start = new Date(`${key}T${appt.startTime || "00:00"}:00${PH_OFFSET}`);
  const end = new Date(`${key}T${appt.endTime || "23:59"}:00${PH_OFFSET}`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

/** Pending/accepted appointments whose end time has passed were never attended. */
export function isPastUnattended(appt: AppointmentLike, now = new Date()) {
  if (appt.status !== "pending" && appt.status !== "accepted") return false;
  const window = getAppointmentWindow(appt);
  return !!window && now >= window.end;
}

export function resolveDisplayStatus(
  appt: AppointmentLike,
  now = new Date(),
): DisplayStatus {
  if (isPastUnattended(appt, now)) return "unattended";

  if (appt.status === "accepted") {
    const window = getAppointmentWindow(appt);
    if (window && now >= window.start && now < window.end) return "ongoing";
    return "accepted";
  }

  return appt.status as DisplayStatus;
}

export function hasPrescription(appt: { prescription?: unknown }) {
  return !!appt.prescription;
}

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  ongoing: "Ongoing",
  completed: "Completed",
  unattended: "Unattended",
  cancelled: "Cancelled",
  rejected: "Rejected",
};
