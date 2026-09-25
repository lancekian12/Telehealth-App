import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Patient } from "@/models/patient";
import { Doctor } from "@/models/doctor";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

const RESULT_LIMIT = 5;

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
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      return NextResponse.json({
        success: true,
        query: "",
        results: { patients: [], doctors: [], appointments: [], applications: [] },
      });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [patients, doctors, applications] = await Promise.all([
      Patient.find({ $or: [{ fullName: regex }, { email: regex }] })
        .select("fullName email profilePicture")
        .limit(RESULT_LIMIT)
        .lean(),
      Doctor.find({
        $or: [{ fullName: regex }, { email: regex }, { specialization: regex }],
      })
        .select("fullName email specialization profilePicture applicationStatus verified")
        .limit(RESULT_LIMIT)
        .lean(),
      Doctor.find({
        $and: [
          { $or: [{ fullName: regex }, { specialization: regex }] },
          { $or: [{ applicationStatus: "pending" }, { verified: false }] },
        ],
      })
        .select("fullName specialization profilePicture createdAt")
        .limit(RESULT_LIMIT)
        .lean(),
    ]);

    const patientIds = patients.map((p) => p._id);
    const doctorIds = doctors.map((d) => d._id);

    const appointments = await Appointment.find({
      $or: [
        { patient: { $in: patientIds } },
        { doctor: { $in: doctorIds } },
        { reasonForVisit: regex },
      ],
    })
      .populate("patient", "fullName")
      .populate("doctor", "fullName")
      .sort({ appointmentDate: -1 })
      .limit(RESULT_LIMIT)
      .lean();

    return NextResponse.json({
      success: true,
      query: q,
      results: {
        patients: patients.map((p) => ({
          id: String(p._id),
          name: p.fullName,
          email: p.email,
          avatar: p.profilePicture || "",
        })),
        doctors: doctors.map((d) => ({
          id: String(d._id),
          name: d.fullName,
          email: d.email,
          specialization: d.specialization,
          avatar: d.profilePicture || "",
          status: d.applicationStatus || (d.verified ? "accepted" : "pending"),
        })),
        appointments: appointments.map((a) => ({
          id: String(a._id),
          patientName:
            a.patient && typeof a.patient === "object" && "fullName" in a.patient
              ? (a.patient as { fullName?: string }).fullName
              : "Unknown",
          doctorName:
            a.doctor && typeof a.doctor === "object" && "fullName" in a.doctor
              ? (a.doctor as { fullName?: string }).fullName
              : "Unknown",
          date: a.appointmentDate,
          status: a.status,
        })),
        applications: applications.map((d) => ({
          id: String(d._id),
          name: d.fullName,
          specialization: d.specialization,
          avatar: d.profilePicture || "",
          submittedAt: d.createdAt,
        })),
      },
    });
  } catch (error) {
    console.log("[GET /api/admin/search] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
