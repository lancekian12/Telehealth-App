import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeString(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await req.json();

    const date = String(body.date || "");
    const action = String(body.action || "");
    const reason = String(body.reason || "");
    const newDate = body.newDate ? String(body.newDate) : null;
    const newStartTime = body.newStartTime ? String(body.newStartTime) : null;
    const newEndTime = body.newEndTime ? String(body.newEndTime) : null;

    if (!isValidDateString(date)) {
      return NextResponse.json(
        { success: false, message: "date must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    if (!["rescheduled", "cancelled"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 },
      );
    }

    if (action === "rescheduled") {
      if (!newDate || !isValidDateString(newDate)) {
        return NextResponse.json(
          { success: false, message: "newDate is required for rescheduling" },
          { status: 400 },
        );
      }

      if (!newStartTime || !newEndTime) {
        return NextResponse.json(
          {
            success: false,
            message: "newStartTime and newEndTime are required for rescheduling",
          },
          { status: 400 },
        );
      }

      if (!isValidTimeString(newStartTime) || !isValidTimeString(newEndTime)) {
        return NextResponse.json(
          { success: false, message: "Invalid time format" },
          { status: 400 },
        );
      }
    }

    const doctor = await Doctor.findOne({
      clerkId: userId,
      role: "doctor",
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    doctor.scheduleOverrides.push({
      date,
      action,
      newDate,
      newStartTime,
      newEndTime,
      reason,
      startTime: null,
      endTime: null,
    });

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Schedule override saved successfully",
        scheduleOverrides: doctor.scheduleOverrides,
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

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const body = await req.json();
    const date = String(body.date || "");

    if (!isValidDateString(date)) {
      return NextResponse.json(
        { success: false, message: "Date must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    const doctor = await Doctor.findOne({
      clerkId: userId,
      role: "doctor",
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    doctor.scheduleOverrides = doctor.scheduleOverrides.filter(
      (item: { date: string }) => item.date !== date,
    );

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Schedule override removed successfully",
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