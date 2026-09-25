import { cookies } from "next/headers";
import { connectDB } from "@/config/mongodb";
import { Admin } from "@/models/admin";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/config/adminCrypto";

export type AdminSession = {
  _id: string;
  email: string;
  fullName: string;
};

/**
 * Resolves the current request's admin from the admin_session cookie.
 * This is fully independent of the patient/doctor Clerk login — admins
 * authenticate through /admin/login and POST /api/admin/auth/login.
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  await connectDB();

  const admin = await Admin.findById(payload.adminId).lean<{
    _id: unknown;
    email: string;
    fullName?: string;
  }>();

  if (!admin) return null;

  return {
    _id: String(admin._id),
    email: admin.email,
    fullName: admin.fullName || "",
  };
}
