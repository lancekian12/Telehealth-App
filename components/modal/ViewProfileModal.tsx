"use client";

import React from "react";

type Patient = {
  id: string;
  clerkId: string;
  role: string;
  fullName: string;
  profilePicture: string;
  email: string;
  phone: string;
  birthday: string;
  weight: string;
  height: string;
  basicMedicalHistory: string;
};

type ViewProfileModalProps = {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
};

function ProfileField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default function ViewProfileModal({
  open,
  onClose,
  patient,
}: ViewProfileModalProps) {
  if (!open || !patient) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Patient Profile
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={patient.profilePicture}
            alt={patient.fullName}
            className="h-28 w-28 rounded-full border-4 border-[#008081]/20 object-cover"
          />

          <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            {patient.fullName}
          </h3>

          <p className="text-slate-500">{patient.email}</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileField label="Role" value={patient.role} />
          <ProfileField label="Phone" value={patient.phone} />
          <ProfileField label="Birthday" value={patient.birthday} />
          <ProfileField label="Weight" value={patient.weight} />
          <ProfileField label="Height" value={patient.height} />
          <ProfileField label="Email" value={patient.email} />
        </div>

        <div className="mt-6">
          <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
            Medical History
          </h4>

          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
            {patient.basicMedicalHistory || "No medical history provided."}
          </div>
        </div>
      </div>
    </div>
  );
}
