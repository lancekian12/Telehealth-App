import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/config/mongodb";
import { Doctor } from "@/models/doctor";
import cloudinary from "@/config/cloudinary";

export const runtime = "nodejs";

function parseBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (value === null) return fallback;
  return String(value).toLowerCase() === "true";
}

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  if (value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function parseStringArray(value: FormDataEntryValue | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(String(value));
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // fallback below
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJSON<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

function parseWorkingHours(value: FormDataEntryValue | null) {
  const parsed = parseJSON<
    Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable?: boolean;
    }>
  >(value, []);

  return parsed
    .map((slot) => ({
      day: String(slot.day || "").trim(),
      startTime: String(slot.startTime || "").trim(),
      endTime: String(slot.endTime || "").trim(),
      isAvailable: slot.isAvailable ?? true,
    }))
    .filter((slot) => slot.day && slot.startTime && slot.endTime);
}

function parseUnavailableSlots(value: FormDataEntryValue | null) {
  const parsed = parseJSON<
    Array<{
      date: string | Date;
      startTime: string;
      endTime: string;
      reason?: string;
    }>
  >(value, []);

  return parsed
    .map((slot) => {
      const date = new Date(slot.date);

      return {
        date: Number.isNaN(date.getTime()) ? new Date() : date,
        startTime: String(slot.startTime || "").trim(),
        endTime: String(slot.endTime || "").trim(),
        reason: String(slot.reason || "Blocked").trim() || "Blocked",
      };
    })
    .filter((slot) => slot.startTime && slot.endTime);
}

function buildClinicAddress(parts: {
  clinicStreetAddress?: string;
  clinicBarangay?: string;
  clinicCityMunicipality?: string;
  clinicProvince?: string;
}) {
  return [
    parts.clinicStreetAddress,
    parts.clinicBarangay,
    parts.clinicCityMunicipality,
    parts.clinicProvince,
    "Philippines",
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
}

function buildGeocodeCandidates(parts: {
  clinicStreetAddress?: string;
  clinicBarangay?: string;
  clinicCityMunicipality?: string;
  clinicProvince?: string;
}) {
  const streetBarangayCityProvince = buildClinicAddress(parts);

  const barangayCityProvince = [
    parts.clinicBarangay,
    parts.clinicCityMunicipality,
    parts.clinicProvince,
    "Philippines",
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

  const cityProvince = [
    parts.clinicCityMunicipality,
    parts.clinicProvince,
    "Philippines",
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

  const provinceOnly = [parts.clinicProvince, "Philippines"]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");

  return [streetBarangayCityProvince, barangayCityProvince, cityProvince, provinceOnly].filter(Boolean);
}

async function geocodeAddress(address: string) {
  if (!address) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ph&q=${encodeURIComponent(
        address,
      )}`,
      {
        headers: {
          "User-Agent": "AppointCare/1.0",
          "Accept-Language": "en",
        },
      },
    );

    if (!response.ok) {
      console.error("Geocode request failed:", response.status, address);
      return null;
    }

    const data = await response.json();
    console.log("Geocode result for:", address, data);

    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  } catch (error) {
    console.error("Geocoding failed:", address, error);
    return null;
  }
}

async function geocodeWithFallbacks(parts: {
  clinicStreetAddress?: string;
  clinicBarangay?: string;
  clinicCityMunicipality?: string;
  clinicProvince?: string;
}) {
  const candidates = buildGeocodeCandidates(parts);

  for (const candidate of candidates) {
    const coordinates = await geocodeAddress(candidate);
    if (coordinates) return coordinates;
  }

  return null;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    const doctor = await Doctor.findOne({
      clerkId: userId,
      role: "doctor",
    }).lean();

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        doctor: {
          id: String(doctor._id),
          clerkId: doctor.clerkId,
          fullName: doctor.fullName || "",
          specialization: doctor.specialization || "",
          bio: doctor.bio || "",
          profilePicture: doctor.profilePicture || "",
          email: doctor.email || "",
          phone: doctor.phone || "",
          rating: doctor.rating ?? 0,
          consultationFee: doctor.consultationFee ?? 0,
          consultationModes: doctor.consultationModes ?? [],
          languages: doctor.languages ?? [],
          verified: doctor.verified ?? false,
          acceptsNewPatients: doctor.acceptsNewPatients ?? true,
          workingHours: doctor.workingHours ?? [],
          unavailableSlots: doctor.unavailableSlots ?? [],
          consultationDurationMinutes: doctor.consultationDurationMinutes ?? 60,
          clinicName: doctor.clinicName || "",
          clinicStreetAddress: doctor.clinicStreetAddress || "",
          clinicBarangay: doctor.clinicBarangay || "",
          clinicCityMunicipality: doctor.clinicCityMunicipality || "",
          clinicProvince: doctor.clinicProvince || "",
          clinicAddress: doctor.clinicAddress || "",
          latitude: doctor.latitude ?? null,
          longitude: doctor.longitude ?? null,
          createdAt: doctor.createdAt,
          updatedAt: doctor.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/doctor error:", error);

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

    if (!fullName || !specialization || !bio || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "All required fields must be filled.",
        },
        { status: 400 },
      );
    }

    const consultationModes = parseStringArray(
      formData.get("consultationModes"),
    );
    const hasInPerson = consultationModes.includes("in_person");

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

    const clinicName = hasInPerson
      ? String(formData.get("clinicName") || "").trim()
      : "";

    const clinicStreetAddress = hasInPerson
      ? String(formData.get("clinicStreetAddress") || "").trim()
      : "";

    const clinicBarangay = hasInPerson
      ? String(formData.get("clinicBarangay") || "").trim()
      : "";

    const clinicCityMunicipality = hasInPerson
      ? String(formData.get("clinicCityMunicipality") || "").trim()
      : "";

    const clinicProvince = hasInPerson
      ? String(formData.get("clinicProvince") || "").trim()
      : "";

    const clinicAddress = hasInPerson
      ? buildClinicAddress({
          clinicStreetAddress,
          clinicBarangay,
          clinicCityMunicipality,
          clinicProvince,
        })
      : "";

    const coordinates = hasInPerson
      ? await geocodeWithFallbacks({
          clinicStreetAddress,
          clinicBarangay,
          clinicCityMunicipality,
          clinicProvince,
        })
      : null;

    console.log("Clinic Address:", clinicAddress);
    console.log("Coordinates:", coordinates);

    const doctorData = {
      clerkId: userId,
      role: "doctor",

      fullName,
      specialization,
      bio,
      email,
      phone,

      licenseNumber: String(formData.get("licenseNumber") || "").trim(),
      experienceYears: parseNumber(formData.get("experienceYears"), 0),
      rating: parseNumber(formData.get("rating"), 0),
      consultationFee: parseNumber(formData.get("consultationFee"), 0),

      consultationModes,
      languages: parseStringArray(formData.get("languages")),

      verified: parseBoolean(formData.get("verified"), false),
      acceptsNewPatients: parseBoolean(
        formData.get("acceptsNewPatients"),
        true,
      ),

      workingHours: parseWorkingHours(formData.get("workingHours")),
      unavailableSlots: parseUnavailableSlots(formData.get("unavailableSlots")),

      consultationDurationMinutes: 60,

      clinicName,
      clinicStreetAddress,
      clinicBarangay,
      clinicCityMunicipality,
      clinicProvince,
      clinicAddress,

      latitude: coordinates?.latitude ?? null,
      longitude: coordinates?.longitude ?? null,

      pushNotificationToken: String(
        formData.get("pushNotificationToken") || "",
      ).trim(),

      ...(profilePictureUrl ? { profilePicture: profilePictureUrl } : {}),
    };

    const doctor = await Doctor.findOneAndUpdate(
      { clerkId: userId },
      { $set: doctorData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
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