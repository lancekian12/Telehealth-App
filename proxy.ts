import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login",
  "/login(.*)",
  "/signup",
  "/signup(.*)",
  "/patientsignup(.*)",
  "/doctorsignup(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
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