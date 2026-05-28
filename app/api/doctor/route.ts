// app/api/doctor/route.ts

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import cloudinary from "@/config/cloudinary";

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

    const doctor = await Doctor.findOne({
      clerkId: userId,
      role: "doctor",
    }).lean();

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          message: "Doctor profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        doctor: {
          role: doctor.role,
          fullName: doctor.fullName,
          specialization: doctor.specialization,
          profilePicture: doctor.profilePicture || "",
          email: doctor.email,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("GET /api/doctor error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

function parseBoolean(
  value: FormDataEntryValue | null,
  fallback = false
) {
  if (value === null) return fallback;

  return String(value).toLowerCase() === "true";
}

function parseNumber(
  value: FormDataEntryValue | null,
  fallback = 0
) {
  if (value === null || value === "") return fallback;

  const num = Number(value);

  return Number.isFinite(num) ? num : fallback;
}

function parseStringArray(
  value: FormDataEntryValue | null
) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(String(value));

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {}

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJSON<T>(
  value: FormDataEntryValue | null,
  fallback: T
): T {
  if (!value) return fallback;

  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await req.formData();

    const fullName = String(
      formData.get("fullName") || ""
    ).trim();

    const specialization = String(
      formData.get("specialization") || ""
    ).trim();

    const bio = String(
      formData.get("bio") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    )
      .trim()
      .toLowerCase();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    if (
      !fullName ||
      !specialization ||
      !bio ||
      !email ||
      !phone
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All required fields must be filled.",
        },
        { status: 400 }
      );
    }

    const profilePicture =
      formData.get("profilePicture");

    let profilePictureUrl = "";

    if (
      profilePicture instanceof File &&
      profilePicture.size > 0
    ) {
      const buffer = Buffer.from(
        await profilePicture.arrayBuffer()
      );

      const base64 = buffer.toString("base64");

      const dataUri = `data:${profilePicture.type};base64,${base64}`;

      const uploadResult =
        await cloudinary.uploader.upload(dataUri, {
          folder: "appointcare/doctors",
        });

      profilePictureUrl =
        uploadResult.secure_url;
    }

    const doctorData = {
      clerkId: userId,

      role: "doctor",

      fullName,
      specialization,
      bio,
      email,
      phone,

      licenseNumber: String(
        formData.get("licenseNumber") || ""
      ).trim(),

      experienceYears: parseNumber(
        formData.get("experienceYears"),
        0
      ),

      rating: parseNumber(
        formData.get("rating"),
        0
      ),

      consultationFee: parseNumber(
        formData.get("consultationFee"),
        0
      ),

      consultationModes: parseStringArray(
        formData.get("consultationModes")
      ),

      languages: parseStringArray(
        formData.get("languages")
      ),

      verified: parseBoolean(
        formData.get("verified"),
        false
      ),

      acceptsNewPatients: parseBoolean(
        formData.get("acceptsNewPatients"),
        true
      ),

      workingHours: parseJSON(
        formData.get("workingHours"),
        []
      ),

      unavailableSlots: parseJSON(
        formData.get("unavailableSlots"),
        []
      ),

      consultationDurationMinutes: parseNumber(
        formData.get(
          "consultationDurationMinutes"
        ),
        30
      ),

      clinicAddress: String(
        formData.get("clinicAddress") || ""
      ).trim(),

      pushNotificationToken: String(
        formData.get(
          "pushNotificationToken"
        ) || ""
      ).trim(),

      ...(profilePictureUrl
        ? {
            profilePicture:
              profilePictureUrl,
          }
        : {}),
    };

    const doctor =
      await Doctor.findOneAndUpdate(
        {
          clerkId: userId,
        },
        doctorData,
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Doctor profile saved successfully.",
        doctor,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error(
      "POST /api/doctor error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}