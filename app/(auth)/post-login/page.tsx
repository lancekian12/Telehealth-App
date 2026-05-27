import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Patient } from "@/models/patient";

export default async function PostLoginPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const patient = await Patient.findOne({ clerkId: userId }).lean();

  const needsDetails =
    !patient ||
    !patient.fullName ||
    !patient.birthday ||
    !patient.weight ||
    !patient.height ||
    !patient.email ||
    !patient.phone ||
    !patient.basicMedicalHistory;

  if (needsDetails) {
    redirect("/patientsignup/patientsignupdetails");
  }

  redirect("/");
}