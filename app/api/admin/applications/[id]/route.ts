import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    const { id } = await params;
    const doctor = await Doctor.findById(id).lean<{
      _id: unknown;
      fullName: string;
      email: string;
      phone: string;
      specialization: string;
      bio?: string;
      profilePicture?: string;
      licenseNumber?: string;
      experienceYears?: number;
      consultationFee?: number;
      clinicName?: string;
      clinicAddress?: string;
      languages?: string[];
      applicationStatus?: string;
      rejectionReason?: string;
      verified?: boolean;
      createdAt?: Date;
      reviewedAt?: Date | null;
    } | null>();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: String(doctor._id),
        fullName: doctor.fullName,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        bio: doctor.bio || "",
        avatar: doctor.profilePicture || "",
        licenseNumber: doctor.licenseNumber || "",
        experienceYears: doctor.experienceYears || 0,
        consultationFee: doctor.consultationFee || 0,
        clinicName: doctor.clinicName || "",
        clinicAddress: doctor.clinicAddress || "",
        languages: doctor.languages || [],
        status: doctor.applicationStatus || (doctor.verified ? "accepted" : "pending"),
        rejectionReason: doctor.rejectionReason || "",
        submittedAt: doctor.createdAt,
        reviewedAt: doctor.reviewedAt || null,
      },
    });
  } catch (error) {
    console.log("[GET /api/admin/applications/[id]] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
