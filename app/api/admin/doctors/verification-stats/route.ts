import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

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

    const doctors = await Doctor.find({})
      .select("applicationStatus verified")
      .lean<{ applicationStatus?: string; verified?: boolean }[]>();

    const stats = { pending: 0, accepted: 0, rejected: 0 };

    for (const doctor of doctors) {
      // Doctors created before the application-review feature existed have
      // no applicationStatus field on disk — derive it from `verified` so
      // they aren't miscounted as new pending applications.
      const status =
        doctor.applicationStatus || (doctor.verified ? "accepted" : "pending");

      if (status === "accepted") stats.accepted += 1;
      else if (status === "rejected") stats.rejected += 1;
      else stats.pending += 1;
    }

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        total: doctors.length,
      },
    });
  } catch (error) {
    console.log("[GET /api/admin/doctors/verification-stats] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
