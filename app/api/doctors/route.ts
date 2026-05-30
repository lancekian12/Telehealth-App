import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

type WorkingHour = {
  day?: string; // e.g. "Monday"
  dayOfWeek?: string; // alternative field name
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
};

function getPhilippinesNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    weekday: parts.weekday, // "Monday"
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`, // "19:30"
  };
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function normalizeDay(day?: string) {
  return (day || "").trim().toLowerCase();
}

function isDoctorBookableNow(workingHours: WorkingHour[]) {
  const phNow = getPhilippinesNow();
  const currentMinutes = toMinutes(phNow.time);
  const today = normalizeDay(phNow.weekday);

  const todaysSlots = workingHours.filter((slot) => {
    const slotDay = normalizeDay(slot.day || slot.dayOfWeek);
    return slotDay === today;
  });

  // No schedule today => not bookable
  if (todaysSlots.length === 0) return false;

  // Bookable only if current PH time is within at least one working slot
  return todaysSlots.some((slot) => {
    const start = toMinutes(slot.startTime);
    const end = toMinutes(slot.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });
}

export async function GET() {
  try {
    await connectDB();

    const doctors = await Doctor.find({
      role: "doctor",
    }).lean();

    return NextResponse.json(
      {
        success: true,
        doctors: doctors.map((doctor) => {
          const workingHours = (doctor.workingHours ?? []) as WorkingHour[];
          const bookingAvailable = isDoctorBookableNow(workingHours);

          return {
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
            acceptsNewPatients: doctor.acceptsNewPatients ?? true,

            workingHours,
            unavailableSlots: doctor.unavailableSlots ?? [],

            consultationDurationMinutes:
              doctor.consultationDurationMinutes ?? 60,

            clinicName: doctor.clinicName || "",
            clinicStreetAddress: doctor.clinicStreetAddress || "",
            clinicBarangay: doctor.clinicBarangay || "",
            clinicCityMunicipality: doctor.clinicCityMunicipality || "",
            clinicProvince: doctor.clinicProvince || "",
            clinicAddress: doctor.clinicAddress || "",

            latitude: doctor.latitude ?? null,
            longitude: doctor.longitude ?? null,

            bookingAvailable,

            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
          };
        }),
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/doctors error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}