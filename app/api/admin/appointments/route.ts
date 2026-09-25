import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Appointment } from "@/models/appointment";
// Populate("patient"/"doctor") below needs these schemas registered with
// Mongoose — without the import, a fresh process throws MissingSchemaError
// if this route happens to run before anything else registers them.
import "@/models/patient";
import "@/models/doctor";

export const runtime = "nodejs";

type AppointmentColumn =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function resolveColumn(
  appt: { status: string; consultationType: string; startTime: string; endTime: string },
  appointmentDateStr: string,
  isSelectedDateToday: boolean,
  nowMinutes: number,
): AppointmentColumn {
  if (appt.status === "pending") return "pending";
  if (appt.status === "completed") return "completed";
  if (appt.status === "cancelled" || appt.status === "rejected") return "cancelled";

  // accepted
  if (
    isSelectedDateToday &&
    appt.consultationType === "video" &&
    nowMinutes >= timeToMinutes(appt.startTime) &&
    nowMinutes < timeToMinutes(appt.endTime)
  ) {
    return "in_progress";
  }

  return "confirmed";
}

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
    const dateParam = searchParams.get("date") || getLocalDateString(new Date());
    const search = (searchParams.get("search") || "").trim();

    const [year, month, day] = dateParam.split("-").map(Number);
    const dayStart = new Date(year, (month || 1) - 1, day || 1, 0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const query: Record<string, unknown> = {
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
    };

    let appointments = await Appointment.find(query)
      .populate("patient", "fullName profilePicture")
      .populate("doctor", "fullName specialization")
      .sort({ startTime: 1 })
      .lean();

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      appointments = appointments.filter((a) => {
        const patientName =
          a.patient && typeof a.patient === "object" && "fullName" in a.patient
            ? String((a.patient as { fullName?: string }).fullName || "")
            : "";
        const doctorName =
          a.doctor && typeof a.doctor === "object" && "fullName" in a.doctor
            ? String((a.doctor as { fullName?: string }).fullName || "")
            : "";
        return regex.test(patientName) || regex.test(doctorName);
      });
    }

    const today = getLocalDateString(new Date());
    const isSelectedDateToday = dateParam === today;
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const cards = appointments.map((a) => {
      const patient =
        a.patient && typeof a.patient === "object"
          ? (a.patient as { fullName?: string; profilePicture?: string })
          : null;
      const doctor =
        a.doctor && typeof a.doctor === "object"
          ? (a.doctor as { fullName?: string; specialization?: string })
          : null;

      const column = resolveColumn(
        {
          status: a.status,
          consultationType: a.consultationType,
          startTime: a.startTime,
          endTime: a.endTime,
        },
        dateParam,
        isSelectedDateToday,
        nowMinutes,
      );

      return {
        id: String(a._id),
        shortId: String(a._id).slice(-6).toUpperCase(),
        patientName: patient?.fullName || "Unknown patient",
        patientAvatar: patient?.profilePicture || "",
        doctorName: doctor?.fullName || "Unknown doctor",
        doctorSpecialization: doctor?.specialization || "",
        consultationType: a.consultationType,
        status: a.status,
        column,
        startTime: a.startTime,
        endTime: a.endTime,
        appointmentDate: a.appointmentDate,
        reasonForVisit: a.reasonForVisit || "",
      };
    });

    const columns: Record<AppointmentColumn, typeof cards> = {
      pending: [],
      confirmed: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };

    for (const card of cards) {
      columns[card.column].push(card);
    }

    return NextResponse.json({
      success: true,
      date: dateParam,
      columns,
      total: cards.length,
    });
  } catch (error) {
    console.log("[GET /api/admin/appointments] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
