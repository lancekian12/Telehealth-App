// app/post-login/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import { resolveDoctorApplicationStatus } from "@/config/doctorStatus";
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

    const applicationStatus = resolveDoctorApplicationStatus(doctor);

    // A pending doctor who hasn't finished registering may still complete
    // the details form; everything else must wait for approval.
    if (needsDoctorDetails && applicationStatus !== "rejected") {
      redirect("/doctorsignup/doctorsignupdetails");
    }

    if (applicationStatus !== "accepted") {
      redirect(`/account-status?status=${applicationStatus}`);
    }

    redirect("/doctor/home");
  }

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

  // No record yet, treat this as a fresh patient signup
  redirect("/patientsignup/patientsignupdetails");
}