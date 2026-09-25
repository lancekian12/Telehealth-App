"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MapPin,
  Stethoscope,
  User,
} from "lucide-react";

type DoctorProfile = {
  fullName: string;
  specialization: string;
  bio: string;
  phone: string;
  consultationFee: number;
  languages: string[];
  clinicName: string;
  clinicAddress: string;
  profilePicture: string;
};

type Tab = "profile" | "security";

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function DoctorSettingsClient() {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("profile");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    specialization: "",
    bio: "",
    consultationFee: "",
    languages: "",
    clinicName: "",
    clinicAddress: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/doctor", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success) {
          const d = data.doctor as DoctorProfile;
          setProfile(d);
          setForm({
            fullName: d.fullName || "",
            phone: d.phone || "",
            specialization: d.specialization || "",
            bio: d.bio || "",
            consultationFee: String(d.consultationFee ?? ""),
            languages: (d.languages || []).join(", "),
            clinicName: d.clinicName || "",
            clinicAddress: d.clinicAddress || "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const body = new FormData();
      body.set("fullName", form.fullName);
      body.set("phone", form.phone);
      body.set("specialization", form.specialization);
      body.set("bio", form.bio);
      body.set("consultationFee", form.consultationFee);
      body.set("languages", JSON.stringify(
        form.languages.split(",").map((l) => l.trim()).filter(Boolean),
      ));
      body.set("clinicName", form.clinicName);
      body.set("clinicAddress", form.clinicAddress);
      if (avatarFile) body.set("profilePicture", avatarFile);

      const res = await fetch("/api/doctor", { method: "PATCH", body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save changes");
      }

      setProfile((prev) => (prev ? { ...prev, ...data.doctor } : data.doctor));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match");
      return;
    }

    if (!user) {
      setPasswordError("Your session isn't ready yet — try again in a moment");
      return;
    }

    setPasswordLoading(true);
    try {
      await user.updatePassword({
        newPassword,
        currentPassword: user.passwordEnabled ? currentPassword : undefined,
      });

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors?: { message?: string }[] }).errors?.[0]?.message
          : undefined;
      setPasswordError(message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  }

  const avatarUrl = avatarPreview || profile?.profilePicture || "";

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-slate-500">
          Update your profile details and account security.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
            <button
              onClick={() => setTab("profile")}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === "profile"
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User size={17} />
              Profile
            </button>
            <button
              onClick={() => setTab("security")}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
                tab === "security"
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Lock size={17} />
              Security
            </button>
          </aside>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 size={22} className="animate-spin text-primary" />
              </div>
            ) : tab === "profile" ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={form.fullName}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                        {initials(form.fullName)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:opacity-90"
                      aria-label="Change photo"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{form.fullName}</p>
                    <p className="text-sm text-slate-500">{profile?.phone}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <User size={12} /> Full name
                    </span>
                    <input
                      value={form.fullName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fullName: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Phone
                    </span>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Stethoscope size={12} /> Specialization
                    </span>
                    <input
                      value={form.specialization}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, specialization: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Briefcase size={12} /> Consultation fee (₱)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={form.consultationFee}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          consultationFee: e.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <MapPin size={12} /> Clinic name
                    </span>
                    <input
                      value={form.clinicName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clinicName: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Clinic address
                    </span>
                    <input
                      value={form.clinicAddress}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clinicAddress: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Languages (comma separated)
                    </span>
                    <input
                      value={form.languages}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, languages: e.target.value }))
                      }
                      placeholder="English, Tagalog"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Bio
                    </span>
                    <textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                      rows={4}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                </div>

                {saveError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 size={16} />
                    Profile updated successfully.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save changes
                </button>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="max-w-sm space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <Lock size={18} className="text-primary" />
                  Change password
                </h2>

                {user?.passwordEnabled && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Current password
                    </span>
                    <input
                      type={showPasswords ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    New password
                  </span>
                  <input
                    type={showPasswords ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Confirm new password
                  </span>
                  <input
                    type={showPasswords ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowPasswords((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary"
                >
                  {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPasswords ? "Hide passwords" : "Show passwords"}
                </button>

                {passwordError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 size={16} />
                    Password updated successfully.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                  Update password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
