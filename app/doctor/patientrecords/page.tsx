"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BarChart2,
  Calendar,
  Clock,
  Edit3,
  FileText,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Pill,
  Save,
  Search,
  Stethoscope,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  ApiResponse,
  Appointment,
  Patient,
  Prescription,
  SavePrescriptionResponse,
} from "@/types/prescription";

function emptyPrescription(): Prescription {
  return {
    diagnosis: "",
    medication: "",
    dosage: "",
    duration: "",
    instructions: "",
    notes: "",
  };
}

function getPersonName(person: Appointment["patient"] | undefined) {
  if (!person || typeof person === "string") return "Unknown";
  return person.fullName || "Unknown";
}

function formatDate(dateValue?: string) {
  if (!dateValue) return "—";
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

function normalizePrescription(value: unknown): Prescription | null {
  if (!value || typeof value !== "object") return null;

  const p = value as Prescription;

  return {
    diagnosis: p.diagnosis || "",
    medication: p.medication || "",
    dosage: p.dosage || "",
    duration: p.duration || "",
    instructions: p.instructions || "",
    notes: p.notes || "",
    status: p.status || "",
    isFinalized: Boolean(p.isFinalized),
  };
}

function buildMeta(patient: Patient | undefined) {
  if (!patient) return "Unknown patient";
  const parts: string[] = [];

  if (patient.email) parts.push(patient.email);
  if (patient.phone) parts.push(patient.phone);
  if (patient.basicMedicalHistory) parts.push(patient.basicMedicalHistory);

  return parts.length ? parts.join(" • ") : "No extra details";
}

function getAppointmentTags(appointment: Appointment) {
  const tags: string[] = [];

  if (appointment.status) tags.push(appointment.status);
  if (appointment.consultationType === "video") tags.push("Video");
  if (appointment.consultationType === "in_person") tags.push("In-person");

  return tags;
}

function PatientCard({
  patient,
  active,
  onClick,
}: {
  patient: PatientRow;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-primary/15 bg-white shadow-md"
          : "border-transparent bg-white hover:border-slate-200 hover:shadow-sm",
      ].join(" ")}
    >
      {patient.avatar ? (
        <img
          alt={patient.name}
          src={patient.avatar}
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
          {patient.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-bold text-slate-900">
              {patient.name}
            </h3>
            <p className="truncate text-sm text-slate-500">{patient.meta}</p>
          </div>

          <span className="shrink-0 text-xs font-semibold text-slate-400">
            {patient.lastSeen || patient.status || "—"}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {patient.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <MoreVertical className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-primary" />
    </button>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function DetailItem({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{value}</p>
      </div>
    </div>
  );
}

function PrescriptionField({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
      )}
    </label>
  );
}

type PatientRow = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  status: string;
  meta: string;
  tags: string[];
  lastSeen: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  consultationType?: Appointment["consultationType"];
  reasonForVisit?: string;
  notes?: string;
  prescription: Prescription | null;
  lastAppointment: Appointment;
};

export default function DoctorPatientRecord() {
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId") || "";

  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [editingPrescription, setEditingPrescription] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [prescriptionForm, setPrescriptionForm] =
    useState<Prescription>(emptyPrescription());

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppointments() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (doctorId) params.set("doctorId", doctorId);

        const res = await fetch(
          `/api/appointments${params.toString() ? `?${params.toString()}` : ""}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data = (await res.json()) as ApiResponse;

        if (!res.ok || !data.success) {
          throw new Error(
            data.success
              ? "Failed to load records"
              : data.message || "Failed to load records",
          );
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load records");
      } finally {
        setLoading(false);
      }
    }

    void loadAppointments();

    return () => controller.abort();
  }, [doctorId]);

  const patientRows = useMemo(() => {
    return appointments
      .map((appointment) => {
        const patient =
          appointment.patient && typeof appointment.patient !== "string"
            ? appointment.patient
            : undefined;

        const normalizedPrescription = normalizePrescription(
          appointment.prescription,
        );

        const row: PatientRow = {
          id: appointment._id,
          name: getPersonName(appointment.patient),
          avatar: patient?.profilePicture || "",
          email: patient?.email || "",
          phone: patient?.phone || "",
          status: appointment.status || "Unknown",
          meta: buildMeta(patient),
          tags: getAppointmentTags(appointment),
          lastSeen: appointment.appointmentDate
            ? formatDate(appointment.appointmentDate)
            : "—",
          appointmentDate: appointment.appointmentDate,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          consultationType: appointment.consultationType,
          reasonForVisit: appointment.reasonForVisit || "",
          notes: appointment.notes || "",
          prescription: normalizedPrescription,
          lastAppointment: appointment,
        };

        return row;
      })
      .sort((a, b) => {
        const aDate = a.appointmentDate
          ? new Date(a.appointmentDate).getTime()
          : 0;
        const bDate = b.appointmentDate
          ? new Date(b.appointmentDate).getTime()
          : 0;

        if (aDate !== bDate) return bDate - aDate;
        return (b.startTime || "").localeCompare(a.startTime || "");
      });
  }, [appointments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patientRows;

    return patientRows.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.meta.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.reasonForVisit || "").toLowerCase().includes(q) ||
        (p.prescription?.diagnosis || "").toLowerCase().includes(q) ||
        (p.prescription?.medication || "").toLowerCase().includes(q)
      );
    });
  }, [query, patientRows]);

  const safeSelected = Math.min(selected, Math.max(filtered.length - 1, 0));
  const patient = filtered[safeSelected] ?? null;
  const currentAppointmentId = patient?.lastAppointment?._id || "";

  useEffect(() => {
    setSelected(0);
  }, [query]);

  useEffect(() => {
    setEditingPrescription(false);
    setSaveMessage(null);
    setSaveError(null);
    setPrescriptionForm({
      diagnosis: patient?.prescription?.diagnosis || "",
      medication: patient?.prescription?.medication || "",
      dosage: patient?.prescription?.dosage || "",
      duration: patient?.prescription?.duration || "",
      instructions: patient?.prescription?.instructions || "",
      notes: patient?.prescription?.notes || "",
    });
  }, [patient?.id]);

  async function handleSavePrescription() {
    if (!currentAppointmentId) {
      setSaveError("Missing appointment ID.");
      return;
    }

    try {
      setSavingPrescription(true);
      setSaveError(null);
      setSaveMessage(null);

      const res = await fetch(
        `/api/appointments/${currentAppointmentId}/prescription`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prescriptionForm),
        },
      );

      const data = (await res.json()) as SavePrescriptionResponse;

      if (!res.ok || !data.success) {
        throw new Error(
          data.success
            ? "Failed to save prescription"
            : data.message || "Failed to save prescription",
        );
      }

      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === currentAppointmentId
            ? data.appointment
              ? data.appointment
              : {
                  ...appt,
                  prescription: data.prescription,
                  status: "completed",
                }
            : appt,
        ),
      );

      setEditingPrescription(false);
      setSaveMessage("Prescription saved successfully.");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save prescription",
      );
    } finally {
      setSavingPrescription(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
              Patient Records
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Appointments and prescriptions
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Every appointment is shown separately, even for the same patient.
            </p>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
                placeholder="Search by name, ID, diagnosis..."
                type="text"
              />
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Loading patient records...
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No patient records found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((p, i) => (
                    <PatientCard
                      key={p.id}
                      patient={p}
                      active={i === safeSelected}
                      onClick={() => setSelected(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {!patient ? (
              <div className="flex h-full min-h-[500px] items-center justify-center p-8 text-slate-500">
                Select an appointment record to view details.
              </div>
            ) : (
              <div className="relative flex h-full flex-col">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-primary/10 via-slate-100 to-primary/5" />

                <div className="relative z-10 border-b border-slate-100 px-6 pb-6 pt-6 sm:px-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-5">
                      {patient.avatar ? (
                        <img
                          alt={patient.name}
                          className="h-24 w-24 rounded-3xl object-cover shadow-lg ring-4 ring-white"
                          src={patient.avatar}
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-2xl font-bold text-slate-600 shadow-lg ring-4 ring-white">
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}

                      <div className="pt-1">
                        <h2 className="text-3xl font-bold tracking-tight">
                          {patient.name}
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                          {patient.meta}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {patient.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {patient.phone ? (
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                          <Phone size={16} />
                          Call
                        </button>
                      ) : null}

                      {patient.email ? (
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                          <Mail size={16} />
                          Email
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InfoCard
                      label="Appointment date"
                      value={formatDate(patient.appointmentDate)}
                    />
                    <InfoCard
                      label="Consultation"
                      value={
                        patient.consultationType === "video"
                          ? "Video"
                          : patient.consultationType === "in_person"
                            ? "In-person"
                            : "—"
                      }
                    />
                    <InfoCard
                      label="Status"
                      value={patient.lastAppointment?.status || "—"}
                    />
                  </div>

                  <div className="mt-8 space-y-8">
                    <section>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold">
                          <Clock className="text-primary" />
                          Appointment details
                        </h3>
                        <span className="text-xs text-slate-400">
                          {formatDate(patient.appointmentDate)}
                        </span>
                      </div>

                      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                        <DetailItem
                          icon={<Calendar size={16} />}
                          title="Schedule"
                          value={formatTimeRange(
                            patient.startTime,
                            patient.endTime,
                          )}
                        />
                        <DetailItem
                          icon={<BarChart2 size={16} />}
                          title="Visit type"
                          value={
                            patient.consultationType === "video"
                              ? "Video consultation"
                              : patient.consultationType === "in_person"
                                ? "In-person visit"
                                : "—"
                          }
                        />
                      </div>
                    </section>

                    <section>
                      <div className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <Stethoscope className="text-primary" />
                        Visit details
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Reason for visit
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {patient.reasonForVisit || "No reason recorded."}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Notes
                          </p>
                          <p className="mt-1 text-sm text-slate-700">
                            {patient.notes || "No notes recorded."}
                          </p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-lg font-bold">
                          <Pill className="text-primary" />
                          Prescription
                        </div>

                        {!editingPrescription ? (
                          <button
                            onClick={() => setEditingPrescription(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            <Edit3 size={16} />
                            {patient.prescription
                              ? "Edit prescription"
                              : "Add prescription"}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingPrescription(false);
                                setSaveError(null);
                                setSaveMessage(null);
                                setPrescriptionForm({
                                  diagnosis:
                                    patient.prescription?.diagnosis || "",
                                  medication:
                                    patient.prescription?.medication || "",
                                  dosage: patient.prescription?.dosage || "",
                                  duration:
                                    patient.prescription?.duration || "",
                                  instructions:
                                    patient.prescription?.instructions || "",
                                  notes: patient.prescription?.notes || "",
                                });
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              <X size={16} />
                              Cancel
                            </button>

                            <button
                              onClick={handleSavePrescription}
                              disabled={savingPrescription}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {savingPrescription ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Save size={16} />
                              )}
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      {saveError ? (
                        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                          {saveError}
                        </div>
                      ) : null}

                      {saveMessage ? (
                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                          {saveMessage}
                        </div>
                      ) : null}

                      {editingPrescription ? (
                        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                          <PrescriptionField
                            label="Diagnosis"
                            value={prescriptionForm.diagnosis || ""}
                            onChange={(value) =>
                              setPrescriptionForm((prev) => ({
                                ...prev,
                                diagnosis: value,
                              }))
                            }
                            placeholder="Enter diagnosis"
                          />
                          <PrescriptionField
                            label="Medication"
                            value={prescriptionForm.medication || ""}
                            onChange={(value) =>
                              setPrescriptionForm((prev) => ({
                                ...prev,
                                medication: value,
                              }))
                            }
                            placeholder="Enter medication"
                          />
                          <PrescriptionField
                            label="Dosage"
                            value={prescriptionForm.dosage || ""}
                            onChange={(value) =>
                              setPrescriptionForm((prev) => ({
                                ...prev,
                                dosage: value,
                              }))
                            }
                            placeholder="Enter dosage"
                          />
                          <PrescriptionField
                            label="Duration"
                            value={prescriptionForm.duration || ""}
                            onChange={(value) =>
                              setPrescriptionForm((prev) => ({
                                ...prev,
                                duration: value,
                              }))
                            }
                            placeholder="Enter duration"
                          />
                          <div className="sm:col-span-2">
                            <PrescriptionField
                              label="Instructions"
                              value={prescriptionForm.instructions || ""}
                              onChange={(value) =>
                                setPrescriptionForm((prev) => ({
                                  ...prev,
                                  instructions: value,
                                }))
                              }
                              placeholder="Enter instructions"
                              textarea
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <PrescriptionField
                              label="Notes"
                              value={prescriptionForm.notes || ""}
                              onChange={(value) =>
                                setPrescriptionForm((prev) => ({
                                  ...prev,
                                  notes: value,
                                }))
                              }
                              placeholder="Enter notes"
                              textarea
                            />
                          </div>
                        </div>
                      ) : patient.prescription ? (
                        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                          <DetailItem
                            icon={<FileText size={16} />}
                            title="Diagnosis"
                            value={patient.prescription.diagnosis || "—"}
                          />
                          <DetailItem
                            icon={<Pill size={16} />}
                            title="Medication"
                            value={patient.prescription.medication || "—"}
                          />
                          <DetailItem
                            icon={<FileText size={16} />}
                            title="Dosage"
                            value={patient.prescription.dosage || "—"}
                          />
                          <DetailItem
                            icon={<Clock size={16} />}
                            title="Duration"
                            value={patient.prescription.duration || "—"}
                          />
                          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Instructions
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {patient.prescription.instructions || "—"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Notes
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              {patient.prescription.notes || "—"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                          No prescription attached yet. Click{" "}
                          <span className="font-semibold">Add prescription</span>{" "}
                          to create one.
                        </div>
                      )}
                    </section>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-white px-6 py-2 sm:px-8">
                  <div className="flex">
                    <span className="ml-auto text-xs text-slate-400">
                      Appointment ID: {patient.id}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}