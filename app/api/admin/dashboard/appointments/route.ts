import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getCurrentWeekRange(now: Date) {
  const today = startOfDay(now);
  const dayIndex = (today.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  const monday = addDays(today, -dayIndex);
  const sundayEnd = addDays(monday, 7);
  return { monday, sundayEnd };
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range") || "7d";
    const rangeDays = Math.max(
      1,
      parseInt(rangeParam.replace(/[^0-9]/g, ""), 10) || 7,
    );

    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const pastStart = addDays(today, -rangeDays);
    const futureEnd = addDays(today, rangeDays);

    const [pending, completed, todayCount, upcoming] = await Promise.all([
      Appointment.countDocuments({
        status: "pending",
        appointmentDate: { $gte: pastStart, $lte: futureEnd },
      }),
      Appointment.countDocuments({
        status: "completed",
        appointmentDate: { $gte: pastStart, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: tomorrow, $lte: futureEnd },
      }),
    ]);

    // Weekly trend: Consultations (a patient's first-ever appointment) vs
    // Follow-ups (a patient's repeat appointment), Monday through Sunday of
    // the current week.
    const { monday, sundayEnd } = getCurrentWeekRange(now);

    const weekAppointments = await Appointment.find({
      appointmentDate: { $gte: monday, $lt: sundayEnd },
    })
      .select("appointmentDate patient")
      .lean<{ appointmentDate: Date; patient: unknown }[]>();

    const patientIds = Array.from(
      new Set(weekAppointments.map((a) => String(a.patient))),
    );

    const earliestByPatient = new Map<string, number>();

    if (patientIds.length > 0) {
      const earliestDocs = await Appointment.aggregate([
        { $match: { patient: { $in: weekAppointments.map((a) => a.patient) } } },
        { $group: { _id: "$patient", earliest: { $min: "$appointmentDate" } } },
      ]);

      for (const doc of earliestDocs) {
        earliestByPatient.set(String(doc._id), new Date(doc.earliest).getTime());
      }
    }

    const dayBuckets = WEEKDAY_LABELS.map((label) => ({
      day: label,
      consultations: 0,
      followUps: 0,
    }));

    for (const appt of weekAppointments) {
      const apptDate = new Date(appt.appointmentDate);
      const dayIndex = Math.floor(
        (startOfDay(apptDate).getTime() - monday.getTime()) /
          (24 * 60 * 60 * 1000),
      );
      if (dayIndex < 0 || dayIndex > 6) continue;

      const earliest = earliestByPatient.get(String(appt.patient));
      const isFollowUp = earliest !== undefined && apptDate.getTime() > earliest;

      if (isFollowUp) {
        dayBuckets[dayIndex].followUps += 1;
      } else {
        dayBuckets[dayIndex].consultations += 1;
      }
    }

    return NextResponse.json({
      success: true,
      range: `${rangeDays}d`,
      summary: {
        pending,
        completed,
        today: todayCount,
        upcoming,
      },
      weeklyTrend: dayBuckets,
    });
  } catch (error) {
    console.log("[GET /api/admin/dashboard/appointments] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
