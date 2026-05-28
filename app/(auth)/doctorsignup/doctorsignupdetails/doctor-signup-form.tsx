// app/(whatever)/doctor-signup/DoctorSignupForm.tsx
"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import type {
  DoctorConsultationMode,
  DoctorFormFields,
  WorkingHourInput,
  UnavailableSlotInput,
} from "@/types/doctor";
import { useDoctorStore } from "@/store/doctor-store";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function DoctorSignupForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const clerkEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const {
    form,
    errors,
    loading,
    submitted,
    setErrors,
    setLoading,
    setSubmitted,
    setEmailFromClerk,
    setProfilePicture,
    toggleConsultationMode,
    addWorkingHour,
    updateWorkingHour,
    removeWorkingHour,
    addUnavailableSlot,
    updateUnavailableSlot,
    removeUnavailableSlot,
    setField,
    resetForm,
  } = useDoctorStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (clerkEmail) {
      setEmailFromClerk(clerkEmail);
    }
  }, [clerkEmail, setEmailFromClerk]);

  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setField(name as keyof DoctorFormFields, value as never);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfilePicture(file);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof DoctorFormFields, string>> = {};

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
    if (form.workingHours.length === 0) {
      nextErrors.workingHours = "Add at least one working hour";
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
        JSON.stringify(form.consultationModes)
      );

      formData.append(
        "languages",
        JSON.stringify(
          form.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      );

      formData.append("workingHours", JSON.stringify(form.workingHours));
      formData.append("unavailableSlots", JSON.stringify(form.unavailableSlots));
      formData.append(
        "consultationDurationMinutes",
        form.consultationDurationMinutes || "30"
      );
      formData.append("clinicAddress", form.clinicAddress.trim());
      formData.append("verified", String(form.verified));

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
      resetForm();
      router.push("/doctor/home");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Link
        href="/doctorsignup"
        className="
          relative sm:fixed
          sm:top-6 sm:left-6
          mx-4 mt-4 sm:mt-0
          z-50 inline-flex items-center
          rounded-xl border border-slate-200
          bg-white px-4 py-2
          text-sm font-semibold text-slate-600
          shadow-sm
          hover:border-[#008081]/40 hover:text-[#008081]
          transition-all
        "
      >
        Back
      </Link>

      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#008081]/10">
              <UploadCloud className="h-7 w-7 text-[#008081]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">
            APPOINT <span className="text-[#81B641]">CARE</span>
          </h1>

          <div className="mt-5">
            <h2 className="text-2xl font-bold text-[#008081]">
              Doctor Profile Registration
            </h2>
            <p className="mt-2 text-slate-500">
              Set up your professional profile in a simple and clean way.
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-[#008081]/15" />
            <div className="h-1.5 w-12 rounded-full bg-[#008081]" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                className="mb-1.5 block text-sm font-medium text-slate-700"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleTextChange}
                placeholder="Dr. Juan Dela Cruz"
                type="text"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition placeholder:text-slate-400 ${
                  errors.fullName ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-slate-700"
                htmlFor="specialization"
              >
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleTextChange}
                placeholder="Cardiology, Pediatrics, Dermatology..."
                type="text"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition placeholder:text-slate-400 ${
                  errors.specialization
                    ? "border-rose-500"
                    : "border-slate-200"
                }`}
              />
              {errors.specialization && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.specialization}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-slate-700"
                htmlFor="phone"
              >
                Contact Number
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleTextChange}
                placeholder="+63 900 000 0000"
                type="tel"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition placeholder:text-slate-400 ${
                  errors.phone ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                className="mb-1.5 block text-sm font-medium text-slate-700"
                htmlFor="bio"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleTextChange}
                placeholder="Write a short professional bio, experience, and expertise..."
                rows={5}
                className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition placeholder:text-slate-400 ${
                  errors.bio ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-rose-600">{errors.bio}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                className="mb-1.5 block text-sm font-medium text-slate-700"
                htmlFor="profilePicture"
              >
                Profile Picture
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                onChange={handleFileChange}
                type="file"
                accept="image/*"
                className={`w-full rounded-xl border bg-white px-4 py-3 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#008081] file:px-4 file:py-2 file:text-white ${
                  errors.profilePicture ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.profilePicture && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.profilePicture}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                className="mb-1.5 block text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                readOnly
                type="email"
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Consultation Mode
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Choose only the modes you want to offer.
            </p>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toggleConsultationMode("video")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  form.consultationModes.includes("video")
                    ? "bg-[#008081] text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-[#008081]/40"
                }`}
              >
                Video
              </button>

              <button
                type="button"
                onClick={() => toggleConsultationMode("in_person")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  form.consultationModes.includes("in_person")
                    ? "bg-[#008081] text-white"
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
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#008081]"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Additional details
          </button>

          {showAdvanced && (
            <div className="mt-4 grid gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="licenseNumber"
                >
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleTextChange}
                  placeholder="Optional"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="experienceYears"
                >
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="consultationFee"
                >
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400"
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="consultationDurationMinutes"
                >
                  Consultation Duration (Minutes)
                </label>
                <input
                  id="consultationDurationMinutes"
                  name="consultationDurationMinutes"
                  value={form.consultationDurationMinutes}
                  onChange={handleTextChange}
                  placeholder="30"
                  type="number"
                  min="5"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="languages"
                >
                  Languages Spoken
                </label>
                <input
                  id="languages"
                  name="languages"
                  value={form.languages}
                  onChange={handleTextChange}
                  placeholder="English, Tagalog"
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Separate with commas.
                </p>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Working Hours
                    </label>
                    <p className="mt-1 text-xs text-slate-500">
                      Add your available days and times.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addWorkingHour}
                    className="inline-flex items-center gap-2 rounded-full border border-[#008081]/20 bg-white px-3 py-2 text-sm font-medium text-[#008081] hover:border-[#008081]/40"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.workingHours.map((slot, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Day
                          </label>
                          <select
                            value={slot.day}
                            onChange={(e) =>
                              updateWorkingHour(index, "day", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          >
                            {DAYS.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Start
                          </label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateWorkingHour(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            End
                          </label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateWorkingHour(index, "endTime", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateWorkingHour(index, "isAvailable", true)
                            }
                            className="flex-1 rounded-xl bg-[#008081] px-3 py-2 text-sm font-medium text-white"
                          >
                            Available
                          </button>

                          {form.workingHours.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeWorkingHour(index)}
                              className="rounded-xl border border-rose-200 px-3 py-2 text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {errors.workingHours && (
                  <p className="mt-2 text-xs text-rose-600">
                    {errors.workingHours}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Unavailable Slots
                    </label>
                    <p className="mt-1 text-xs text-slate-500">
                      Add breaks or blocked time.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addUnavailableSlot}
                    className="inline-flex items-center gap-2 rounded-full border border-[#008081]/20 bg-white px-3 py-2 text-sm font-medium text-[#008081] hover:border-[#008081]/40"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.unavailableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Date
                          </label>
                          <input
                            type="date"
                            value={slot.date}
                            onChange={(e) =>
                              updateUnavailableSlot(
                                index,
                                "date",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            Start
                          </label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              updateUnavailableSlot(
                                index,
                                "startTime",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-slate-600">
                            End
                          </label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              updateUnavailableSlot(
                                index,
                                "endTime",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <input
                            type="text"
                            value={slot.reason}
                            onChange={(e) =>
                              updateUnavailableSlot(
                                index,
                                "reason",
                                e.target.value
                              )
                            }
                            placeholder="Reason"
                            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeUnavailableSlot(index)}
                            className="rounded-xl border border-rose-200 px-3 py-2 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="clinicAddress"
                >
                  Clinic Address
                </label>
                <textarea
                  id="clinicAddress"
                  name="clinicAddress"
                  value={form.clinicAddress}
                  onChange={handleTextChange}
                  placeholder="Optional clinic address"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading || !isLoaded}
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
              {loading ? "Saving..." : "Create Doctor Profile"}
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
            <Link className="ml-1 font-bold text-primary hover:underline" href="/login">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}