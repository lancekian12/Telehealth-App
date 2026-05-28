import { NextResponse } from "next/server";
import { Types } from "mongoose";
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

    console.log("[doctor route] id:", id);
    console.log("[doctor route] db:", Doctor.db.name);
    console.log("[doctor route] collection:", Doctor.collection.name);

    const byId = Types.ObjectId.isValid(id)
      ? await Doctor.findById(id).lean()
      : null;

    const byClerk = await Doctor.findOne({ clerkId: id }).lean();

    console.log("[doctor route] byId found:", !!byId);
    console.log("[doctor route] byClerk found:", !!byClerk);

    if (!byId && !byClerk) {
      const count = await Doctor.countDocuments();
      const sample = await Doctor.find()
        .select({ _id: 1, clerkId: 1, fullName: 1 })
        .limit(5)
        .lean();

      console.log("[doctor route] doctor count:", count);
      console.log("[doctor route] sample docs:", sample);

      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    const doctor = byId ?? byClerk!;

    return NextResponse.json({
      success: true,
      doctor: {
        id: String(doctor._id),
        clerkId: doctor.clerkId || "",
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
        scheduleOverrides: doctor.scheduleOverrides ?? [],
        consultationDurationMinutes: doctor.consultationDurationMinutes ?? 30,
        clinicAddress: doctor.clinicAddress || "",
      },
    });
  } catch (error: unknown) {
    console.error("[doctor route] error:", error);

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