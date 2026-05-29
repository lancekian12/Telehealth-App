import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Notification } from "@/models/notification";
import { Patient } from "@/models/patient";
import { Doctor } from "@/models/doctor";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const patient = await Patient.findOne({ clerkId: userId }).lean();
    const doctor = await Doctor.findOne({ clerkId: userId }).lean();

    let recipientRole: "patient" | "doctor";
    let recipientId: string;

    if (patient) {
      recipientRole = "patient";
      recipientId = String(patient._id);
    } else if (doctor) {
      recipientRole = "doctor";
      recipientId = String(doctor._id);
    } else {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const notifications = await Notification.find({
      recipientRole,
      recipientId,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      recipientRole,
      recipientId,
      notifications,
    });
  } catch (error) {
    console.log("[GET /api/notifications] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
export async function PATCH(req: Request) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const action = String(body.action || "");

    const patient = await Patient.findOne({ clerkId: userId }).lean();
    const doctor = await Doctor.findOne({ clerkId: userId }).lean();

    let recipientRole: "patient" | "doctor";
    let recipientId: string;

    if (patient) {
      recipientRole = "patient";
      recipientId = String(patient._id);
    } else if (doctor) {
      recipientRole = "doctor";
      recipientId = String(doctor._id);
    } else {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (action === "markAllAsRead") {
      await Notification.updateMany(
        { recipientRole, recipientId },
        { $set: { read: true } },
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (action === "markAsRead") {
      const notificationId = String(body.notificationId || "");

      if (!notificationId) {
        return NextResponse.json(
          { success: false, message: "notificationId is required" },
          { status: 400 },
        );
      }

      const result = await Notification.updateOne(
        {
          _id: notificationId,
          recipientRole,
          recipientId,
        },
        { $set: { read: true } },
      );


      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.log("[PATCH /api/notifications] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
