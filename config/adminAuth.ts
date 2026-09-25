import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Admin } from "@/models/admin";

function getAdminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminSession = {
  _id: string;
  clerkId: string;
  email: string;
  fullName: string;
};

/**
 * Resolves the current request's admin, auto-provisioning an Admin record
 * the first time a Clerk user whose email is in ADMIN_EMAILS signs in.
 * There is no admin signup flow — access is bootstrapped purely through
 * that env allowlist, so returns null for everyone else.
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const { userId } = await auth();
  if (!userId) return null;

  await connectDB();

  const existing = await Admin.findOne({ clerkId: userId }).lean<{
    _id: unknown;
    clerkId: string;
    email: string;
    fullName?: string;
  }>();

  if (existing) {
    return {
      _id: String(existing._id),
      clerkId: existing.clerkId,
      email: existing.email,
      fullName: existing.fullName || "",
    };
  }

  const allowlist = getAdminEmailAllowlist();
  if (allowlist.length === 0) return null;

  const user = await currentUser();
  const primaryEmail = user?.emailAddresses?.find(
    (item) => item.id === user.primaryEmailAddressId,
  )?.emailAddress;

  const email = (primaryEmail || user?.emailAddresses?.[0]?.emailAddress || "")
    .trim()
    .toLowerCase();

  if (!email || !allowlist.includes(email)) return null;

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || email;

  // The dashboard fires several admin API requests in parallel on first
  // load, so this provisioning step must be atomic — a plain find-then-create
  // races across those concurrent requests and trips the unique clerkId
  // index. upsert makes the read+write a single atomic operation.
  const created = await Admin.findOneAndUpdate(
    { clerkId: userId },
    {
      $setOnInsert: {
        clerkId: userId,
        email,
        fullName,
        profilePicture: user?.imageUrl || "",
      },
    },
    { upsert: true, new: true },
  );

  return {
    _id: String(created._id),
    clerkId: created.clerkId,
    email: created.email,
    fullName: created.fullName || "",
  };
}
