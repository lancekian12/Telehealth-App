import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Patient } from "@/models/patient";
import { Doctor } from "@/models/doctor";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? { changePercent: 100, isNew: true } : { changePercent: 0, isNew: false };
  }
  const change = ((current - previous) / previous) * 100;
  return { changePercent: Math.round(change * 10) / 10, isNew: false };
}

async function countWithTrend(model: { countDocuments: (q: object) => Promise<number> }) {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [total, currentPeriod, previousPeriod] = await Promise.all([
    model.countDocuments({}),
    model.countDocuments({ createdAt: { $gte: periodStart } }),
    model.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: periodStart },
    }),
  ]);

  const { changePercent, isNew } = percentChange(currentPeriod, previousPeriod);

  return {
    total,
    changePercent,
    trend:
      changePercent > 0 ? "up" : changePercent < 0 ? "down" : "stable",
    isNew,
  };
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    const [users, patients, doctors, appointments] = await Promise.all([
      // "Total Users" = patients + doctors combined
      (async () => {
        const patientStats = await countWithTrend(Patient);
        const doctorStats = await countWithTrend(Doctor);
        return {
          total: patientStats.total + doctorStats.total,
          changePercent:
            Math.round(
              ((patientStats.changePercent + doctorStats.changePercent) / 2) *
                10,
            ) / 10,
          trend:
            patientStats.total + doctorStats.total === 0
              ? "stable"
              : patientStats.changePercent + doctorStats.changePercent > 0
                ? "up"
                : patientStats.changePercent + doctorStats.changePercent < 0
                  ? "down"
                  : "stable",
        };
      })(),
      countWithTrend(Patient),
      countWithTrend(Doctor),
      countWithTrend(Appointment),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users,
        totalPatients: patients,
        totalDoctors: doctors,
        totalAppointments: appointments,
      },
    });
  } catch (error) {
    console.log("[GET /api/admin/dashboard/stats] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
