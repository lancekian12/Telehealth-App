"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  ShieldCheck,
  Stethoscope,
  Pill,
  ClipboardList,
  UserRound,
  Clock3,
  Info,
} from "lucide-react";

type Prescription = {
  diagnosis: string;
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
  notes: string;
};

type Appointment = {
  _id: string;
  doctor?: { fullName?: string } | string;
  patient?: { fullName?: string } | string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  prescription?: unknown;
  status?: string;
};

const initialPrescription: Prescription = {
  diagnosis: "",
  medication: "",
  dosage: "",
  duration: "",
  instructions: "",
  notes: "",
};

function normalizePrescription(value: unknown): Prescription {
  if (!value || typeof value !== "object") return initialPrescription;

  const p = value as Partial<Prescription>;

  return {
    diagnosis: p.diagnosis || "",
    medication: p.medication || "",
    dosage: p.dosage || "",
    duration: p.duration || "",
    instructions: p.instructions || "",
    notes: p.notes || "",
  };
}

function formatDate(dateValue?: string) {
  if (!dateValue) return "Not set";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(time?: string) {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatTimeRange(startTime?: string, endTime?: string) {
  if (!startTime && !endTime) return "—";
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
}

function getPersonName(person: Appointment["patient"] | Appointment["doctor"]) {
  if (!person || typeof person === "string") return "Unknown";
  return person.fullName || "Unknown";
}

function FieldCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function FinalizePrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [prescription, setPrescription] =
    useState<Prescription>(initialPrescription);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      setIsLoadingAppointment(false);
      return;
    }

    const controller = new AbortController();

    async function loadAppointment() {
      try {
        setIsLoadingAppointment(true);

        const res = await fetch(
          `/api/appointments?appointmentId=${appointmentId}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load appointment");
        }

        setAppointment(data.appointment || null);

        const sourcePrescription =
          data.appointment?.prescription ||
          data.prescription ||
          initialPrescription;

        setPrescription(normalizePrescription(sourcePrescription));
      } catch (error) {
        console.error(error);
        setSaveError(
          error instanceof Error ? error.message : "Failed to load appointment",
        );
      } finally {
        setIsLoadingAppointment(false);
      }
    }

    void loadAppointment();

    return () => controller.abort();
  }, [appointmentId]);

  const handleChange =
    (field: keyof Prescription) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSaveError(null);
      setSaveSuccess(false);
      setPrescription((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSavePrescription = async () => {
    if (!appointmentId) {
      setSaveError("Missing appointment id.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/prescription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescription,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save prescription");
      }

      setSaveSuccess(true);
      setAppointment(data.appointment || appointment);
      setPrescription(normalizePrescription(data.prescription || prescription));
    } catch (error) {
      console.error(error);
      setSaveError(
        error instanceof Error ? error.message : "Could not save prescription",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-20">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">

            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Prescription
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Edit and save prescription
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Fill in the final prescription here. Saving updates the same record
              and marks the appointment as completed.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[560px]">
            <FieldCard
              icon={<UserRound className="h-4 w-4" />}
              label="Patient"
              value={isLoadingAppointment ? "Loading..." : getPersonName(appointment?.patient)}
            />
            <FieldCard
              icon={<CalendarDays className="h-4 w-4" />}
              label="Consultation"
              value={
                isLoadingAppointment
                  ? "Loading..."
                  : `${formatDate(appointment?.appointmentDate)} • ${formatTimeRange(
                      appointment?.startTime,
                      appointment?.endTime,
                    )}`
              }
            />
            <FieldCard
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Status"
              value="Will complete on save"
            />
          </div>
        </div>

        {saveError ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{saveError}</p>
            </div>
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            Prescription saved successfully.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Prescription details
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Write clear instructions that are easy for the patient to follow.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Final record
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Diagnosis
                </span>
                <input
                  type="text"
                  value={prescription.diagnosis}
                  onChange={handleChange("diagnosis")}
                  placeholder="e.g. Acute sinusitis"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Pill className="h-4 w-4 text-primary" />
                  Medication
                </span>
                <input
                  type="text"
                  value={prescription.medication}
                  onChange={handleChange("medication")}
                  placeholder="e.g. Amoxicillin"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Dosage
                </span>
                <input
                  type="text"
                  value={prescription.dosage}
                  onChange={handleChange("dosage")}
                  placeholder="e.g. 500mg, 3x daily"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Duration
                </span>
                <input
                  type="text"
                  value={prescription.duration}
                  onChange={handleChange("duration")}
                  placeholder="e.g. 5 days"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:col-span-2">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <FileText className="h-4 w-4 text-primary" />
                  Instructions
                </span>
                <input
                  type="text"
                  value={prescription.instructions}
                  onChange={handleChange("instructions")}
                  placeholder="e.g. Take after meals"
                  className="mt-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:col-span-2">
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Info className="h-4 w-4 text-primary" />
                  Doctor notes
                </span>
                <textarea
                  value={prescription.notes}
                  onChange={handleChange("notes")}
                  placeholder="Extra reminders, warning signs, follow-up notes..."
                  rows={4}
                  className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </label>
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Live preview
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                This is how the final prescription reads.
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <PreviewRow label="Diagnosis" value={prescription.diagnosis} />
              <PreviewRow label="Medication" value={prescription.medication} />
              <PreviewRow label="Dosage" value={prescription.dosage} />
              <PreviewRow label="Duration" value={prescription.duration} />
              <PreviewRow label="Instructions" value={prescription.instructions} />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
                <Info className="h-4 w-4" />
                Notes
              </div>
              <p className="mt-2 text-sm leading-6 text-amber-900/90 dark:text-amber-100/90">
                {prescription.notes || "No notes added yet."}
              </p>
            </div>

            <button
              onClick={handleSavePrescription}
              disabled={isSaving || !appointmentId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save prescription"}
            </button>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              Saving updates the same finalized prescription and marks the booking
              as completed.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="max-w-[60%] truncate text-sm font-medium text-slate-900 dark:text-white">
        {value || "—"}
      </span>
    </div>
  );
}