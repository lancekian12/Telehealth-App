import { Appointment } from "@/models/appointment";
import { isPastUnattended, UNATTENDED_REASONS } from "@/config/appointmentStatus";

/**
 * Lazily flips pending/accepted appointments whose end time has already
 * passed to "unattended", so every reader (patient, doctor, admin) sees the
 * same status without needing a background job.
 */
export async function markPastAppointmentsUnattended() {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const candidates = await Appointment.find({
    status: { $in: ["pending", "accepted"] },
    appointmentDate: { $lte: tomorrow },
  })
    .select("status appointmentDate startTime endTime")
    .lean<
      {
        _id: unknown;
        status: string;
        appointmentDate: Date;
        startTime: string;
        endTime: string;
      }[]
    >();

  const now = new Date();
  const expired = candidates.filter((appt) => isPastUnattended(appt, now));

  for (const from of ["pending", "accepted"] as const) {
    const ids = expired.filter((a) => a.status === from).map((a) => a._id);
    if (ids.length === 0) continue;

    await Appointment.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status: "unattended",
          unattendedAt: now,
          unattendedFrom: from,
          unattendedReason: UNATTENDED_REASONS[from],
        },
      },
    );
  }
}

