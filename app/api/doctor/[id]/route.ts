import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import { Appointment } from "@/models/appointment";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id } = await params;

    const byId = Types.ObjectId.isValid(id)
      ? await Doctor.findById(id).lean()
      : null;

    const byClerk = await Doctor.findOne({ clerkId: id }).lean();

    if (!byId && !byClerk) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    const doctor = byId ?? byClerk!;

    const doctorObjectId = Types.ObjectId.isValid(String(doctor._id))
      ? new Types.ObjectId(String(doctor._id))
      : null;

    const bookedSlots = doctorObjectId
      ? await Appointment.find({
          doctor: doctorObjectId,
          status: { $in: ["pending", "accepted"] },
        })
          .select({ appointmentDate: 1, startTime: 1, endTime: 1, status: 1 })
          .lean()
      : [];

    return NextResponse.json({
      success: true,
      doctor: {
        id: String(doctor._id),
        clerkId: doctor.clerkId || "",
        fullName: doctor.fullName || "",
        specialization: doctor.specialization || "",
        profilePicture: doctor.profilePicture || "",
        rating: doctor.rating ?? 0,
        consultationFee: doctor.consultationFee ?? 0,
        consultationModes: doctor.consultationModes ?? [],
        languages: doctor.languages ?? [],
        verified: doctor.verified ?? false,
        acceptsNewPatients: doctor.acceptsNewPatients ?? true,
        workingHours: doctor.workingHours ?? [],
        unavailableSlots: doctor.unavailableSlots ?? [],
        scheduleOverrides: doctor.scheduleOverrides ?? [],
        consultationDurationMinutes: doctor.consultationDurationMinutes ?? 60,
        clinicAddress: doctor.clinicAddress || "",
        bookedSlots: bookedSlots.map((slot) => ({
          date: new Date(slot.appointmentDate).toISOString().slice(0, 10),
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      },
    });
  } catch (error: unknown) {
    console.error("[doctor route] error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}