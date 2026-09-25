import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

type DoctorLean = {
  _id: unknown;
  fullName: string;
  email: string;
  specialization: string;
  bio?: string;
  profilePicture?: string;
  licenseNumber?: string;
  experienceYears?: number;
  clinicAddress?: string;
  applicationStatus?: string;
  rejectionReason?: string;
  verified?: boolean;
  createdAt?: Date;
  reviewedAt?: Date | null;
};

function resolveStatus(doctor: { applicationStatus?: string; verified?: boolean }) {
  return doctor.applicationStatus || (doctor.verified ? "accepted" : "pending");
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
    const statusFilter = searchParams.get("status") || "all";

    const doctors = await Doctor.find({})
      .select(
        "fullName email specialization bio profilePicture licenseNumber experienceYears clinicAddress applicationStatus rejectionReason verified createdAt reviewedAt",
      )
      .sort({ createdAt: -1 })
      .lean<DoctorLean[]>();

    const applications = doctors
      .map((doctor) => ({
        id: String(doctor._id),
        fullName: doctor.fullName,
        email: doctor.email,
        specialization: doctor.specialization,
        bio: doctor.bio || "",
        avatar: doctor.profilePicture || "",
        licenseNumber: doctor.licenseNumber || "",
        experienceYears: doctor.experienceYears || 0,
        clinicAddress: doctor.clinicAddress || "",
        status: resolveStatus(doctor),
        rejectionReason: doctor.rejectionReason || "",
        submittedAt: doctor.createdAt,
        reviewedAt: doctor.reviewedAt || null,
      }))
      .filter((app) => statusFilter === "all" || app.status === statusFilter);

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.log("[GET /api/admin/applications] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
