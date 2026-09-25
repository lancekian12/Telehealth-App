import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/config/adminCrypto";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/login(.*)",
  "/signup",
  "/signup(.*)",
  "/patientsignup(.*)",
  "/doctorsignup(.*)",
  // Admin auth is fully independent of Clerk (its own login + session
  // cookie via requireAdmin()), so Clerk's middleware must not intercept it.
  // The admin_session cookie is instead verified explicitly below.
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isAdminPage = createRouteMatcher(["/admin(.*)"]);
const isAdminLoginPage = createRouteMatcher(["/admin/login(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Admin pages (not the API — every /api/admin/* route already calls
  // requireAdmin() itself, and redirecting a fetch() call to an HTML login
  // page would break its JSON parsing) have their own session system,
  // independent of Clerk. Gate them here, at the network boundary, instead
  // of relying solely on a client-side redirect after the page has already
  // been served.
  if (isAdminPage(req) && !isAdminLoginPage(req)) {
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  }

  const { userId } = await auth();

  // allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // redirect unauthenticated users
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};