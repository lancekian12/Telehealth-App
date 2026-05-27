"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { DoctorFormFields } from "@/types/doctor";


const initialForm: DoctorFormFields = {
  fullName: "",
  specialization: "",
  bio: "",
  profilePicture: null,
  email: "",
  phone: "",
};

export default function DoctorSignupForm() {
  const { user } = useUser();
  const clerkEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const router = useRouter();

  const [form, setForm] = useState<DoctorFormFields>({
    ...initialForm,
    email: clerkEmail,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof DoctorFormFields, string>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm((p) => ({ ...p, profilePicture: file }));
    setErrors((p) => ({ ...p, profilePicture: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof DoctorFormFields, string>> = {};

    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.specialization.trim()) e.specialization = "Specialization is required";
    if (!form.bio.trim()) e.bio = "Bio is required";
    if (!form.profilePicture) e.profilePicture = "Profile picture is required";
    if (!clerkEmail.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clerkEmail))
      e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Contact number is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(false);

    if (!validate()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("specialization", form.specialization);
      formData.append("bio", form.bio);
      formData.append("email", clerkEmail);
      formData.append("phone", form.phone);

      if (form.profilePicture) {
        formData.append("profilePicture", form.profilePicture);
      }

      const res = await fetch("/api/doctor", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save doctor profile");
      }

      setSubmitted(true);
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light text-slate-900 min-h-screen flex flex-col">
      <Link
        href="/signup"
        className="
          relative sm:fixed
          sm:top-6 sm:left-6
          mx-4 mt-4 sm:mt-0
          z-50
          rounded-lg border border-slate-200
          bg-white px-4 py-2
          text-sm font-semibold text-slate-600
          shadow-sm
          hover:border-[#008081]/40 hover:text-[#008081]
          transition-all
          inline-flex items-center
        "
      >
        Back
      </Link>

      <main
        className="
          flex-grow flex flex-col
          items-center
          justify-start sm:justify-center
          w-full max-w-lg mx-auto
          px-4 py-8 sm:py-12
        "
      >
        <div className="text-center mb-10">
          <div className="flex flex-col items-center gap-2">
            <div className="text-primary flex items-center justify-center">
              <span
                className="material-icons text-[#008081]"
                style={{ fontSize: "50px" }}
              >
                medical_services
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">
              APPOINT <span className="text-[#81B641]">CARE</span>
            </h1>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-[#008081] mb-2">
              Doctor Profile Registration
            </h2>
            <p className="text-slate-500">
              Set up your professional profile and specialization
            </p>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <div className="h-1.5 w-12 rounded-full bg-[#008081]/15"></div>
            <div className="h-1.5 w-12 rounded-full bg-[#008081]"></div>
          </div>
        </div>

        <div className="w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="fullName"
              >
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Dr. Juan Dela Cruz"
                type="text"
                className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-700 focus:outline-none transition placeholder:text-slate-400 ${
                  errors.fullName ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="specialization"
              >
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Cardiology, Pediatrics, Dermatology..."
                type="text"
                className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-700 focus:outline-none transition placeholder:text-slate-400 ${
                  errors.specialization ? "border-rose-500" : "border-slate-200"
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
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="bio"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Write a short professional bio, experience, and expertise..."
                rows={5}
                className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-700 focus:outline-none transition placeholder:text-slate-400 resize-none ${
                  errors.bio ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-rose-600">{errors.bio}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
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
                className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-700 focus:outline-none transition file:mr-4 file:rounded-md file:border-0 file:bg-[#008081] file:px-4 file:py-2 file:text-white ${
                  errors.profilePicture ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.profilePicture && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.profilePicture}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                value={clerkEmail}
                readOnly
                type="email"
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1.5"
                htmlFor="phone"
              >
                Contact Number
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+63 900 000 0000"
                type="tel"
                className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-700 focus:outline-none transition placeholder:text-slate-400 ${
                  errors.phone ? "border-rose-500" : "border-slate-200"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full bg-[#008081]
                  text-white py-4
                  rounded-lg
                  font-bold text-base
                  active:scale-[0.99]
                  hover:brightness-110
                  transition-all
                  shadow-md shadow-primary/10
                  disabled:opacity-70
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

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?
              <a
                className="text-primary font-bold hover:underline ml-1"
                href="#"
              >
                Log In
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}