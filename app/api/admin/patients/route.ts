import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Patient } from "@/models/patient";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10),
    );
    const search = (searchParams.get("search") || "").trim();

    const query: Record<string, unknown> = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }

    const [total, patients] = await Promise.all([
      Patient.countDocuments(query),
      Patient.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const patientIds = patients.map((p) => p._id);
    const appointmentCounts = await Appointment.aggregate([
      { $match: { patient: { $in: patientIds } } },
      { $group: { _id: "$patient", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      appointmentCounts.map((item) => [String(item._id), item.count]),
    );

    return NextResponse.json({
      success: true,
      patients: patients.map((p) => ({
        id: String(p._id),
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        profilePicture: p.profilePicture || "",
        birthday: p.birthday,
        appointmentCount: countMap.get(String(p._id)) || 0,
        joinedAt: p.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.log("[GET /api/admin/patients] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
