"use client";

import { useMemo, useState } from "react";
import type { JSX } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseMedical,
  ChevronDown,
  CircleCheckBig,
  Search,
  Sparkles,
  Star,
  Target,
  WandSparkles,
  X,
} from "lucide-react";

type Slot = {
  day: string;
  time: string;
};

type Doctor = {
  name: string;
  title: string;
  rating: string;
  experience: string;
  fee: string;
  slots: Slot[];
  image: string;
  match?: string;
  reason?: string;
  nextAvailable?: string;
};

const specializations = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
];

const doctors: Doctor[] = [
  {
    name: "Dr. Sarah Jenkins",
    title: "Chief Cardiologist",
    rating: "4.9",
    experience: "15 Yrs Exp.",
    fee: "$150",
    slots: [
      { day: "Today", time: "2:00 PM" },
      { day: "Tomorrow", time: "9:00 AM" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgbpm0AYnXu4lkAdUB-t7i2KBmkqAMNZ8-fee9K47rooUTAAISQib0hfmOXnrq0YGhX2OQ0xcWcFD3VAd5b94SnrHvTzzX-QDwYkNt3KkgmLlWsjrx6NcvEPzt50Vq_MosfDZ4zudVp30hjMRjgnNeHtT4rQC2KqGdnmp6nT5sKUhAhRSg2SM-Vnz6PqRV4GlWQlwIV463PW5Z6gJMgOZkKO1wXbeZAMHzNUKVFbTs6bRmlbqzOGAIIiLvNhl0JLBVov4iv5chBbY",
  },
  {
    name: "Dr. Marcus Thorne",
    title: "Interventional Cardiologist",
    rating: "4.8",
    experience: "12 Yrs Exp.",
    fee: "$175",
    slots: [
      { day: "Today", time: "4:30 PM" },
      { day: "Thu", time: "10:15 AM" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgbpm0AYnXu4lkAdUB-t7i2KBmkqAMNZ8-fee9K47rooUTAAISQib0hfmOXnrq0YGhX2OQ0xcWcFD3VAd5b94SnrHvTzzX-QDwYkNt3KkgmLlWsjrx6NcvEPzt50Vq_MosfDZ4zudVp30hjMRjgnNeHtT4rQC2KqGdnmp6nT5sKUhAhRSg2SM-Vnz6PqRV4GlWQlwIV463PW5Z6gJMgOZkKO1wXbeZAMHzNUKVFbTs6bRmlbqzOGAIIiLvNhl0JLBVov4iv5chBbY",
  },
];

const aiRecommendations: Doctor[] = [
  {
    name: "Dr. Elena Rostova",
    title: "Cardio-Diagnostics",
    match: "98% Match",
    reason:
      "Highly recommended based on your recent wearable data showing mild arrhythmias. Dr. Rostova specializes in early-stage rhythm diagnostics and has immediate availability for tele-consultation.",
    fee: "$140",
    nextAvailable: "Today, 3:15 PM",
    slots: [
      { day: "Today", time: "3:15 PM" },
      { day: "Tomorrow", time: "10:00 AM" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgbpm0AYnXu4lkAdUB-t7i2KBmkqAMNZ8-fee9K47rooUTAAISQib0hfmOXnrq0YGhX2OQ0xcWcFD3VAd5b94SnrHvTzzX-QDwYkNt3KkgmLlWsjrx6NcvEPzt50Vq_MosfDZ4zudVp30hjMRjgnNeHtT4rQC2KqGdnmp6nT5sKUhAhRSg2SM-Vnz6PqRV4GlWQlwIV463PW5Z6gJMgOZkKO1wXbeZAMHzNUKVFbTs6bRmlbqzOGAIIiLvNhl0JLBVov4iv5chBbY",
  },
  {
    name: "Dr. James Chen",
    title: "Preventative Cardiology",
    match: "92% Match",
    reason:
      "Matches your preference for holistic preventative care. Dr. Chen has successfully treated 45+ patients with similar lifestyle profiles and risk factors in the past year.",
    fee: "$165",
    nextAvailable: "Tomorrow, 11:00 AM",
    slots: [
      { day: "Tomorrow", time: "11:00 AM" },
      { day: "Fri", time: "1:45 PM" },
    ],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgbpm0AYnXu4lkAdUB-t7i2KBmkqAMNZ8-fee9K47rooUTAAISQib0hfmOXnrq0YGhX2OQ0xcWcFD3VAd5b94SnrHvTzzX-QDwYkNt3KkgmLlWsjrx6NcvEPzt50Vq_MosfDZ4zudVp30hjMRjgnNeHtT4rQC2KqGdnmp6nT5sKUhAhRSg2SM-Vnz6PqRV4GlWQlwIV463PW5Z6gJMgOZkKO1wXbeZAMHzNUKVFbTs6bRmlbqzOGAIIiLvNhl0JLBVov4iv5chBbY",
  },
];

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "1:00 PM",
  "2:30 PM",
  "3:15 PM",
  "4:00 PM",
  "5:30 PM",
];

export default function DoctorDiscoveryPage(): JSX.Element {
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
  const [symptomText, setSymptomText] = useState("");

  const selectedDate = useMemo(
    () => [
      { day: "Wed", date: "12", active: true },
      { day: "Thu", date: "13", active: false },
      { day: "Fri", date: "14", active: false },
      { day: "Sat", date: "15", active: false, muted: true },
    ],
    [],
  );

  const openPanel = (doctor: Doctor) => {
    setActiveDoctor(doctor);
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const handleAnalyzeSymptoms = () => {
    if (!symptomText.trim()) return;
    setActiveDoctor(aiRecommendations[0]);
    setPanelOpen(true);
  };

  return (
    <main className="mt-10 min-h-screen bg-white text-slate-900 antialiased">
      {panelOpen ? (
        <button
          type="button"
          aria-label="Close booking panel"
          onClick={closePanel}
          className="fixed inset-0 z-40 cursor-default bg-black/20 backdrop-blur-[2px]"
        />
      ) : null}

      <aside
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          panelOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-[#e8e8e8] bg-white px-8 py-6">
          <div>
            <h3 className="font-['Manrope'] text-2xl font-bold text-[#0f766e]">
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
              {selectedDate.map((item) => (
                <div
                  key={item.date}
                  className={[
                    "flex min-w-[60px] flex-col items-center rounded-lg p-3",
                    item.active
                      ? "bg-[#0f766e] text-white"
                      : item.muted
                        ? "bg-[#f3f3f4] text-[#bcc9c6]"
                        : "bg-[#f3f3f4] text-[#1a1c1c]",
                  ].join(" ")}
                >
                  <span className="text-xs uppercase">{item.day}</span>
                  <span className="text-lg font-bold">{item.date}</span>
                </div>
              ))}
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

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
        <aside className="flex w-full flex-shrink-0 flex-col gap-8 lg:sticky lg:top-10 lg:h-[calc(100vh-8rem)] lg:w-80">
          <div className="h-full rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,128,129,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#008081]/5 lg:overflow-y-auto">
            <h2 className="mb-6 font-['Manrope'] text-xl font-extrabold text-slate-900">
              Filter By
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#008081]">
                  Specialization
                </h3>
                <div className="space-y-3">
                  {specializations.map((item, index) => (
                    <label
                      key={item}
                      className="group flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={index === 0}
                        className="h-5 w-5 rounded border-slate-200 bg-slate-50 text-[#008081] focus:ring-[#008081] focus:ring-offset-white"
                      />
                      <span
                        className={`font-medium transition-colors ${index === 0 ? "text-slate-700" : "text-slate-500 group-hover:text-[#008081]"}`}
                      >
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#008081]">
                  Rating
                </h3>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-full border border-slate-100 bg-slate-50 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100">
                    4.5+
                  </button>
                  <button className="flex-1 rounded-full bg-[#008081] py-2 text-sm font-bold text-white shadow-md shadow-[#008081]/20">
                    4.0+
                  </button>
                  <button className="flex-1 rounded-full border border-slate-100 bg-slate-50 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100">
                    All
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#008081]">
                  Availability
                </h3>
                <label className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-5 w-5 rounded border-slate-200 bg-slate-50 text-[#008081] focus:ring-[#008081] focus:ring-offset-white"
                  />
                  <span className="font-medium text-slate-700 transition-colors group-hover:text-[#008081]">
                    Available Today
                  </span>
                </label>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#008081]">
                  Consultation Fee
                </h3>
                <input
                  type="range"
                  min={50}
                  max={300}
                  defaultValue={150}
                  className="w-full accent-[#008081]"
                />
                <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
                  <span>$50</span>
                  <span>Up to $150</span>
                  <span>$300+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col gap-12">
          <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-8 shadow-[0_20px_40px_-15px_rgba(0,128,129,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#008081]/5 sm:p-10">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#008081]/5 blur-3xl" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#008081]/10 px-4 py-2 text-sm font-bold tracking-wide text-[#008081]">
                <Search className="h-4 w-4" />
                FIND SPECIALISTS
              </div>
              <h1 className="mb-4 font-['Manrope'] text-4xl font-extrabold leading-tight tracking-[-0.02em] text-slate-900 lg:text-5xl">
                Find the right care,
                <br />
                <span className="text-[#008081]">right now.</span>
              </h1>
              <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-600">
                Book appointments with top-rated specialists in your area with
                zero wait time.
              </p>

              <div className="flex w-full max-w-3xl items-center rounded-full border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:border-[#008081]/50 focus-within:ring-4 focus-within:ring-[#008081]/10">
                <Search className="ml-4 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctors, conditions, or specialties..."
                  className="w-full bg-transparent px-4 py-3 font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAnalyzeSymptoms}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#008081] px-8 py-3 font-bold text-white transition-all hover:brightness-110 hover:shadow-lg"
                >
                  Search
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "Cardiology",
                  "Dermatology",
                  "General Practice",
                  "Pediatrics",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-[#008081]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <div className="rounded-[24px] border border-[#e8ebe9] bg-[#fbfcfc] px-4 pb-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-3 py-1 text-[#0f766e]">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    AI Search
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold tracking-tight text-[#111827] md:text-2xl">
                  Not sure which doctor to search?
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a6664] md:text-base">
                  Use AI to describe your symptoms in plain language, and we
                  will help find the right doctor for you.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeSymptoms}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b5f59]"
              >
                Describe Symptoms with AI
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-['Manrope'] text-3xl font-extrabold text-slate-900">
                  Cardiologists
                </h2>
                <p className="mt-2 font-medium text-slate-500">
                  12 specialists available
                </p>
              </div>
              <button className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-[#008081]">
                <span>Sort by: Relevance</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            {doctors.map((doctor) => (
              <article
                key={doctor.name}
                className="group rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,128,129,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#008081]/5"
              >
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <img
                      alt={doctor.name}
                      src={doctor.image}
                      className="h-24 w-24 rounded-2xl border-4 border-slate-50 object-cover shadow-sm"
                    />
                    <div className="absolute -bottom-3 -right-3 rounded-full border border-slate-50 bg-white p-1.5 shadow-md">
                      <BadgeCheck className="h-5 w-5 text-[#81B641]" />
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-['Manrope'] text-2xl font-extrabold text-slate-900 transition-colors group-hover:text-[#008081]">
                      {doctor.name}
                    </h3>
                    <p className="mt-1 font-bold text-[#008081]">
                      {doctor.title}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-1 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-bold text-amber-700">
                          {doctor.rating}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <BriefcaseMedical className="h-4 w-4" />
                        {doctor.experience}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Available Slots
                    </span>
                    <span className="font-['Manrope'] text-2xl font-extrabold text-slate-900">
                      {doctor.fee}{" "}
                      <span className="text-sm font-medium text-slate-400">
                        /visit
                      </span>
                    </span>
                  </div>

                  <div className="mb-6 flex gap-3">
                    {doctor.slots.map((slot) => (
                      <button
                        key={`${doctor.name}-${slot.day}-${slot.time}`}
                        className="flex-1 rounded-xl border border-primary/10 bg-primary/5 px-3 py-3 text-center text-primary transition-colors hover:bg-primary/10"
                      >
                        <div className="font-extrabold">{slot.day}</div>
                        <div className="mt-0.5 text-xs font-semibold opacity-80">
                          {slot.time}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => openPanel(doctor)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#008081] py-4 font-bold text-white transition-all hover:brightness-110 hover:shadow-lg"
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>

          <section className="mt-4 border-t border-slate-100 pt-16">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#81B641]/10 text-[#81B641]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-['Manrope'] text-3xl font-extrabold text-slate-900">
                  AI Recommendations
                </h2>
                <p className="mt-1 font-medium text-slate-500">
                  Smart matches based on your symptom profile and history.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {aiRecommendations.map((doctor) => (
                <article
                  key={doctor.name}
                  className="group relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,128,129,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#008081]/5"
                >
                  <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#81B641]/5 blur-2xl" />
                  <div className="relative z-10 flex flex-col gap-8 md:flex-row">
                    <div className="flex gap-6 border-b border-slate-100 pb-6 md:w-1/3 md:border-b-0 md:border-r md:pb-0 md:pr-6">
                      <div className="relative flex-shrink-0">
                        <img
                          alt={doctor.name}
                          src={doctor.image}
                          className="h-20 w-20 rounded-2xl border-4 border-slate-50 object-cover shadow-sm"
                        />
                        <div className="absolute -bottom-2 -right-2 rounded-full bg-white p-1 shadow-sm">
                          <CircleCheckBig className="h-5 w-5 text-[#81B641]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-['Manrope'] text-xl font-extrabold text-slate-900 transition-colors group-hover:text-[#008081]">
                          {doctor.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-[#008081]">
                          {doctor.title}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center justify-center rounded-lg border border-[#81B641]/20 bg-[#81B641]/10 px-2 py-1 text-xs font-bold text-[#81B641]">
                            <Target className="mr-1 h-3.5 w-3.5" />
                            {doctor.match}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center md:w-1/2">
                      <h4 className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <WandSparkles className="h-4 w-4" /> AI Reasoning
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {doctor.reason}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center gap-3 md:w-1/4">
                      <div className="mb-2 text-center md:text-right">
                        <span className="font-['Manrope'] text-2xl font-extrabold text-slate-900">
                          {doctor.fee}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-slate-400">
                          Next available: {doctor.nextAvailable}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPanel(doctor)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#81B641] px-6 py-3 text-sm font-bold text-white transition-all hover:brightness-105 hover:shadow-lg"
                      >
                        <Sparkles className="h-4 w-4" />
                        Book Now
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
