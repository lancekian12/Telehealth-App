// app/api/appointments/[id]/accept/route.ts
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/config/mongodb";
import { Appointment } from "@/models/appointment";
import { Doctor } from "@/models/doctor";
import {
  buildConsultationLink,
  buildConsultationSessionId,
} from "@/config/consultation";
import { notifyBothAppointmentSides } from "@/config/notification-service";

export const runtime = "nodejs";

type WorkingHourSlot = {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
  toObject?: () => WorkingHourSlot;
};

async function populateAppointment(appointmentId: Types.ObjectId | string) {
  return Appointment.findById(appointmentId)
    .populate(
      "doctor",
      "fullName specialization profilePicture clinicAddress licenseNumber",
    )
    .populate(
      "patient",
      "fullName email profilePicture phone birthday height weight basicMedicalHistory",
    )
    .lean();
}

function dayString(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    console.log("[PATCH /api/appointments/[id]/accept] request received");

    await connectDB();

    const { id } = await context.params;

    console.log("[PATCH /api/appointments/[id]/accept] appointment id:", id);

    if (!Types.ObjectId.isValid(id)) {
      console.log(
        "[PATCH /api/appointments/[id]/accept] invalid appointment id:",
        id,
      );
      return NextResponse.json(
        { success: false, message: "Invalid appointment id" },
        { status: 400 },
      );
    }

    await req.json().catch(() => ({}));

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      console.log(
        "[PATCH /api/appointments/[id]/accept] appointment not found:",
        id,
      );
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (!doctor) {
      console.log("[PATCH /api/appointments/[id]/accept] doctor not found");
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    appointment.status = "accepted";
    appointment.acceptedAt = new Date();
    appointment.rejectedAt = null;
    appointment.cancelledAt = null;

    if (appointment.consultationType === "video") {
      const appointmentId = String(appointment._id);
      appointment.consultationSessionId =
        buildConsultationSessionId(appointmentId);
      appointment.consultationSessionLink =
        buildConsultationLink(appointmentId);
    } else {
      appointment.consultationSessionId = "";
      appointment.consultationSessionLink = "";
    }

    const workingHours = (doctor.workingHours || []) as WorkingHourSlot[];

    doctor.workingHours = workingHours.map((slot: WorkingHourSlot) => {
      const currentSlot = slot.toObject?.() ?? slot;

      const matchesThisSlot =
        currentSlot.date === dayString(appointment.appointmentDate) &&
        currentSlot.startTime === appointment.startTime &&
        currentSlot.endTime === appointment.endTime;

      return matchesThisSlot
        ? { ...currentSlot, isAvailable: false }
        : currentSlot;
    });

    await appointment.save();
    await doctor.save();

    const populated = await populateAppointment(appointment._id);

    try {
      if (populated) {
        await notifyBothAppointmentSides({
          appointment: populated as never,
          type: "appointment_accepted",
          patientTitle: "Appointment accepted",
          patientMessage: "Your appointment has been accepted by the doctor.",
          doctorTitle: "Appointment accepted",
          doctorMessage: "You accepted the appointment successfully.",
          metadata: {
            status: "accepted",
            consultationSessionId: appointment.consultationSessionId,
            consultationSessionLink: appointment.consultationSessionLink,
            consultationType: appointment.consultationType,
          },
        });
      }
    } catch (notifyError) {
      console.error(
        "[PATCH /api/appointments/[id]/accept] notification failed:",
        notifyError,
      );
    }

    try {
      console.log(
        "[PATCH /api/appointments/[id]/accept] sending email for appointment:",
        String(appointment._id),
      );

      const emailResponse = await fetch(
        new URL("/api/send-email", req.url).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId: String(appointment._id),
          }),
        },
      );

      const emailResult = await emailResponse.json().catch(() => null);

      console.log("[PATCH /api/appointments/[id]/accept] send-email response:", {
        ok: emailResponse.ok,
        status: emailResponse.status,
        result: emailResult,
      });
    } catch (emailError) {
      console.error(
        "[PATCH /api/appointments/[id]/accept] send-email failed:",
        emailError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Appointment accepted successfully",
        appointment: populated,
        consultationSessionId: appointment.consultationSessionId,
        consultationSessionLink: appointment.consultationSessionLink,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[PATCH /api/appointments/[id]/accept] error:", error);
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