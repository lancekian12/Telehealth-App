// app/api/doctor/schedule/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const doctor = await Doctor.findOne({
      clerkId: userId,
      role: "doctor",
    }).lean();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      workingHours: doctor.workingHours || [],
      unavailableSlots: doctor.unavailableSlots || [],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();

    const workingHours = Array.isArray(body.workingHours) ? body.workingHours : [];
    const unavailableSlots = Array.isArray(body.unavailableSlots) ? body.unavailableSlots : [];

    const doctor = await Doctor.findOneAndUpdate(
      { clerkId: userId, role: "doctor" },
      {
        workingHours,
        unavailableSlots,
      },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule saved successfully",
      workingHours: doctor.workingHours,
      unavailableSlots: doctor.unavailableSlots,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}