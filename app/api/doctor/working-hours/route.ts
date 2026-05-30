import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value);
}

function isHourlyAligned(time: string) {
  return timeToMinutes(time) % 60 === 0;
}

function generateHourlySlots(date: string, startTime: string, endTime: string) {
  const slots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }> = [];

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let current = start; current < end; current += 60) {
    slots.push({
      date,
      startTime: minutesToTime(current),
      endTime: minutesToTime(current + 60),
      isAvailable: true,
    });
  }

  return slots;
}

function getManilaDateString() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function getManilaMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0",
  );

  return hour * 60 + minute;
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

    if (!isValidDate(date)) {
      return NextResponse.json(
        { success: false, message: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }

    if (!isValidTime(startTime) || !isValidTime(endTime)) {
      return NextResponse.json(
        { success: false, message: "Invalid time format. Use HH:mm." },
        { status: 400 },
      );
    }

    const today = getManilaDateString();
    const nowMinutes = getManilaMinutes();

    if (date < today) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot create working hours for a past date.",
        },
        { status: 400 },
      );
    }

    if (date === today && timeToMinutes(startTime) <= nowMinutes) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot create working hours in the past or for the current time.",
        },
        { status: 400 },
      );
    }

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (start >= end) {
      return NextResponse.json(
        { success: false, message: "End time must be later than start time." },
        { status: 400 },
      );
    }

    if ((end - start) % 60 !== 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Working hours must be divisible into 1-hour slots.",
        },
        { status: 400 },
      );
    }

    if (!isHourlyAligned(startTime) || !isHourlyAligned(endTime)) {
      return NextResponse.json(
        {
          success: false,
          message: "Working hours must start and end on the hour.",
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

    const newSlots = generateHourlySlots(date, startTime, endTime);

    doctor.workingHours = doctor.workingHours.filter(
      (item: { date: string }) => item.date !== date,
    );

    doctor.workingHours.push(...newSlots);

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Working hours saved successfully",
        workingHours: doctor.workingHours,
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

    const { date } = await req.json();

    if (!isValidDate(String(date || ""))) {
      return NextResponse.json(
        { success: false, message: "Invalid date" },
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

    doctor.workingHours = doctor.workingHours.filter(
      (item: { date: string }) => item.date !== date,
    );

    await doctor.save();

    return NextResponse.json(
      {
        success: true,
        message: "Working hours removed successfully",
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