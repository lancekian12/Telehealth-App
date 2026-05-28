import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const doctor = await Doctor.findById(id).lean();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        doctor: {
          id: String(doctor._id),
          fullName: doctor.fullName || "",
          specialization: doctor.specialization || "",
          profilePicture: doctor.profilePicture || "",
          rating: doctor.rating ?? 0,
          consultationFee: doctor.consultationFee ?? 0,
          consultationModes: doctor.consultationModes ?? [],
          languages: doctor.languages ?? [],
          verified: doctor.verified ?? false,
          acceptsNewPatients: doctor.acceptsNewPatients ?? true,
          workingHours: doctor.workingHours ?? [],
          unavailableSlots: doctor.unavailableSlots ?? [],
          consultationDurationMinutes: doctor.consultationDurationMinutes ?? 30,
          clinicAddress: doctor.clinicAddress || "",
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/doctor/[id] error:", error);

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