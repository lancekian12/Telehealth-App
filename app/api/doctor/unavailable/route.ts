import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

const MIN_TIME = "08:00";
const MAX_TIME = "17:00";

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeString(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function isValidRange(startTime: string, endTime: string) {
  return (
    isValidTimeString(startTime) &&
    isValidTimeString(endTime) &&
    startTime >= MIN_TIME &&
    endTime <= MAX_TIME &&
    startTime < endTime
  );
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
    const startTime = String(body.startTime || "");
    const endTime = String(body.endTime || "");
    const reason = String(body.reason || "Blocked");

    if (!isValidDateString(date)) {
      return NextResponse.json(
        { success: false, message: "Date must be YYYY-MM-DD" },
        { status: 400 },
      );
    }

    if (!isValidRange(startTime, endTime)) {
      return NextResponse.json(
        {
          success: false,
          message: "Time window must be between 08:00 and 17:00.",
        },
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

    const existingIndex = doctor.unavailableSlots.findIndex(
      (item: { date: string; startTime: string; endTime: string }) =>
        item.date === date &&
        item.startTime === startTime &&
        item.endTime === endTime,
    );

    const newSlot = {
      date,
      startTime,
      endTime,
      reason,
    };

    if (existingIndex >= 0) {
      doctor.unavailableSlots[existingIndex] = newSlot;
    } else {
      doctor.unavailableSlots.push(newSlot);
    }

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Unavailable slot saved successfully",
        unavailableSlots: doctor.unavailableSlots,
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
    const startTime = String(body.startTime || "");
    const endTime = String(body.endTime || "");

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

    doctor.unavailableSlots = doctor.unavailableSlots.filter(
      (item: { date: string; startTime: string; endTime: string }) => {
        if (!startTime && !endTime) return item.date !== date;
        return !(
          item.date === date &&
          item.startTime === startTime &&
          item.endTime === endTime
        );
      },
    );

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Unavailable slot removed successfully",
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