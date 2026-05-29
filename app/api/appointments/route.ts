import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import { Appointment } from "@/models/appointment";
import { notifyBothAppointmentSides } from "@/config/notification-service";

export const runtime = "nodejs";

type AppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

type ConsultationType = "video" | "in_person";

function isYmd(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function addMinutesToTime(time: string, minutesToAdd: number) {
  const base = parseTimeToMinutes(time);
  if (base === null) return null;

  const total = (base + minutesToAdd) % 1440;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

function toObjectId(value: string) {
  return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

function dayStart(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function sameDate(dateA: string, dateB: string) {
  return dateA === dateB;
}

function isDateBlocked(
  date: string,
  unavailableSlots: Array<{ date: string }>,
  scheduleOverrides: Array<{
    date: string;
    action: "rescheduled" | "cancelled";
    newDate?: string | null;
  }>,
) {
  const blockedByUnavailable = unavailableSlots.some((slot) =>
    sameDate(slot.date, date),
  );

  const blockedByCancelledOverride = scheduleOverrides.some(
    (override) => override.date === date && override.action === "cancelled",
  );

  return blockedByUnavailable || blockedByCancelledOverride;
}

function getMatchingWorkingHour(
  doctor: {
    workingHours?: Array<{
      date: string;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>;
    scheduleOverrides?: Array<{
      date: string;
      action: "rescheduled" | "cancelled";
      newDate?: string | null;
      newStartTime?: string | null;
      newEndTime?: string | null;
    }>;
  },
  appointmentDate: string,
  startTime: string,
  endTime: string,
) {
  const baseMatch = (doctor.workingHours || []).find(
    (slot) =>
      slot.date === appointmentDate &&
      slot.startTime === startTime &&
      slot.endTime === endTime &&
      slot.isAvailable !== false,
  );

  const rescheduledMatch = (doctor.scheduleOverrides || []).find(
    (override) =>
      override.action === "rescheduled" &&
      override.newDate === appointmentDate &&
      override.newStartTime === startTime &&
      override.newEndTime === endTime,
  );

  return baseMatch || rescheduledMatch || null;
}

function appointmentStatusAllowed(value: unknown): value is AppointmentStatus {
  return (
    value === "pending" ||
    value === "accepted" ||
    value === "rejected" ||
    value === "completed" ||
    value === "cancelled"
  );
}

function consultationTypeAllowed(value: unknown): value is ConsultationType {
  return value === "video" || value === "in_person";
}

async function populateAppointment(appointmentId: Types.ObjectId | string) {
  return Appointment.findById(appointmentId)
    .populate("doctor", "fullName specialization profilePicture clinicAddress")
    .populate(
      "patient",
      "fullName email profilePicture phone birthday height weight basicMedicalHistory",
    )
    .lean();
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const appointmentId = url.searchParams.get("appointmentId");
    const doctorId = url.searchParams.get("doctorId");
    const patientId = url.searchParams.get("patientId");
    const status = url.searchParams.get("status");

    if (appointmentId) {
      if (!Types.ObjectId.isValid(appointmentId)) {
        return NextResponse.json(
          { success: false, message: "Invalid appointmentId" },
          { status: 400 },
        );
      }

      const appointment = await populateAppointment(appointmentId);

      if (!appointment) {
        return NextResponse.json(
          { success: false, message: "Appointment not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, appointment }, { status: 200 });
    }

    const filter: Record<string, unknown> = {};

    if (doctorId) {
      const objectId = toObjectId(doctorId);
      if (!objectId) {
        return NextResponse.json(
          { success: false, message: "Invalid doctorId" },
          { status: 400 },
        );
      }
      filter.doctor = objectId;
    }

    if (patientId) {
      const objectId = toObjectId(patientId);
      if (!objectId) {
        return NextResponse.json(
          { success: false, message: "Invalid patientId" },
          { status: 400 },
        );
      }
      filter.patient = objectId;
    }

    if (status) {
      if (!appointmentStatusAllowed(status)) {
        return NextResponse.json(
          { success: false, message: "Invalid status" },
          { status: 400 },
        );
      }
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1, startTime: 1 })
      .populate(
        "doctor",
        "fullName specialization profilePicture clinicAddress",
      )
      .populate(
        "patient",
        "fullName email profilePicture phone birthday height weight basicMedicalHistory",
      )
      .lean();

    return NextResponse.json({ success: true, appointments }, { status: 200 });
  } catch (error: unknown) {
    console.error("[GET /api/appointments] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const doctorId = String(body.doctorId || "");
    const patientId = String(body.patientId || "");
    const appointmentDate = String(body.appointmentDate || "");
    const startTime = String(body.startTime || "");
    const endTime = String(body.endTime || "");
    const consultationType = body.consultationType as ConsultationType;
    const reasonForVisit = String(body.reasonForVisit || "");

    if (
      !doctorId ||
      !patientId ||
      !appointmentDate ||
      !startTime ||
      !endTime ||
      !consultationType
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "doctorId, patientId, appointmentDate, startTime, endTime, and consultationType are required",
        },
        { status: 400 },
      );
    }

    if (!consultationTypeAllowed(consultationType)) {
      return NextResponse.json(
        { success: false, message: "Invalid consultationType" },
        { status: 400 },
      );
    }

    if (!isYmd(appointmentDate)) {
      return NextResponse.json(
        { success: false, message: "appointmentDate must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const doctorObjectId = toObjectId(doctorId);
    const patientObjectId = toObjectId(patientId);

    if (!doctorObjectId || !patientObjectId) {
      return NextResponse.json(
        { success: false, message: "Invalid doctorId or patientId" },
        { status: 400 },
      );
    }

    const doctor = await Doctor.findById(doctorObjectId);

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    if (
      isDateBlocked(
        appointmentDate,
        doctor.unavailableSlots || [],
        doctor.scheduleOverrides || [],
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Doctor is unavailable on this date" },
        { status: 409 },
      );
    }

    const matchedSlot = getMatchingWorkingHour(
      doctor,
      appointmentDate,
      startTime,
      endTime,
    );

    if (!matchedSlot) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected time is not within the doctor's working hours",
        },
        { status: 409 },
      );
    }

    const slotStart = parseTimeToMinutes(startTime);
    const slotEnd = parseTimeToMinutes(endTime);

    if (slotStart === null || slotEnd === null || slotEnd <= slotStart) {
      return NextResponse.json(
        { success: false, message: "Invalid appointment time range" },
        { status: 400 },
      );
    }

    const consultationDurationMinutes =
      doctor.consultationDurationMinutes || 60;
    const expectedEndTime = addMinutesToTime(
      startTime,
      consultationDurationMinutes,
    );

    if (expectedEndTime && expectedEndTime !== endTime) {
      return NextResponse.json(
        {
          success: false,
          message: `Appointment duration must be exactly ${consultationDurationMinutes} minutes`,
        },
        { status: 409 },
      );
    }

    const conflict = await Appointment.findOne({
      doctor: doctorObjectId,
      appointmentDate: dayStart(appointmentDate),
      status: { $nin: ["rejected", "cancelled"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).lean();

    if (conflict) {
      return NextResponse.json(
        { success: false, message: "This slot is already booked" },
        { status: 409 },
      );
    }

    const created = await Appointment.create({
      doctor: doctorObjectId,
      patient: patientObjectId,
      appointmentDate: dayStart(appointmentDate),
      startTime,
      endTime,
      status: "pending",
      consultationType,
      consultationSessionLink: "",
      reasonForVisit,
      rejectionReason: "",
      acceptedAt: null,
      rejectedAt: null,
      completedAt: null,
      cancelledAt: null,
      isSlotLocked: true,
      notes: "",
      prescription: null,
      medicalRecord: null,
      reminderSent: false,
      pushNotificationsSent: {
        booked: false,
        upcoming: false,
        scheduleUpdate: false,
      },
    });

    doctor.workingHours = (doctor.workingHours || []).map((slot) => {
      const matchesThisSlot =
        slot.date === appointmentDate &&
        slot.startTime === startTime &&
        slot.endTime === endTime;

      return matchesThisSlot
        ? { ...slot.toObject?.(), isAvailable: false }
        : slot;
    });

    await doctor.save();

    const populated = await populateAppointment(created._id);

    if (populated) {
      await notifyBothAppointmentSides({
        appointment: populated as any,
        type: "appointment_booked",
        patientTitle: "Appointment booked",
        patientMessage:
          "Your appointment request has been booked and is now pending approval.",
        doctorTitle: "New appointment request",
        doctorMessage: `You have a new appointment request from ${String(
          (populated as any)?.patient?.fullName || "a patient",
        )}.`,
        metadata: {
          status: "pending",
          consultationType,
          appointmentDate,
          startTime,
          endTime,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment created successfully",
        appointment: populated,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("[POST /api/appointments] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const appointmentId = String(body.appointmentId || "");
    const action = String(body.action || "");
    const rejectionReason = String(body.rejectionReason || "");
    const notes = String(body.notes || "");
    const consultationSessionLink = String(body.consultationSessionLink || "");

    const newAppointmentDate = String(body.newAppointmentDate || "");
    const newStartTime = String(body.newStartTime || "");
    const newEndTime = String(body.newEndTime || "");
    const cancellationReason = String(body.cancellationReason || "");
    const rescheduleReason = String(body.rescheduleReason || "");

    if (!appointmentId || !action) {
      return NextResponse.json(
        { success: false, message: "appointmentId and action are required" },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { success: false, message: "Invalid appointmentId" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    const oldAppointmentDate = new Date(appointment.appointmentDate)
      .toISOString()
      .slice(0, 10);

    const unlockOldSlot = () => {
      doctor.workingHours = (doctor.workingHours || []).map((slot) => {
        const matchesThisSlot =
          slot.date === oldAppointmentDate &&
          slot.startTime === appointment.startTime &&
          slot.endTime === appointment.endTime;

        return matchesThisSlot
          ? { ...slot.toObject?.(), isAvailable: true }
          : slot;
      });
    };

    const lockOldSlot = () => {
      doctor.workingHours = (doctor.workingHours || []).map((slot) => {
        const matchesThisSlot =
          slot.date === oldAppointmentDate &&
          slot.startTime === appointment.startTime &&
          slot.endTime === appointment.endTime;

        return matchesThisSlot
          ? { ...slot.toObject?.(), isAvailable: false }
          : slot;
      });
    };

    if (notes) appointment.notes = notes;

    if (action === "cancel") {
      appointment.status = "cancelled";
      appointment.cancelledAt = new Date();
      appointment.cancellationReason =
        cancellationReason || "Cancelled by patient";
      appointment.rescheduleReason = "";
      appointment.acceptedAt = null;
      appointment.completedAt = null;
      appointment.rejectedAt = null;

      unlockOldSlot();

      await appointment.save();
      await doctor.save();

      const populated = await populateAppointment(appointment._id);

      if (populated) {
        await notifyBothAppointmentSides({
          appointment: populated as any,
          type: "appointment_cancelled",
          patientTitle: "Appointment cancelled",
          patientMessage:
            cancellationReason || "Your appointment has been cancelled.",
          doctorTitle: "Appointment cancelled",
          doctorMessage: "The appointment was cancelled.",
          metadata: {
            status: "cancelled",
            cancellationReason,
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Appointment cancelled successfully",
          appointment: populated,
        },
        { status: 200 },
      );
    }

    if (action === "reschedule") {
      if (
        !newAppointmentDate ||
        !newStartTime ||
        !newEndTime ||
        !isYmd(newAppointmentDate)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "newAppointmentDate, newStartTime, and newEndTime are required for reschedule",
          },
          { status: 400 },
        );
      }

      const slotStart = parseTimeToMinutes(newStartTime);
      const slotEnd = parseTimeToMinutes(newEndTime);

      if (slotStart === null || slotEnd === null || slotEnd <= slotStart) {
        return NextResponse.json(
          { success: false, message: "Invalid reschedule time range" },
          { status: 400 },
        );
      }

      const consultationDurationMinutes =
        doctor.consultationDurationMinutes || 60;
      const expectedEndTime = addMinutesToTime(
        newStartTime,
        consultationDurationMinutes,
      );

      if (expectedEndTime && expectedEndTime !== newEndTime) {
        return NextResponse.json(
          {
            success: false,
            message: `Appointment duration must be exactly ${consultationDurationMinutes} minutes`,
          },
          { status: 409 },
        );
      }

      if (
        isDateBlocked(
          newAppointmentDate,
          doctor.unavailableSlots || [],
          doctor.scheduleOverrides || [],
        )
      ) {
        return NextResponse.json(
          { success: false, message: "Doctor is unavailable on that date" },
          { status: 409 },
        );
      }

      const matchedSlot = getMatchingWorkingHour(
        doctor,
        newAppointmentDate,
        newStartTime,
        newEndTime,
      );

      if (!matchedSlot) {
        return NextResponse.json(
          {
            success: false,
            message: "Selected time is not within the doctor's working hours",
          },
          { status: 409 },
        );
      }

      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor,
        appointmentDate: dayStart(newAppointmentDate),
        status: { $nin: ["rejected", "cancelled"] },
        startTime: { $lt: newEndTime },
        endTime: { $gt: newStartTime },
      }).lean();

      if (conflict) {
        return NextResponse.json(
          { success: false, message: "This slot is already booked" },
          { status: 409 },
        );
      }

      unlockOldSlot();

      appointment.appointmentDate = dayStart(newAppointmentDate);
      appointment.startTime = newStartTime;
      appointment.endTime = newEndTime;
      appointment.status = "pending";
      appointment.acceptedAt = null;
      appointment.completedAt = null;
      appointment.rejectedAt = null;
      appointment.cancelledAt = null;
      appointment.consultationSessionLink = consultationSessionLink || "";
      appointment.rescheduleReason =
        rescheduleReason || "Rescheduled by patient";
      appointment.cancellationReason = "";

      lockOldSlot();

      doctor.workingHours = (doctor.workingHours || []).map((slot) => {
        const matchesNewSlot =
          slot.date === newAppointmentDate &&
          slot.startTime === newStartTime &&
          slot.endTime === newEndTime;

        return matchesNewSlot
          ? { ...slot.toObject?.(), isAvailable: false }
          : slot;
      });

      await appointment.save();
      await doctor.save();

      const populated = await populateAppointment(appointment._id);

      if (populated) {
        await notifyBothAppointmentSides({
          appointment: populated as any,
          type: "appointment_rescheduled",
          patientTitle: "Appointment rescheduled",
          patientMessage: "Your appointment schedule has been updated.",
          doctorTitle: "Appointment rescheduled",
          doctorMessage: "The appointment has been rescheduled.",
          metadata: {
            status: "pending",
            newAppointmentDate,
            newStartTime,
            newEndTime,
            rescheduleReason,
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Appointment rescheduled successfully",
          appointment: populated,
        },
        { status: 200 },
      );
    }

    if (action === "accept") {
      appointment.status = "accepted";
      appointment.acceptedAt = new Date();
      appointment.rejectedAt = null;
      appointment.cancelledAt = null;

      if (consultationSessionLink) {
        appointment.consultationSessionLink = consultationSessionLink;
      }

      lockOldSlot();

      await appointment.save();
      await doctor.save();

      const populated = await populateAppointment(appointment._id);

      if (populated) {
        await notifyBothAppointmentSides({
          appointment: populated as any,
          type: "appointment_accepted",
          patientTitle: "Appointment accepted",
          patientMessage: "Your appointment has been accepted by the doctor.",
          doctorTitle: "Appointment accepted",
          doctorMessage: "You accepted the appointment successfully.",
          metadata: {
            status: "accepted",
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Appointment accepted successfully",
          appointment: populated,
        },
        { status: 200 },
      );
    }

    if (action === "reject") {
      appointment.status = "rejected";
      appointment.rejectedAt = new Date();
      appointment.rejectionReason = rejectionReason || "Rejected by doctor";
      appointment.acceptedAt = null;
      appointment.completedAt = null;

      unlockOldSlot();

      await appointment.save();
      await doctor.save();

      const populated = await populateAppointment(appointment._id);

      if (populated) {
        await notifyBothAppointmentSides({
          appointment: populated as any,
          type: "appointment_rejected",
          patientTitle: "Appointment rejected",
          patientMessage:
            rejectionReason || "Your appointment was rejected by the doctor.",
          doctorTitle: "Appointment rejected",
          doctorMessage: "You rejected the appointment successfully.",
          metadata: {
            status: "rejected",
            rejectionReason,
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Appointment rejected successfully",
          appointment: populated,
        },
        { status: 200 },
      );
    }

    if (action === "complete") {
      appointment.status = "completed";
      appointment.completedAt = new Date();
      lockOldSlot();

      await appointment.save();
      await doctor.save();

      const populated = await populateAppointment(appointment._id);

      if (populated) {
        await notifyBothAppointmentSides({
          appointment: populated as any,
          type: "appointment_completed",
          patientTitle: "Appointment completed",
          patientMessage: "Your appointment has been marked as completed.",
          doctorTitle: "Appointment completed",
          doctorMessage: "You marked the appointment as completed.",
          metadata: {
            status: "completed",
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: "Appointment completed successfully",
          appointment: populated,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("[PATCH /api/appointments] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
