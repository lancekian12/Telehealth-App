"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import {
  Cake,
  Camera,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  Phone,
  Ruler,
  Weight,
  X,
} from "lucide-react";
import type { Patient } from "@/types/patient";

type ViewProfileModalProps = {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
  onUpdated?: (patient: Patient) => void;
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm dark:bg-slate-700">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default function ViewProfileModal({
  open,
  onClose,
  patient,
  onUpdated,
}: ViewProfileModalProps) {
  const { user } = useUser();
  const [tab, setTab] = useState<Tab>("profile");
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    weight: "",
    height: "",
    basicMedicalHistory: "",
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
    if (!patient) return;
    setForm({
      fullName: patient.fullName || "",
      phone: patient.phone || "",
      weight: patient.weight || "",
      height: patient.height || "",
      basicMedicalHistory: patient.basicMedicalHistory || "",
    });
  }, [patient]);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setTab("profile");
      setSaveError(null);
      setSaveSuccess(false);
      setPasswordError(null);
      setPasswordSuccess(false);
      setAvatarFile(null);
      setAvatarPreview("");
    }
  }, [open]);

  if (!open || !patient) return null;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const body = new FormData();
      body.set("fullName", form.fullName);
      body.set("phone", form.phone);
      body.set("weight", form.weight);
      body.set("height", form.height);
      body.set("basicMedicalHistory", form.basicMedicalHistory);
      if (avatarFile) body.set("profilePicture", avatarFile);

      const res = await fetch("/api/patient", { method: "PATCH", body });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save changes");
      }

      onUpdated?.(data.patient);
      setSaveSuccess(true);
      setEditing(false);
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

  const avatarUrl = avatarPreview || patient.profilePicture || "";

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-[30px] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
      >
        <div className="relative bg-gradient-to-br from-primary/10 via-white to-secondary/10 px-6 pb-6 pt-6 dark:from-primary/15 dark:via-slate-900 dark:to-secondary/10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-white/70 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={patient.fullName || "Patient"}
                  className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-slate-800"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-primary/10 text-xl font-bold text-primary shadow-lg dark:border-slate-800">
                  {initials(patient.fullName || "P")}
                </span>
              )}
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:opacity-90"
                  aria-label="Change photo"
                >
                  <Camera size={14} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                {patient.fullName || "Patient"}
              </h2>
              <p className="truncate text-sm text-slate-500">{patient.email}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-2 rounded-full bg-white/70 p-1 dark:bg-slate-800/70">
            <button
              onClick={() => setTab("profile")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "profile"
                  ? "bg-white text-primary shadow-sm dark:bg-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setTab("security")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "security"
                  ? "bg-white text-primary shadow-sm dark:bg-slate-900"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Security
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {tab === "profile" ? (
            editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Full name
                  </span>
                  <input
                    value={form.fullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Phone
                    </span>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Weight
                    </span>
                    <input
                      value={form.weight}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, weight: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Height
                    </span>
                    <input
                      value={form.height}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, height: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Medical history
                  </span>
                  <textarea
                    value={form.basicMedicalHistory}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        basicMedicalHistory: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
                  />
                </label>

                {saveError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {saveError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 size={16} />
                    Profile updated successfully.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoRow icon={<Mail size={16} />} label="Email" value={patient.email} />
                  <InfoRow icon={<Phone size={16} />} label="Phone" value={patient.phone} />
                  <InfoRow icon={<Cake size={16} />} label="Birthday" value={patient.birthday} />
                  <InfoRow icon={<Ruler size={16} />} label="Height" value={patient.height} />
                  <InfoRow icon={<Weight size={16} />} label="Weight" value={patient.weight} />
                </div>

                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <HeartPulse size={13} />
                    Medical history
                  </p>
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {patient.basicMedicalHistory || "No medical history provided."}
                  </p>
                </div>

                <button
                  onClick={() => setEditing(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Edit3 size={16} />
                  Edit profile
                </button>
              </div>
            )
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
              >
                {passwordLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Lock size={16} />
                )}
                Update password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
