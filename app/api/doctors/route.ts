import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const doctors = await Doctor.find({
      role: "doctor",
    }).lean();

    return NextResponse.json(
      {
        success: true,
        doctors: doctors.map((doctor) => ({
          id: String(doctor._id),
          clerkId: doctor.clerkId,

          fullName: doctor.fullName || "",
          specialization: doctor.specialization || "",
          bio: doctor.bio || "",
          profilePicture: doctor.profilePicture || "",

          email: doctor.email || "",
          phone: doctor.phone || "",

          rating: doctor.rating ?? 0,
          consultationFee: doctor.consultationFee ?? 0,

          consultationModes: doctor.consultationModes ?? [],
          languages: doctor.languages ?? [],

          verified: doctor.verified ?? false,
          acceptsNewPatients:
            doctor.acceptsNewPatients ?? true,

          workingHours: doctor.workingHours ?? [],
          unavailableSlots:
            doctor.unavailableSlots ?? [],

          consultationDurationMinutes:
            doctor.consultationDurationMinutes ?? 30,

          clinicName: doctor.clinicName || "",
          clinicStreetAddress:
            doctor.clinicStreetAddress || "",
          clinicBarangay:
            doctor.clinicBarangay || "",
          clinicCityMunicipality:
            doctor.clinicCityMunicipality || "",
          clinicProvince:
            doctor.clinicProvince || "",
          clinicAddress:
            doctor.clinicAddress || "",

          latitude: doctor.latitude ?? null,
          longitude: doctor.longitude ?? null,

          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt,
        })),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/doctors error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 },
    );
  }
}