import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { Resend } from "resend";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import { Patient } from "@/models/patient";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatDate(dateValue: Date | string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    console.log("[POST /api/send-email] request received");

    await connectDB();

    const body = await req.json();
    const appointmentId = String(body.appointmentId || "").trim();

    if (!appointmentId) {
      console.log("[POST /api/send-email] missing appointmentId");
      return NextResponse.json(
        { success: false, message: "appointmentId is required" },
        { status: 400 },
      );
    }

    if (!Types.ObjectId.isValid(appointmentId)) {
      console.log("[POST /api/send-email] invalid appointmentId:", appointmentId);
      return NextResponse.json(
        { success: false, message: "Invalid appointmentId" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findById(appointmentId).lean();

    if (!appointment) {
      console.log("[POST /api/send-email] appointment not found:", appointmentId);
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    console.log("[POST /api/send-email] appointment found:", String(appointment._id));

    const doctor = await Doctor.findById(appointment.doctor).lean();
    const patient = await Patient.findById(appointment.patient).lean();

    console.log("[POST /api/send-email] doctor email:", doctor?.email || "missing");
    console.log("[POST /api/send-email] patient email:", patient?.email || "missing");

    if (!doctor?.email || !patient?.email) {
      console.log("[POST /api/send-email] missing doctor or patient email");
      return NextResponse.json(
        {
          success: false,
          message: "Doctor or patient email not found",
        },
        { status: 404 },
      );
    }

    const appointmentDate = formatDate(appointment.appointmentDate);
    const startTime = String(appointment.startTime || "");
    const endTime = String(appointment.endTime || "");

    const subject = "Appointment accepted";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Appointment Accepted</h2>
        <p>Your appointment has been accepted.</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      </div>
    `;

    const [patientEmailResult, doctorEmailResult] = await Promise.all([
      resend.emails.send({
        from: "AppointCare <noreply@yourdomain.com>",
        to: patient.email,
        subject,
        html,
      }),
      resend.emails.send({
        from: "AppointCare <noreply@yourdomain.com>",
        to: doctor.email,
        subject,
        html,
      }),
    ]);

    console.log("[POST /api/send-email] email sent successfully", {
      patientEmailResult,
      doctorEmailResult,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Email sent to doctor and patient",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[POST /api/send-email] error:", error);
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