// app/post-login/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import { Patient } from "@/models/patient";

export default async function PostLoginPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  await connectDB();

  const doctor = await Doctor.findOne({
    clerkId: userId,
    role: "doctor",
  }).lean();

  const patient = await Patient.findOne({
    clerkId: userId,
    role: "patient",
  }).lean();

  /**
   * ======================
   * DOCTOR FLOW
   * ======================
   */
  if (doctor) {
    const needsDoctorDetails =
      !doctor.fullName ||
      !doctor.specialization ||
      !doctor.bio ||
      !doctor.email ||
      !doctor.phone ||
      !doctor.licenseNumber ||
      !doctor.profilePicture ||
      !doctor.clinicAddress;

    if (needsDoctorDetails) {
      redirect("/doctorsignup/doctorsignupdetails");
    }

    redirect("/doctor/home");
  }

  /**
   * ======================
   * PATIENT FLOW
   * ======================
   */
  if (patient) {
    const needsPatientDetails =
      !patient.fullName ||
      !patient.birthday ||
      !patient.weight ||
      !patient.height ||
      !patient.email ||
      !patient.phone ||
      !patient.basicMedicalHistory;

    if (needsPatientDetails) {
      redirect("/patientsignup/patientsignupdetails");
    }

    redirect("/");
  }

  redirect("/"); 
}