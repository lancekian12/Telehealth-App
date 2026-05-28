import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const doctor = await Doctor.findOne({
      clerkId: userId,
      role: "doctor",
    }).lean();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        workingHours: doctor.workingHours || [],
        unavailableSlots: doctor.unavailableSlots || [],
        scheduleOverrides: doctor.scheduleOverrides || [],
      },
      { status: 200 },
    );
  } catch (error: unknown) {
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