"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  MessageSquareText,
  MoreHorizontal,
  Pill,
  Stethoscope,
  Video,
} from "lucide-react";

type AppointmentStatus = "upcoming" | "completed";
type AppointmentType = "online" | "clinic";

type Appointment = {
  id: string;
  time: string;
  status: AppointmentStatus;
  type: AppointmentType;
  patientName: string;
  specialty: string;
  reason: string;
  note: string;
  avatar: string;
};

const APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    time: "10:30 AM",
    status: "upcoming",
    type: "online",
    patientName: "Lance Kian Flores",
    specialty: "Follow-up",
    reason:
      "Persistent mild headaches and occasional dizziness since starting new medication.",
    note:
      "Patient reports mild improvement, but symptoms are still present during the afternoon.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD1BRvQNt6LdszcE15REOYTnx8-Gu__ZuPQHw_tfoKEKArXnHXQKuRY6255lAItDN45n_LmavU1v_UmTnDHQjpk10FDch4QNlsfIDqRoGDVK5sHEwnkpZ0Yt0O317n7OKsAMfVixrJaTyWslRGQ5LPEGjcgQzM1AICN4RNsowxeIEPVHgxoNweSqkxvXv45m0fHELMjSQeZMES3XgoYvkkFezp58PYZM-L3OipyBLsqJxxniSrFdDv619jB2dIFINUru8E_Uvy7iy8",
  },
  {
    id: "2",
    time: "11:45 AM",
    status: "upcoming",
    type: "clinic",
    patientName: "Elena Rostova",
    specialty: "Initial Consultation",
    reason:
      "Routine check-up for thyroid management; patient reports stable energy levels but requests a dosage review.",
    note:
      "Review labs and confirm whether medication dosage needs adjustment.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhHM5VCQ8rpnvK6SJ5Nb2T6tbTfEaUXiABsQ0akyc5_2Pb8Nq6pxRtiLs12vxnvUAzzp7razxqRHuc0q-2_qkwy8dXOgcz5aQkScHl-OsiZ5yFlRchZD6h6cCQMYYbQcqVPV5TDIkDId1C8WXhaU9XJIzny1gK8Q2klOXRHMTW3gtUkAViD2_Nf_9kAftMXowT7_tQoqyGrVVxX3qtpXRFLAkgOgM1FJ15g-S25riTvMlASXzOC3VSG__G1kpE0LL3qx1MkaGjlWY",
  },
  {
    id: "3",
    time: "09:00 AM",
    status: "completed",
    type: "clinic",
    patientName: "Marcus Thorne",
    specialty: "Routine Checkup",
    reason: "Routine check-up and medication follow-through.",
    note:
      "Visit completed successfully. Patient advised to continue current care plan.",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCFXBeOnASyVWvIIrLqAeFTFstjy1oVK9L7oX9Py2LPVyBdMhYwOWZAiKmgXWoTONf6WkHldFnBLzFT0KrucxnWTetwvPa-05-tfzhKZB6NXY99wbPrMw49aYuAs9pUz0SSDffWNRFRISyTn_j-1R8CZDtmqnoJv9-ZetB_B1pCJIbtDw5UfuQhIDa1SjidzNLxer01q-LdMxwy001RlLrrrmAOi13-0Dty_owdeXTnnSaK4WtrEcCzjLD2oRoy12N_3MLMXQFIyDA",
  },
];

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
      Upcoming
    </span>
  );
}

function TypeIcon({ type }: { type: AppointmentType }) {
  return type === "online" ? (
    <Video className="h-4 w-4 text-primary" />
  ) : (
    <Stethoscope className="h-4 w-4 text-primary" />
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const completed = appointment.status === "completed";

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-800",
        completed
          ? "border-slate-100 opacity-85 dark:border-slate-700"
          : "border-slate-100 hover:border-primary/20 dark:border-slate-700",
      ].join(" ")}
    >
      <div
        className={[
          "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-transform duration-500",
          completed ? "bg-slate-300" : "bg-secondary",
        ].join(" ")}
      />

      <div className="flex flex-col gap-6 pl-3 md:flex-row md:items-start md:gap-8">
        <div className="flex items-center justify-between gap-4 md:w-36 md:flex-col md:items-start">
          <div>
            <div
              className={[
                "text-2xl font-extrabold tracking-tight font-['Manrope']",
                completed
                  ? "text-slate-500 dark:text-slate-400"
                  : "text-slate-900 dark:text-white",
              ].join(" ")}
            >
              {appointment.time.split(" ")[0]}
              <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {appointment.time.split(" ")[1]}
              </span>
            </div>
          </div>

          <StatusBadge status={appointment.status} />
        </div>

        <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:items-start">
          <img
            src={appointment.avatar}
            alt={appointment.patientName}
            className={[
              "h-16 w-16 rounded-full object-cover shadow-sm ring-4",
              completed
                ? "grayscale ring-slate-100 dark:ring-slate-700"
                : "ring-white dark:ring-slate-700",
            ].join(" ")}
          />

          <div className="flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {appointment.patientName}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <TypeIcon type={appointment.type} />
                  <span>
                    {appointment.type === "online"
                      ? "Online Consultation"
                      : "In-Clinic"}{" "}
                    • {appointment.specialty}
                  </span>
                </div>
              </div>

              <button className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-700">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              {appointment.reason}
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <FileText className="h-4 w-4 text-primary" />
                Quick Note
              </div>
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                {appointment.note}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {completed ? (
                <>
                  <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    <MessageSquareText className="h-4 w-4" />
                    Details
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/15">
                    <Pill className="h-4 w-4" />
                    Add Note
                  </button>
                </>
              ) : (
                <>
                  <button className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 hover:shadow-xl">
                    <Video className="h-4 w-4" />
                    Join Call
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    <MessageSquareText className="h-4 w-4" />
                    Details
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-2.5 text-sm font-bold text-tertiary transition hover:bg-tertiary-container/10">
                    <Clock3 className="h-4 w-4" />
                    Reschedule
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ClinicalAppointmentsPage() {
  return (
    <main className="min-h-screen bg-background-light text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <style>{`
        body { font-family: Inter, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: Manrope, sans-serif; }
      `}</style>

      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-24">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-primary">
              Today&apos;s Roster
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Clinical Appointments
            </h1>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-slate-100 p-2 dark:bg-slate-800/70">
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-primary dark:hover:bg-slate-700">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-primary shadow-sm dark:bg-slate-900 dark:text-slate-200">
              <CalendarDays className="h-4 w-4" />
              Oct 24, 2024
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-primary dark:hover:bg-slate-700">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {APPOINTMENTS.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3 font-bold text-primary shadow-sm transition hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
            View Entire Schedule
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}