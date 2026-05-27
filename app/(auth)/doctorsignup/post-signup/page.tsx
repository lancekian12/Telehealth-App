// app/doctorsignup/post-signup/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";

export default async function DoctorPostSignupPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const doctor = await Doctor.findOne({ clerkId: userId });

  const needsDetails =
    !doctor ||
    !doctor.fullName ||
    !doctor.specialization ||
    !doctor.bio ||
    !doctor.email ||
    !doctor.phone;

  if (needsDetails) {
    redirect("/doctorsignup/doctorsignupdetails");
  }

  redirect("/doctor/home");
}