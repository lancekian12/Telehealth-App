"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  FileText,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Pill,
  Stethoscope,
} from "lucide-react";
import {
  AppointmentsResponse,
  Doctor,
  PatientResponse,
  Appointment,
  Patient,
  Prescription,
} from "@/types/medicalrecord";

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
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
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

function getDoctor(person: Appointment["doctor"] | undefined): Doctor | null {
  if (!person || typeof person === "string") return null;
  return person;
}

function getPatient(
  person: Appointment["patient"] | undefined,
): Patient | null {
  if (!person || typeof person === "string") return null;
  return person;
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      {children}
    </span>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          {icon}
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function AppointmentCard({
  appointment,
  active,
  onClick,
}: {
  appointment: Appointment;
  active: boolean;
  onClick: () => void;
}) {
  const doctor = getDoctor(appointment.doctor);
  const prescription = normalizePrescription(appointment.prescription);

  return (
    <button
      onClick={onClick}
      className={[
        "group w-full rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-primary/15 bg-white shadow-md"
          : "border-transparent bg-white hover:border-slate-200 hover:shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {formatDate(appointment.appointmentDate)}
          </h3>
          <p className="mt-1 truncate text-sm text-slate-500">
            {doctor?.fullName || "Unknown doctor"}
          </p>
        </div>

        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 group-hover:text-primary" />
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {appointment.status ? <Badge>{appointment.status}</Badge> : null}
        {appointment.consultationType === "video" ? <Badge>Video</Badge> : null}
        {appointment.consultationType === "in_person" ? (
          <Badge>In-person</Badge>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        {appointment.reasonForVisit || "No reason recorded."}
      </p>

      <p className="mt-2 text-xs text-slate-400">
        {formatTimeRange(appointment.startTime, appointment.endTime)}
      </p>

      {prescription?.medication ? (
        <p className="mt-2 text-xs text-slate-400">
          Prescription: {prescription.medication}
        </p>
      ) : null}
    </button>
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

export default function PatientMedicalRecordPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAppointments() {
      try {
        console.log("[MedicalRecord] useEffect started");
        setLoading(true);
        setError(null);

        console.log("[MedicalRecord] fetching /api/patient...");
        const patientRes = await fetch("/api/patient", {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        });

        console.log("[MedicalRecord] /api/patient status:", patientRes.status);

        const patientData = (await patientRes.json()) as PatientResponse;
        console.log("[MedicalRecord] /api/patient response:", patientData);

        if (!patientRes.ok || !patientData.success) {
          throw new Error(
            patientData.success
              ? "Failed to load patient"
              : patientData.message || "Failed to load patient",
          );
        }

        const patientId = String(
          patientData.patient?._id ||
            (patientData.patient as { id?: string })?.id ||
            "",
        );

        console.log("[MedicalRecord] resolved patientId:", patientId);

        setPatient(patientData.patient);

        if (!patientId) {
          console.error(
            "[MedicalRecord] missing patient id",
            patientData.patient,
          );
          setAppointments([]);
          setSelectedId("");
          return;
        }

        const appointmentsUrl = `/api/appointments?patientId=${encodeURIComponent(
          patientId,
        )}`;

        console.log("[MedicalRecord] fetching:", appointmentsUrl);

        const appointmentsRes = await fetch(appointmentsUrl, {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
        });

        console.log(
          "[MedicalRecord] /api/appointments status:",
          appointmentsRes.status,
        );

        const appointmentsData =
          (await appointmentsRes.json()) as AppointmentsResponse;
        console.log(
          "[MedicalRecord] /api/appointments response:",
          appointmentsData,
        );

        if (!appointmentsRes.ok || !appointmentsData.success) {
          throw new Error(
            appointmentsData.success
              ? "Failed to load appointments"
              : appointmentsData.message || "Failed to load appointments",
          );
        }

        const sorted = [...(appointmentsData.appointments || [])].sort(
          (a, b) => {
            const aDate = a.appointmentDate
              ? new Date(a.appointmentDate).getTime()
              : 0;
            const bDate = b.appointmentDate
              ? new Date(b.appointmentDate).getTime()
              : 0;
            if (bDate !== aDate) return bDate - aDate;
            return (b.startTime || "").localeCompare(a.startTime || "");
          },
        );

        const completedOnly = sorted.filter(
          (appt) => (appt.status || "").toLowerCase() === "completed",
        );

        console.log("[MedicalRecord] sorted appointments:", completedOnly);

        setAppointments(completedOnly);
        setSelectedId(String(completedOnly[0]?._id || ""));
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        console.error("[MedicalRecord] loadAppointments error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load appointments",
        );
      } finally {
        setLoading(false);
        console.log("[MedicalRecord] loading finished");
      }
    }

    void loadAppointments();

    return () => {
      console.log("[MedicalRecord] cleanup abort");
      controller.abort();
    };
  }, []);

  const selectedAppointment = useMemo(() => {
    if (!selectedId) return appointments[0] || null;
    return appointments.find((appt) => appt._id === selectedId) || null;
  }, [appointments, selectedId]);

  const selectedDoctor = getDoctor(selectedAppointment?.doctor);
  const selectedPrescription = normalizePrescription(
    selectedAppointment?.prescription,
  );
  const selectedPatient = getPatient(selectedAppointment?.patient) || patient;

  const totalVisits = appointments.length;
  const totalPrescriptions = appointments.filter((a) => a.prescription).length;

  async function handleBookAgain() {
    setSaving(true);

    try {
      router.push("/finddoctor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-6 pt-24 sm:px-6 lg:px-8">
        <header className="mb-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/appointments"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
                  Medical Record
                </p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Your medical record
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Select a completed visit on the left to see that day’s
                  prescription and doctor.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Visits
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Completed appointments
                </h2>
              </div>
              <Badge>{`${totalVisits} total`}</Badge>
            </div>

            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <Pill size={12} />
                {totalPrescriptions} with prescription
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading your visits...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                No completed appointments found.
              </div>
            ) : (
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-1">
                {appointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    active={appt._id === selectedId}
                    onClick={() => {
                      console.log(
                        "[MedicalRecord] selected appointment:",
                        appt._id,
                      );
                      setSelectedId(appt._id);
                    }}
                  />
                ))}
              </div>
            )}
          </aside>

          <section className="min-h-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex h-full min-h-[500px] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading medical record...
              </div>
            ) : error ? null : selectedAppointment ? (
              <div className="relative flex h-full flex-col">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-primary/10 via-slate-100 to-primary/5" />

                <div className="relative z-10 border-b border-slate-100 px-6 pb-6 pt-6 sm:px-8">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-5">
                      {selectedDoctor?.profilePicture ? (
                        <img
                          alt={selectedDoctor.fullName || "Doctor"}
                          className="h-24 w-24 rounded-3xl object-cover shadow-lg ring-4 ring-white"
                          src={selectedDoctor.profilePicture}
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-2xl font-bold text-slate-600 shadow-lg ring-4 ring-white">
                          {(selectedDoctor?.fullName || "DR")
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                      )}

                      <div className="pt-1">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                          {selectedDoctor?.fullName || "Unknown doctor"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedDoctor?.specialization || "Doctor"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedAppointment.status ? (
                            <Badge>{selectedAppointment.status}</Badge>
                          ) : null}
                          {selectedAppointment.consultationType === "video" ? (
                            <Badge>Video</Badge>
                          ) : null}
                          {selectedAppointment.consultationType ===
                          "in_person" ? (
                            <Badge>In-person</Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InfoTile
                      label="Date"
                      value={formatDate(selectedAppointment.appointmentDate)}
                    />
                    <InfoTile
                      label="Time"
                      value={formatTimeRange(
                        selectedAppointment.startTime,
                        selectedAppointment.endTime,
                      )}
                    />
                    <InfoTile
                      label="Status"
                      value={selectedAppointment.status || "—"}
                    />
                  </div>

                  <div className="mt-8 space-y-8">
                    <section>
                      <SectionTitle
                        icon={<Pill className="text-primary" />}
                        title="Prescription"
                        subtitle="Only the prescription from this visit."
                      />

                      {selectedPrescription ? (
                        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                          <InfoTile
                            label="Diagnosis"
                            value={selectedPrescription.diagnosis || "—"}
                          />
                          <InfoTile
                            label="Medication"
                            value={selectedPrescription.medication || "—"}
                          />
                          <InfoTile
                            label="Dosage"
                            value={selectedPrescription.dosage || "—"}
                          />
                          <InfoTile
                            label="Duration"
                            value={selectedPrescription.duration || "—"}
                          />
                          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Instructions
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedPrescription.instructions || "—"}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Notes
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedPrescription.notes || "—"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                          No prescription was attached to this appointment.
                        </div>
                      )}
                    </section>

                    <section>
                      <SectionTitle
                        icon={<FileText className="text-primary" />}
                        title="Who prescribed it"
                        subtitle="The doctor for the selected visit."
                      />

                      <div className="grid gap-4 sm:grid-cols-3">
                        <InfoTile
                          label="Doctor"
                          value={selectedDoctor?.fullName || "Unknown doctor"}
                        />
                        <InfoTile
                          label="Specialization"
                          value={selectedDoctor?.specialization || "—"}
                        />
                        <InfoTile
                          label="License"
                          value={selectedDoctor?.licenseNumber || "—"}
                        />
                      </div>

                      {selectedDoctor?.clinicAddress ? (
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Clinic address
                          </p>
                          <div className="mt-2 flex items-start gap-2 text-sm text-slate-700">
                            <MapPin
                              size={16}
                              className="mt-0.5 text-slate-400"
                            />
                            <span>{selectedDoctor.clinicAddress}</span>
                          </div>
                        </div>
                      ) : null}
                    </section>

                    <section>
                      <SectionTitle
                        icon={<Stethoscope className="text-primary" />}
                        title="History"
                        subtitle="Use the left side to jump between appointment days."
                      />

                      <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 to-slate-50 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-base font-bold text-slate-900">
                              Need another appointment?
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Rebook using your patient profile.
                            </p>
                          </div>

                          <button
                            onClick={handleBookAgain}
                            disabled={saving}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {saving ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Calendar size={16} />
                            )}
                            Book again
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[500px] items-center justify-center p-8 text-slate-500">
                Select an appointment to view its prescription.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
