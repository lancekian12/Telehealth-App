import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { requireAdmin } from "@/config/adminAuth";
import { Admin } from "@/models/admin";
import { hashPassword, verifyPassword } from "@/config/adminCrypto";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    await connectDB();

    const body = await req.json().catch(() => ({}));
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current and new password are required",
        },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const adminDoc = await Admin.findById(admin._id);

    if (!adminDoc || !verifyPassword(currentPassword, adminDoc.passwordHash)) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 },
      );
    }

    adminDoc.passwordHash = hashPassword(newPassword);
    await adminDoc.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[PATCH /api/admin/auth/change-password] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
