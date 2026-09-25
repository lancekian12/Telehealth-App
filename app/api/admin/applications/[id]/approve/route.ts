import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Doctor } from "@/models/doctor";
import { createNotification } from "@/config/notification-service";

export const runtime = "nodejs";

export async function PATCH(
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

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      {
        $set: {
          applicationStatus: "accepted",
          verified: true,
          rejectionReason: "",
          reviewedAt: new Date(),
          reviewedBy: admin._id,
        },
      },
      { new: true },
    );

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    await createNotification({
      recipientRole: "doctor",
      recipientModel: "Doctor",
      recipientId: doctor._id,
      type: "doctor_application_approved",
      title: "Application approved",
      message:
        "Your doctor application has been approved. You can now accept patient bookings.",
    });

    return NextResponse.json({
      success: true,
      application: { id: String(doctor._id), status: "accepted" },
    });
  } catch (error) {
    console.log("[PATCH /api/admin/applications/[id]/approve] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
