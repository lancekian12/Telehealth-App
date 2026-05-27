import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import FormWrapper from "./form-wrapper";

export default async function DoctorSignupForm() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const doctor = await Doctor.findOne({ clerkId: userId }).lean();

  if (doctor) {
    redirect("/doctor/home");
  }

  return <FormWrapper />;
}