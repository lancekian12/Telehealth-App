// components/PatientProfileButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, UserRound, Mail, BadgeInfo, Loader2, Eye } from "lucide-react";

type PatientProfile = {
  id: string;
  clerkId: string;
  role: string;
  fullName: string;
  profilePicture: string;
  email: string;
};

export default function PatientProfileButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchPatient = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/patient", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load profile");
        }

        setPatient(data.patient);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#008081] dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Eye className="h-4 w-4" />
        View Profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Patient Profile
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#008081]" />
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {!loading && !error && patient && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    {patient.profilePicture ? (
                      <img
                        src={patient.profilePicture}
                        alt={patient.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-8 w-8 text-slate-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {patient.fullName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {patient.role}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3 text-sm">
                    <BadgeInfo className="h-4 w-4 text-[#008081]" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Patient ID:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {patient.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-[#008081]" />
                    <span className="text-slate-500 dark:text-slate-400">
                      Email:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {patient.email || "No email set"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}