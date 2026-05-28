// app/api/patient/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { connectDB } from "@/config/mongodb";
import { Patient } from "@/models/patient";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const patient = await Patient.findOne({
      clerkId: userId,
      role: "patient",
    }).lean();

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          message: "Patient not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        patient: {
          role: patient.role,
          fullName: patient.fullName,
          profilePicture:
            patient.profilePicture || "",
          email: patient.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const formData = await req.formData();

    const fullName = String(formData.get("fullName") || "");
    const birthday = String(formData.get("birthday") || "");
    const weight = String(formData.get("weight") || "");
    const height = String(formData.get("height") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const basicMedicalHistory = String(
      formData.get("basicMedicalHistory") || "",
    );
    const file = formData.get("profilePicture");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Profile picture is required" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadedImage = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "appointcare" },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Cloudinary upload failed"));
            resolve(result);
          },
        );

        stream.end(buffer);
      },
    );

    const patient = await Patient.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        fullName,
        birthday,
        weight,
        height,
        profilePicture: uploadedImage.secure_url,
        email,
        phone,
        basicMedicalHistory,
      },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
