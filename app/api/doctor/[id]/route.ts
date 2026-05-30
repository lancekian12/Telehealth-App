import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

type WorkingHour = {
  day?: string;
  date?: string | Date;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
};

function parseTimeToMinutes(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return hour * 60 + minute;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getPhilippinesParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function getNextPhilippinesDays(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const d = new Date(Date.now() + index * 24 * 60 * 60 * 1000);

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
    })
      .formatToParts(d)
      .reduce<Record<string, string>>((acc, part) => {
        if (part.type !== "literal") acc[part.type] = part.value;
        return acc;
      }, {});

    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      weekday: parts.weekday,
    };
  });
}

function resolveDoctorWorkingHours(hours: WorkingHour[]) {
  const now = getPhilippinesParts();
  const nextDays = getNextPhilippinesDays(7);

  return nextDays.flatMap((day) => {
    return hours
      .filter((slot) => {
        if (slot.isAvailable === false) return false;

        const slotDate =
          slot.date instanceof Date
            ? new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              }).format(slot.date)
            : typeof slot.date === "string" && slot.date
              ? slot.date.slice(0, 10)
              : null;

        const slotDay = slot.day ? normalize(slot.day) : null;
        const currentDay = normalize(day.weekday);

        const matchesDate =
          !!slotDate && slotDate === day.date;

        const matchesWeekday =
          !!slotDay && slotDay === currentDay;

        if (!matchesDate && !matchesWeekday) return false;

        // Hide past slots for today in Philippines
        if (day.date === now.date) {
          const startMinutes = parseTimeToMinutes(slot.startTime);
          if (startMinutes === null) return false;

          return startMinutes > now.minutes;
        }

        return true;
      })
      .map((slot) => ({
        date: day.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable ?? true,
      }));
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const byId = Types.ObjectId.isValid(id)
      ? await Doctor.findById(id).lean()
      : null;

    const byClerk = await Doctor.findOne({ clerkId: id }).lean();

    if (!byId && !byClerk) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    const doctor = byId ?? byClerk!;

    const doctorObjectId = Types.ObjectId.isValid(String(doctor._id))
      ? new Types.ObjectId(String(doctor._id))
      : null;

    const bookedSlots = doctorObjectId
      ? await Appointment.find({
          doctor: doctorObjectId,
          status: { $in: ["pending", "accepted"] },
        })
          .select({ appointmentDate: 1, startTime: 1, endTime: 1, status: 1 })
          .lean()
      : [];

    const normalizedWorkingHours = resolveDoctorWorkingHours(
      (doctor.workingHours ?? []) as WorkingHour[],
    );

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

        // server-side filtered and date-based
        workingHours: normalizedWorkingHours,

        unavailableSlots: doctor.unavailableSlots ?? [],
        scheduleOverrides: doctor.scheduleOverrides ?? [],
        consultationDurationMinutes: doctor.consultationDurationMinutes ?? 60,
        clinicAddress: doctor.clinicAddress || "",
        bookedSlots: bookedSlots.map((slot) => ({
          date: new Date(slot.appointmentDate).toISOString().slice(0, 10),
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
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