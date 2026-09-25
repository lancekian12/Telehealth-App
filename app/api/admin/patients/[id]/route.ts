import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Patient } from "@/models/patient";
import { Appointment } from "@/models/appointment";
// populate("doctor") below needs this schema registered with Mongoose.
import "@/models/doctor";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    const { id } = await params;

    const patient = await Patient.findById(id).lean<{
      _id: unknown;
      fullName: string;
      email: string;
      phone: string;
      profilePicture?: string;
      birthday?: Date;
      weight?: string;
      height?: string;
      basicMedicalHistory?: string;
      createdAt?: Date;
    } | null>();

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 },
      );
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate("doctor", "fullName specialization")
      .sort({ appointmentDate: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      patient: {
        id: String(patient._id),
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        profilePicture: patient.profilePicture || "",
        birthday: patient.birthday,
        weight: patient.weight || "",
        height: patient.height || "",
        basicMedicalHistory: patient.basicMedicalHistory || "",
        joinedAt: patient.createdAt,
      },
      appointments: appointments.map((a) => ({
        id: String(a._id),
        date: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        consultationType: a.consultationType,
        condition: a.reasonForVisit || "",
        doctorName:
          a.doctor && typeof a.doctor === "object" && "fullName" in a.doctor
            ? (a.doctor as { fullName?: string }).fullName || "Unknown"
            : "Unknown",
        doctorSpecialization:
          a.doctor && typeof a.doctor === "object" && "specialization" in a.doctor
            ? (a.doctor as { specialization?: string }).specialization || ""
            : "",
      })),
    });
  } catch (error) {
    console.log("[GET /api/admin/patients/[id]] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
