"use client";

import { CalendarDays, Download, FileText, MapPin, Pill, Printer, Sparkles } from "lucide-react";

const medication = {
  name: "Clobetasol Propionate 0.05% Ointment",
  generic: "Generic for Temovate",
  sig: "Apply a thin layer to affected areas twice daily for up to 14 days.",
  quantity: "1 Tube (30g)",
  refills: "0",
  pharmacy: "Sent electronically to CVS #1234",
};

const nextSteps = [
  {
    title: "Start Treatment",
    description: "Begin using the prescribed ointment today as directed.",
  },
  {
    title: "Schedule Follow-up",
    description: "Book an appointment in 2 weeks to assess progress.",
    action: "Book Now",
  },
];

export default function MedicalRecordPrescriptionPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
      <style>{` 
        body { font-family: Inter, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: Manrope, sans-serif; }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        <section className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold tracking-wide text-primary">
              <Sparkles className="h-4 w-4" />
              CONSULTATION RECORD
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Digital Prescription
            </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400 sm:text-lg">
              Issued on October 24, 2023
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110 hover:shadow-xl">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-bl-full bg-primary/5 transition-transform duration-300 group-hover:scale-110" />

              <div className="relative z-10 flex items-center gap-6">
                <img
                  alt="Dr. Sarah Lee"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_hHHpI081-gKgIqv0Y3WH-HBCUkhdS4RD4vu5KskVoxrvR4zX-a9Uz6gJOMPQIY7dTK4wB_v1Ci9HfQEOuKNqli5lN31m3TrFEacN5J8jGFf_vbmbVzxOhSBo9kv8EKRYHISP8BQvwNeqUP_1MK_NFw884mT5noEgUdUjgdLtAg0EhdDV0f122oATkB7uyE2_UfAv0lUooG95DnmDaeiuXqkLutAOh1o8pkm9Pen2Dwp61_Y4D-bR6eLUKZC3q6mAGSLEhBrrzoo"
                  className="h-20 w-20 rounded-full object-cover shadow-sm ring-4 ring-white dark:ring-slate-700"
                />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Dr. Sarah Lee, MD
                  </h2>
                  <p className="font-semibold text-primary">Dermatologist</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>AppointCare Medical Center</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-700/70">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  License Information
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Lic. No: 987654321 • DEA: XX1234567
                </p>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-900/50">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Clinical Notes
                </h3>
              </div>

              <div className="space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                <p>
                  Patient presented with acute dermatitis on the flexor surfaces of both arms, presenting as erythematous,
                  pruritic patches. No secondary infection observed.
                </p>
                <p>Diagnosis: Atopic Dermatitis (flare-up).</p>
                <p>
                  Plan: Initiate topical corticosteroid therapy for 14 days. Advised on gentle skin care routine,
                  avoidance of known triggers (fragrances, harsh soaps), and frequent application of emollients.
                </p>
              </div>
            </article>
          </div>

          <div className="space-y-8 lg:col-span-7">
            <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]">
                <Pill className="h-48 w-48" />
              </div>

              <div className="relative z-10 mb-8 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <Pill className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Rx Details
                  </h3>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  Valid
                </span>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="rounded-xl border-l-4 border-primary bg-slate-50 p-6 dark:bg-slate-900/50">
                  <h4 className="mb-1 text-xl font-bold text-primary">
                    {medication.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{medication.generic}</p>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Instructions (Sig)
                      </p>
                      <p className="text-base font-medium text-slate-800 dark:text-slate-200">{medication.sig}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        Quantity
                      </p>
                      <p className="text-base font-medium text-slate-800 dark:text-slate-200">{medication.quantity}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 border-t border-slate-100 pt-4 md:flex-row dark:border-slate-700/70">
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Refills
                    </p>
                    <p className="text-base font-medium text-slate-800 dark:text-slate-200">{medication.refills}</p>
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Pharmacy
                    </p>
                    <p className="font-medium text-primary transition hover:underline">
                      {medication.pharmacy}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Next Steps</h3>
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>

              <ul className="space-y-6">
                {nextSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                      {"action" in step ? (
                        <button className="mt-3 rounded-full bg-secondary px-4 py-2 text-sm font-bold text-white transition hover:brightness-110">
                          {step.action}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
