import { NextResponse } from "next/server";
import { connectDB } from "@/config/mongodb";
import { Admin } from "@/models/admin";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  verifyPassword,
} from "@/config/adminCrypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    const admin = await Admin.findOne({ email });

    // Same generic message whether the email doesn't exist or the password
    // is wrong, so login can't be used to enumerate admin accounts.
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = createSessionToken(String(admin._id));

    const res = NextResponse.json({
      success: true,
      admin: { email: admin.email, fullName: admin.fullName || "" },
    });

    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.log("[POST /api/admin/auth/login] error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
