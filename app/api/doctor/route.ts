// app/api/doctor/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import cloudinary from "@/config/cloudinary";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

    const fullName = String(formData.get("fullName") || "").trim();
    const specialization = String(formData.get("specialization") || "").trim();
    const bio = String(formData.get("bio") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const phone = String(formData.get("phone") || "").trim();

    const profilePicture = formData.get("profilePicture");
    let profilePictureUrl = "";

    if (profilePicture instanceof File && profilePicture.size > 0) {
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const base64 = buffer.toString("base64");
      const dataUri = `data:${profilePicture.type};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "appointcare/doctors",
      });

      profilePictureUrl = uploadResult.secure_url;
    }

    if (!fullName || !specialization || !bio || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "All required fields must be filled." },
        { status: 400 },
      );
    }

    const doctor = await Doctor.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        fullName,
        specialization,
        bio,
        email,
        phone,
        ...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Doctor profile saved successfully.",
        doctor,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("POST /api/doctor error:", error);

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
