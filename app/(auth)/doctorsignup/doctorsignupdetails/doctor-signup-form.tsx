"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, ChevronUp, UploadCloud } from "lucide-react";
import imageCompression from "browser-image-compression";

type ConsultationMode = "video" | "in_person";

type DoctorFormState = {
  fullName: string;
  specialization: string;
  bio: string;
  profilePicture: File | null;
  email: string;
  phone: string;
  licenseNumber: string;
  experienceYears: string;
  consultationFee: string;
  consultationModes: ConsultationMode[];
  languages: string;
  consultationDurationMinutes: string;
  clinicName: string;
  clinicStreetAddress: string;
  clinicBarangay: string;
  clinicCityMunicipality: string;
  clinicProvince: string;
  verified: boolean;
};

type DoctorFormErrors = Partial<Record<keyof DoctorFormState, string>> & {
  consultationModes?: string;
};

const accentSoft = "bg-[#008081]/10";
const neutralPage = "bg-white";

const initialForm: DoctorFormState = {
  fullName: "",
  specialization: "",
  bio: "",
  profilePicture: null,
  email: "",
  phone: "",
  licenseNumber: "",
  experienceYears: "0",
  consultationFee: "0",
  consultationModes: [],
  languages: "",
  consultationDurationMinutes: "60",
  clinicName: "",
  clinicStreetAddress: "",
  clinicBarangay: "",
  clinicCityMunicipality: "",
  clinicProvince: "",
  verified: false,
};

const MAX_FILE_MB = 5;

export default function DoctorSignupForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [form, setForm] = useState<DoctorFormState>(initialForm);
  const [errors, setErrors] = useState<DoctorFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const clerkEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const hasInPerson = form.consultationModes.includes("in_person");

  useEffect(() => {
    if (clerkEmail) {
      setForm((prev) => ({
        ...prev,
        email: clerkEmail,
      }));
    }
  }, [clerkEmail]);

  useEffect(() => {
    if (!hasInPerson) {
      setForm((prev) => ({
        ...prev,
        clinicName: "",
        clinicStreetAddress: "",
        clinicBarangay: "",
        clinicCityMunicipality: "",
        clinicProvince: "",
      }));
      setErrors((prev) => ({
        ...prev,
        clinicName: undefined,
        clinicStreetAddress: undefined,
        clinicBarangay: undefined,
        clinicCityMunicipality: undefined,
        clinicProvince: undefined,
      }));
    }
  }, [hasInPerson]);

  const setField = <K extends keyof DoctorFormState>(
    key: K,
    value: DoctorFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleConsultationMode = (mode: ConsultationMode) => {
    setForm((prev) => {
      const exists = prev.consultationModes.includes(mode);
      return {
        ...prev,
        consultationModes: exists
          ? prev.consultationModes.filter((item) => item !== mode)
          : [...prev.consultationModes, mode],
      };
    });
  };

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setField(name as keyof DoctorFormState, value as never);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    try {
      setCompressing(true);

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Please select a valid image file",
        }));
        return;
      }

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      });

      if (compressedFile.size > MAX_FILE_MB * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: `Image must be smaller than ${MAX_FILE_MB}MB`,
        }));
        return;
      }

      setField("profilePicture", compressedFile);
      setErrors((prev) => ({ ...prev, profilePicture: undefined }));
    } catch (error) {
      console.error("Image compression failed:", error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Failed to process image",
      }));
    } finally {
      setCompressing(false);
    }
  };

  const validate = () => {
    const nextErrors: DoctorFormErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!form.specialization.trim()) {
      nextErrors.specialization = "Specialization is required";
    }
    if (!form.bio.trim()) nextErrors.bio = "Bio is required";
    if (!form.profilePicture) {
      nextErrors.profilePicture = "Profile picture is required";
    }
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email";
    }
    if (!form.phone.trim()) nextErrors.phone = "Contact number is required";
    if (form.consultationModes.length === 0) {
      nextErrors.consultationModes = "Choose at least one consultation mode";
    }

    if (hasInPerson) {
      if (!form.clinicName.trim()) {
        nextErrors.clinicName = "Clinic name is required";
      }
      if (!form.clinicStreetAddress.trim()) {
        nextErrors.clinicStreetAddress = "Street / landmark is required";
      }
      if (!form.clinicBarangay.trim()) {
        nextErrors.clinicBarangay = "Barangay is required";
      }
      if (!form.clinicCityMunicipality.trim()) {
        nextErrors.clinicCityMunicipality = "City / municipality is required";
      }
      if (!form.clinicProvince.trim()) {
        nextErrors.clinicProvince = "Province is required";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(false);

    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", form.fullName.trim());
      formData.append("specialization", form.specialization.trim());
      formData.append("bio", form.bio.trim());
      formData.append("email", form.email.trim());
      formData.append("phone", form.phone.trim());
      formData.append("licenseNumber", form.licenseNumber.trim());
      formData.append("experienceYears", form.experienceYears || "0");
      formData.append("consultationFee", form.consultationFee || "0");
      formData.append(
        "consultationModes",
        JSON.stringify(form.consultationModes),
      );
      formData.append(
        "languages",
        JSON.stringify(
          form.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
      formData.append("consultationDurationMinutes", "60");
      formData.append("verified", String(form.verified));

      if (hasInPerson) {
        formData.append("clinicName", form.clinicName.trim());
        formData.append("clinicStreetAddress", form.clinicStreetAddress.trim());
        formData.append("clinicBarangay", form.clinicBarangay.trim());
        formData.append(
          "clinicCityMunicipality",
          form.clinicCityMunicipality.trim(),
        );
        formData.append("clinicProvince", form.clinicProvince.trim());
      }

      if (form.profilePicture) {
        formData.append("profilePicture", form.profilePicture);
      }

      const res = await fetch("/api/doctor", {
        method: "POST",
        body: formData,
      });

      const data: { success?: boolean; message?: string } = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save doctor profile");
      }

      setSubmitted(true);
      setForm(initialForm);
      router.push("/doctor/home");
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Upload failed. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const fieldBase =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm sm:text-base outline-none transition placeholder:text-slate-400 focus:border-[#008081]/40 focus:ring-4 focus:ring-[#008081]/10";
  const labelBase = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className={`min-h-[100dvh] ${neutralPage} text-slate-900`}>
      <div className="px-4 pt-4 sm:px-0 sm:pt-0 sm:fixed sm:top-6 sm:left-6 sm:z-50">
        <Link
          href="/doctorsignup"
          className="
            inline-flex w-auto items-center justify-center
            rounded-xl border border-slate-200
            bg-white px-3.5 py-2
            text-sm font-semibold text-slate-600
            shadow-sm
            hover:border-[#008081]/40 hover:text-[#008081]
            transition-all
          "
        >
          Back
        </Link>
      </div>

      <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col justify-start px-4 py-6 sm:justify-center sm:px-6 sm:py-12">
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center">
            <div
              className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${accentSoft}`}
            >
              <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7 text-[#008081]" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 uppercase">
            APPOINT <span className="text-[#81B641]">CARE</span>
          </h1>

          <div className="mt-4 sm:mt-5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#008081]">
              Doctor Profile Registration
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-500 px-2 sm:px-0">
              Set up your professional profile in a simple and clean way.
            </p>
          </div>

          <div className="mt-5 sm:mt-6 flex justify-center gap-2">
            <div className="h-1.5 w-10 sm:w-12 rounded-full bg-[#008081]/15" />
            <div className="h-1.5 w-10 sm:w-12 rounded-full bg-[#008081]" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8"
        >
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelBase} htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleTextChange}
                placeholder="Dr. Juan Dela Cruz"
                type="text"
                className={`${fieldBase} ${
                  errors.fullName
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : ""
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelBase} htmlFor="specialization">
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleTextChange}
                placeholder="Cardiology, Pediatrics, Dermatology..."
                type="text"
                className={`${fieldBase} ${
                  errors.specialization
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : ""
                }`}
              />
              {errors.specialization && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.specialization}
                </p>
              )}
            </div>

            <div>
              <label className={labelBase} htmlFor="phone">
                Contact Number
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleTextChange}
                placeholder="+63 900 000 0000"
                type="tel"
                className={`${fieldBase} ${
                  errors.phone
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : ""
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className={labelBase} htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleTextChange}
                placeholder="Write a short professional bio, experience, and expertise..."
                rows={5}
                className={`${fieldBase} resize-none ${
                  errors.bio
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : ""
                }`}
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-rose-600">{errors.bio}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className={labelBase} htmlFor="profilePicture">
                Profile Picture
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                onChange={handleFileChange}
                type="file"
                accept="image/*"
                className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-[#008081] file:px-3 file:py-2 file:text-white file:text-sm hover:border-[#008081]/40 sm:px-4 ${
                  errors.profilePicture ? "border-rose-500" : ""
                }`}
              />
              <p className="mt-1 text-xs text-slate-500">
                {compressing
                  ? "Compressing image..."
                  : "Image will be compressed before upload"}
              </p>
              {errors.profilePicture && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.profilePicture}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className={labelBase} htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                readOnly
                type="email"
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none text-sm sm:text-base"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="mt-5 sm:mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">
              Consultation Mode
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Choose only the modes you want to offer.
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => toggleConsultationMode("video")}
                className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto ${
                  form.consultationModes.includes("video")
                    ? "bg-[#008081] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-[#008081]/40"
                }`}
              >
                Video
              </button>

              <button
                type="button"
                onClick={() => toggleConsultationMode("in_person")}
                className={`w-full rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto ${
                  form.consultationModes.includes("in_person")
                    ? "bg-[#008081] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-[#008081]/40"
                }`}
              >
                In Person
              </button>
            </div>

            {errors.consultationModes && (
              <p className="mt-2 text-xs text-rose-600">
                {errors.consultationModes}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="mt-5 sm:mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#008081]"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Additional details
          </button>

          {showAdvanced && (
            <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
              <div>
                <label className={labelBase} htmlFor="licenseNumber">
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleTextChange}
                  placeholder="Optional"
                  type="text"
                  className={fieldBase}
                />
              </div>

              <div>
                <label className={labelBase}>Consultation Duration</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 text-sm sm:text-base">
                  60 minutes fixed
                </div>
              </div>

              <div>
                <label className={labelBase} htmlFor="experienceYears">
                  Experience (Years)
                </label>
                <input
                  id="experienceYears"
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleTextChange}
                  placeholder="0"
                  type="number"
                  min="0"
                  className={fieldBase}
                />
              </div>

              <div>
                <label className={labelBase} htmlFor="consultationFee">
                  Consultation Fee
                </label>
                <input
                  id="consultationFee"
                  name="consultationFee"
                  value={form.consultationFee}
                  onChange={handleTextChange}
                  placeholder="0"
                  type="number"
                  min="0"
                  className={fieldBase}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelBase} htmlFor="languages">
                  Languages Spoken
                </label>
                <input
                  id="languages"
                  name="languages"
                  value={form.languages}
                  onChange={handleTextChange}
                  placeholder="English, Tagalog"
                  type="text"
                  className={fieldBase}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separate with commas.
                </p>
              </div>

              {hasInPerson && (
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Clinic Location
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      This is required only for in-person consultation.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelBase} htmlFor="clinicName">
                        Clinic / Hospital Name
                      </label>
                      <input
                        id="clinicName"
                        name="clinicName"
                        value={form.clinicName}
                        onChange={handleTextChange}
                        placeholder="Sevidal Medical Clinic"
                        type="text"
                        className={`${fieldBase} ${
                          errors.clinicName
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                            : ""
                        }`}
                      />
                      {errors.clinicName && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.clinicName}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelBase} htmlFor="clinicStreetAddress">
                        Street / Building / Landmark
                      </label>
                      <input
                        id="clinicStreetAddress"
                        name="clinicStreetAddress"
                        value={form.clinicStreetAddress}
                        onChange={handleTextChange}
                        placeholder="Near town hall, beside pharmacy"
                        type="text"
                        className={`${fieldBase} ${
                          errors.clinicStreetAddress
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                            : ""
                        }`}
                      />
                      {errors.clinicStreetAddress && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.clinicStreetAddress}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelBase} htmlFor="clinicBarangay">
                        Barangay
                      </label>
                      <input
                        id="clinicBarangay"
                        name="clinicBarangay"
                        value={form.clinicBarangay}
                        onChange={handleTextChange}
                        placeholder="Sevidal"
                        type="text"
                        className={`${fieldBase} ${
                          errors.clinicBarangay
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                            : ""
                        }`}
                      />
                      {errors.clinicBarangay && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.clinicBarangay}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={labelBase}
                        htmlFor="clinicCityMunicipality"
                      >
                        City / Municipality
                      </label>
                      <input
                        id="clinicCityMunicipality"
                        name="clinicCityMunicipality"
                        value={form.clinicCityMunicipality}
                        onChange={handleTextChange}
                        placeholder="San Fabian"
                        type="text"
                        className={`${fieldBase} ${
                          errors.clinicCityMunicipality
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                            : ""
                        }`}
                      />
                      {errors.clinicCityMunicipality && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.clinicCityMunicipality}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelBase} htmlFor="clinicProvince">
                        Province
                      </label>
                      <input
                        id="clinicProvince"
                        name="clinicProvince"
                        value={form.clinicProvince}
                        onChange={handleTextChange}
                        placeholder="Pangasinan"
                        type="text"
                        className={`${fieldBase} ${
                          errors.clinicProvince
                            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                            : ""
                        }`}
                      />
                      {errors.clinicProvince && (
                        <p className="mt-1 text-xs text-rose-600">
                          {errors.clinicProvince}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading || compressing || !isLoaded}
              className="
                w-full rounded-xl bg-[#008081]
                py-4 font-bold text-white
                shadow-md shadow-[#008081]/10
                transition-all
                hover:brightness-110
                active:scale-[0.99]
                disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              {loading ? "Saving..." : compressing ? "Compressing..." : "Create Doctor Profile"}
            </button>
          </div>

          {submitted && (
            <div className="mt-4 text-center text-sm text-emerald-600">
              Doctor profile saved successfully.
            </div>
          )}
        </form>

        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?
            <Link
              className="ml-1 font-bold text-[#008081] hover:underline"
              href="/login"
            >
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}