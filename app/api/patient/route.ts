// app/api/patient/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Patient } from "@/models/patient";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const patient = await Patient.findOneAndUpdate(
      { clerkId: userId },
      { clerkId: userId, ...body },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}