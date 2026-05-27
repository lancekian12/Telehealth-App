// app/(auth)/patientsignup/patientsignupdetails/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Patient } from "@/models/patient";
import FormWrapper from "./form-wrapper";

export default async function PatientSignupDetailsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const patient = await Patient.findOne({ clerkId: userId }).lean();

  if (patient) {
    redirect("/");
  }

  return <FormWrapper />;
}