// app/find-doctors/page.tsx
"use client";

import { JSX, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Star,
  X,
  ArrowRight,
} from "lucide-react";
import { Inter, Manrope } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  image: string;
  schedules: string[];
  about: string;
  location: string;
  nextAvailable: string;
};

const DOCTORS: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Neurologist",
    experience: "15 Yrs Exp.",
    rating: 4.9,
    reviews: 124,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCirSJ-u5AJepxdHJr5RVF1zlAHNthUsDD7st6PWexzfyahlaGkBUVrAVy33obW_NfQtQ6t4xtZqfjh9-BgfHPo_1MvcMvM0bDqdfdY65ugaCP0BKZ2tN_4cE6FQCZUrB0e2U80h8V8O0lDbCLOoulh-4Zw3EA1dRqX16qwkEUa2eN_bHxna9qKGBcMh2--KOyQK3X1tRo2N3qO4HIuEybQnOKj73jPW2hf-lVtz6j_UKpdjveI6W5zC6jPbWKACWMYeXPv2im4KjI",
    schedules: ["Today, 2:00 PM", "Tomorrow, 9:00 AM", "Wed, 4:30 PM"],
    about:
      "Focused on calm, clear consultations and evidence-based care for headaches, dizziness, and nerve-related concerns.",
    location: "St. Mary’s Medical Center",
    nextAvailable: "Today, 2:00 PM",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiologist",
    experience: "22 Yrs Exp.",
    rating: 4.8,
    reviews: 89,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBTS1zYDRni0EkTH9oEFW2kj3-SHXmRWVMA858hOJ95mU4veKFpcXOZlRIwiwzEXNZI18hRf0iCus-hnLm3lhwp1ORm9ik7k_1Q0G-N8jjfgHUmOC8epN5iOoC9WqU3e5fMZ0fR8TmyoX0b4FVy-Cpy-meeNCnuZxmDqB-br7JPeLrwcsBYw8A6F16KmeSyOI5s7mDYoTqTfHo5pyfnNkpdrG6OOn8fg3lDXFGHAE3l6k9kfOVPZJmIghNpusazoUQ01o_AtOYAJgM",
    schedules: ["Thu, 10:00 AM", "Fri, 1:30 PM"],
    about:
      "Provides practical heart health guidance, from checkups to long-term management, with a steady and reassuring approach.",
    location: "Heart Care Clinic",
    nextAvailable: "Thu, 10:00 AM",
  },
];

const FILTERS = {
  specialties: ["Cardiology", "Dermatology", "Neurology"],
  availability: ["Anytime", "Today", "Next 3 Days"],
};

const TIME_SLOTS = [
  "8:00 AM",
  "9:30 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "4:30 PM",
];

export default function FindDoctorsPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [symptomText, setSymptomText] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOCTORS;

    return DOCTORS.filter((doctor) =>
      [
        doctor.name,
        doctor.specialty,
        doctor.experience,
        doctor.about,
        doctor.location,
        doctor.nextAvailable,
        ...doctor.schedules,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const openPanel = (doctor: Doctor) => {
    setActiveDoctor(doctor);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
  };

  const handleAnalyzeSymptoms = () => {
    setQuery(symptomText.trim());
  };

  return (
    <div
      className={`${inter.variable} ${manrope.variable} min-h-screen bg-white text-[#1a1c1c] antialiased selection:bg-[#7ecfd0] selection:text-[#07201f]`}
    >
      <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 md:px-8 mt-20">
        <section className="mx-auto w-full max-w-4xl text-center">
          <h1 className="text-display font-headline font-extrabold text-5xl md:text-7xl tracking-[-0.03em] text-black leading-tight">
            Find the right care,
            <br />
            <span className="text-[#0f766e]">right now.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#5a6664] md:text-base">
            Search by specialty, symptoms, or availability. Keep it clean, calm,
            and easy to scan.
          </p>
        </section>

        <section className="mx-auto mt-8 w-full max-w-4xl">
          <div className="rounded-[24px] bg-white p-4 shadow-[0px_12px_32px_rgba(0,80,73,0.06)] md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6d7a77]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search doctors, specialties, or schedules..."
                  className="w-full rounded-2xl border border-[#e6e7e4] bg-[#fafafa] py-4 pl-12 pr-4 text-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#eef8f7] px-5 py-4 text-sm font-semibold text-[#0f766e] transition hover:bg-[#e1f2f0]"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            <section className="relative mt-5 overflow-hidden rounded-[24px] border border-[#e8ebe9] bg-gradient-to-br from-[#fbfcfc] to-[#f3f8f8] p-4 md:p-6 group">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#0f766e]/10 blur-3xl transition-colors duration-700 group-hover:bg-[#0f766e]/15" />
              <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-3 py-1 text-[#0f766e]">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                      AI Assistant
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-[#111827] md:text-3xl">
                      Not sure who to see?
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-[#5a6664] md:text-base">
                      Describe your symptoms in plain language, and our clinical AI
                      will recommend the most appropriate specialists and care
                      pathways for you.
                    </p>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#e8ebe9] bg-white/85 p-4 shadow-sm backdrop-blur-sm md:p-5">
                  <textarea
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    className="h-28 w-full resize-none rounded-2xl border border-[#e6e7e4] bg-[#fafafa] p-4 text-sm text-[#1a1c1c] outline-none transition placeholder:text-[#8a9491] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/10"
                    placeholder="E.g., I've had a persistent dull ache in my lower back for three days, and it hurts when I bend over..."
                  />

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-xs font-medium text-[#7a8481]">
                      Powered by HealthSync AI
                    </span>
                    <button
                      type="button"
                      onClick={handleAnalyzeSymptoms}
                      className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b5f59]"
                    >
                      Analyze Symptoms
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {showFilters ? (
              <div className="mt-4 rounded-2xl border border-[#e8ebe9] bg-[#fafafa] p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-[#0f766e]">
                    Filter by
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="rounded-full p-2 text-[#6d7a77] transition hover:bg-[#f2f4f4] hover:text-[#1a1c1c]"
                    aria-label="Close filters"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#3d4947]">
                      Specialization
                    </h3>
                    <div className="space-y-2">
                      {FILTERS.specialties.map((item, index) => (
                        <label
                          key={item}
                          className="group flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={index === 2}
                            className="h-5 w-5 rounded border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                          />
                          <span className="text-sm text-[#1a1c1c] transition-colors group-hover:text-[#0f766e]">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-[#3d4947]">
                      Availability
                    </h3>
                    <div className="space-y-2">
                      {FILTERS.availability.map((item, index) => (
                        <label
                          key={item}
                          className="group flex cursor-pointer items-center gap-3"
                        >
                          <input
                            type="radio"
                            name="availability"
                            defaultChecked={index === 0}
                            className="h-5 w-5 border-gray-300 text-[#0f766e] focus:ring-[#0f766e]"
                          />
                          <span className="text-sm text-[#1a1c1c] transition-colors group-hover:text-[#0f766e]">
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mx-auto mt-10 w-full max-w-5xl">
          <div className="grid place-items-center gap-8 lg:grid-cols-2">
            {filteredDoctors.map((doctor) => (
              <article
                key={doctor.id}
                className="relative w-full max-w-xl overflow-hidden rounded-[24px] bg-white p-8 shadow-[0px_12px_32px_rgba(0,80,73,0.06)]"
              >
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-bl-full bg-[#0f766e]/10" />

                <div className="relative z-10 flex flex-col gap-8 md:flex-row">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#eeeeee] md:h-32 md:w-32">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-bold tracking-tight text-[#0f766e]">
                          {doctor.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-[#49606b]">
                          {doctor.specialty}
                        </p>
                      </div>

                      <div className="flex items-center rounded-full bg-[#f3f4f6] px-3 py-1">
                        <Star className="mr-1 h-4 w-4 fill-current text-[#d4a72c]" />
                        <span className="text-sm font-semibold text-[#1a1c1c]">
                          {doctor.rating}
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 leading-relaxed text-[#3d4947]">
                      {doctor.about}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#3d4947]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {doctor.location}
                      </span>
                      <span className="text-[#bcc9c6]">•</span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        Next available: {doctor.nextAvailable}
                      </span>
                    </div>

                    <div className="mt-auto pt-6">
                      <button
                        type="button"
                        onClick={() => openPanel(doctor)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b5f59]"
                      >
                        View Schedule
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div
        onClick={closePanel}
        className={[
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300",
          panelOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          panelOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-[#e8e8e8] bg-white px-8 py-6">
          <div>
            <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-bold text-[#0f766e]">
              {activeDoctor?.name ?? "Doctor Schedule"}
            </h3>
            <p className="mt-1 text-sm text-[#5a6664]">
              Select an available time
            </p>
          </div>

          <button
            type="button"
            onClick={closePanel}
            className="rounded-full p-2 text-[#6d7a77] transition hover:bg-[#f2f4f4] hover:text-[#1a1c1c]"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-grow space-y-8 overflow-y-auto px-8 py-6">
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
              This Week
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="flex min-w-[60px] flex-col items-center rounded-lg bg-[#0f766e] p-3 text-white">
                <span className="text-xs uppercase">Wed</span>
                <span className="text-lg font-bold">12</span>
              </div>
              <div className="flex min-w-[60px] flex-col items-center rounded-lg bg-[#f3f3f4] p-3 text-[#1a1c1c]">
                <span className="text-xs uppercase">Thu</span>
                <span className="text-lg font-bold">13</span>
              </div>
              <div className="flex min-w-[60px] flex-col items-center rounded-lg bg-[#f3f3f4] p-3 text-[#1a1c1c]">
                <span className="text-xs uppercase">Fri</span>
                <span className="text-lg font-bold">14</span>
              </div>
              <div className="flex min-w-[60px] flex-col items-center rounded-lg bg-[#f3f3f4] p-3 text-[#bcc9c6]">
                <span className="text-xs uppercase">Sat</span>
                <span className="text-lg font-bold">15</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
              Available Slots
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={[
                    "rounded-lg border px-4 py-3 text-center text-sm font-medium transition",
                    time === "11:00 AM"
                      ? "border-[#0f766e] bg-[#0f766e]/5 text-[#0f766e]"
                      : "border-[#bcc9c6]/40 text-[#1a1c1c] hover:border-[#0f766e] hover:text-[#0f766e]",
                  ].join(" ")}
                >
                  {time}
                </button>
              ))}
              <button
                type="button"
                className="rounded-lg border border-[#bcc9c6]/30 bg-[#e8e8e8] px-4 py-3 text-center text-sm font-medium text-[#6d7a77] opacity-50"
              >
                10:00 AM (Booked)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t border-[#e8e8e8] bg-[#f9f9f9] p-8">
          <button
            type="button"
            className="w-full rounded-full bg-[#0f766e] py-4 text-lg font-bold text-white transition hover:bg-[#0b5f59]"
          >
            Confirm 11:00 AM
          </button>
          <p className="mt-4 text-center text-xs text-[#5a6664]">
            A confirmation will be sent to your registered email.
          </p>
        </div>
      </aside>
    </div>
  );
}