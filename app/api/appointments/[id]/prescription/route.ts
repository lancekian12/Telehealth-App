import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { Appointment } from "@/models/appointment";
import { Prescription } from "@/models/prescription";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    id: string;
  };
};

type PrescriptionBody = {
  diagnosis?: string;
  medication?: string;
  dosage?: string;
  duration?: string;
  instructions?: string;
  notes?: string;
  prescription?: PrescriptionBody;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeBody(body: PrescriptionBody): PrescriptionBody {
  return body.prescription ?? body;
}

export async function GET(req: Request, { params }: RouteContext) {
  try {
    console.log("[GET /api/appointments/[id]/prescription] hit");
    console.log("[GET prescription] params:", params);
    console.log("[GET prescription] url:", req.url);

    await connectDB();

    const { id } = params;

    console.log("[GET prescription] appointment id:", id);

    if (!id) {
      console.log("[GET prescription] missing appointment id");
      return NextResponse.json(
        { success: false, message: "Missing appointment ID" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findById(id)
      .populate("doctor")
      .populate("patient")
      .populate("prescription");

    console.log("[GET prescription] appointment found?", Boolean(appointment));

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    console.log(
      "[GET prescription] appointment prescription:",
      appointment.prescription,
    );

    return NextResponse.json({
      success: true,
      appointment,
      prescription: appointment.prescription || null,
    });
  } catch (error) {
    console.error("[GET prescription] error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load prescription",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    console.log("[PATCH /api/appointments/[id]/prescription] hit");
    console.log("[PATCH prescription] params:", params);
    console.log("[PATCH prescription] url:", req.url);

    await connectDB();

    const { id } = params;

    console.log("[PATCH prescription] appointment id:", id);

    if (!id) {
      console.log("[PATCH prescription] missing appointment id");
      return NextResponse.json(
        { success: false, message: "Missing appointment ID" },
        { status: 400 },
      );
    }

    const appointment = await Appointment.findById(id);
    console.log("[PATCH prescription] appointment found?", Boolean(appointment));

    if (!appointment) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 },
      );
    }

    const rawBody = (await req.json()) as PrescriptionBody;
    console.log("[PATCH prescription] raw body:", rawBody);

    const body = normalizeBody(rawBody);

    const diagnosis = clean(body.diagnosis);
    const medication = clean(body.medication);
    const dosage = clean(body.dosage);
    const duration = clean(body.duration);
    const instructions = clean(body.instructions);
    const notes = clean(body.notes);

    console.log("[PATCH prescription] cleaned body:", {
      diagnosis,
      medication,
      dosage,
      duration,
      instructions,
      notes,
    });

    const existingPrescription = await Prescription.findOne({
      appointment: appointment._id,
    });

    console.log(
      "[PATCH prescription] existing prescription found?",
      Boolean(existingPrescription),
    );

    const prescription = await Prescription.findOneAndUpdate(
      { appointment: appointment._id },
      {
        $set: {
          appointment: appointment._id,
          doctor: appointment.doctor,
          patient: appointment.patient,
          diagnosis,
          medication,
          dosage,
          duration,
          instructions,
          notes,
          status: "finalized",
          isFinalized: true,
          issuedAt: existingPrescription?.issuedAt ?? new Date(),
          finalizedAt: existingPrescription?.finalizedAt ?? new Date(),
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    console.log("[PATCH prescription] saved prescription id:", prescription?._id);

    appointment.prescription = prescription._id;
    appointment.status = "completed";
    appointment.completedAt = appointment.completedAt ?? new Date();

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("doctor")
      .populate("patient")
      .populate("prescription");

    console.log("[PATCH prescription] populated appointment ready");

    return NextResponse.json({
      success: true,
      message: "Prescription saved and appointment completed",
      prescription,
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error("[PATCH prescription] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save prescription",
      },
      { status: 500 },
    );
  }
}