import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Notification } from "@/models/notification";

export const runtime = "nodejs";

export async function PATCH() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    await Notification.updateMany(
      { recipientRole: "admin", recipientId: admin._id },
      { $set: { read: true } },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[PATCH /api/admin/notifications/read-all] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
