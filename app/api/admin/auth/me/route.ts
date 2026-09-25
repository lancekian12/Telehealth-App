import { NextResponse } from "next/server";
import { requireAdmin } from "@/config/adminAuth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 403 },
    );
  }
  return NextResponse.json({ success: true, admin });
}
