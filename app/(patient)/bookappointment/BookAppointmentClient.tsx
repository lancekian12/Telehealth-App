"use client";

import React, { JSX, useMemo, useState } from "react";
import {
  Leaf,
  Video,
  Stethoscope,
  Star,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";

type ConsultationType = "video" | "inperson";

const DATES = [
  { day: "Mon", date: 23, disabled: false },
  { day: "Tue", date: 24, disabled: false },
  { day: "Wed", date: 25, disabled: false },
  { day: "Thu", date: 26, disabled: false },
  { day: "Fri", date: 27, disabled: true },
  { day: "Sat", date: 28, disabled: false },
  { day: "Sun", date: 29, disabled: false },
] as const;

const MORNING_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
] as const;

const AFTERNOON_SLOTS = [
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
] as const;

export default function BookAppointmentClient(): JSX.Element {
  const [consultationType, setConsultationType] =
    useState<ConsultationType>("video");
  const [selectedDateIdx, setSelectedDateIdx] = useState<number>(1);
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  const canConfirm = useMemo(() => {
    const date = DATES[selectedDateIdx];
    return !!selectedTime && !date?.disabled;
  }, [selectedDateIdx, selectedTime]);

  function confirm() {
    if (!canConfirm) return;
    const dt = DATES[selectedDateIdx];
    alert(
      `Appointment confirmed: ${
        consultationType === "video" ? "Video" : "In-Person"
      } on ${dt.day} ${dt.date} at ${selectedTime}`
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-8 flex items-center text-sm text-slate-500 gap-2">
          <a className="hover:text-[#008081] transition-colors" href="#">
            Home
          </a>
          <ChevronRight className="text-[14px]" />
          <a className="hover:text-[#008081] transition-colors" href="#">
            Find Doctor
          </a>
          <ChevronRight className="text-[14px]" />
          <a className="hover:text-[#008081] transition-colors" href="#">
            Dr. Maria Santos
          </a>
          <ChevronRight className="text-[14px]" />
          <span className="font-semibold text-[#008081]">Book Appointment</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl p-6 relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-[0_8px_32px_rgba(31,38,135,0.07)]">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#008081]/10 to-[#81B641]/10 z-0" />
              <div className="relative z-10 flex flex-col items-center text-center mt-4">
                <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl mb-4 relative">
                  <img
                    alt="Dr. Maria Santos"
                    className="w-full h-full rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJlVhFcqU6rhRVGOSoSK85MOYvSWfF0iHljU1TGeexv_sSOkkfL4FTxy3vWUt_2crV_kpD6aTVmA1OsL45ywM7BZzgI2JXebJHrN0s_4x9bMLMk-3BVM2o0saMxf0rrjJIFu0ONvqgVt8IytR87mFc-9xTVuS3lzDAACVTDasGCSwpGVIQrJafDo2Lc3KRCaI-S4x9rqQ5vKwTy_KO2IEDbxEEpAIUYSFAndWJ69w2CDusJPk17ANQHoYmuRQ-lPYutTBdNfwLjko"
                  />
                  <div
                    className="absolute bottom-1 right-1 bg-green-500 border-2 border-white w-6 h-6 rounded-full flex items-center justify-center"
                    title="Online Now"
                  >
                    <Video size={14} className="text-white" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Dr. Maria Santos
                </h1>
                <p className="text-[#008081] font-medium mt-1">Pediatrician</p>
                <p className="text-slate-500 text-sm mt-1">
                  Davao Doctors Hospital
                </p>

                <div className="flex items-center justify-center gap-2 mt-3 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-600">
                  <Star size={16} className="text-yellow-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    4.9
                  </span>
                  <span className="text-xs text-slate-400">(124 reviews)</span>
                </div>
              </div>

              <div className="mt-8 space-y-4 relative z-10">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide opacity-70">
                  About
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Specializes in child nutrition and developmental disorders.
                  Graduate of Davao Medical School Foundation with 12 years of
                  practice. Dedicated to providing compassionate care for
                  children of all ages.
                </p>

                <div className="h-px bg-slate-100 dark:bg-slate-700 my-4" />

                <h3 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wide opacity-70">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#008081]/5 text-[#008081] text-xs font-medium border border-[#008081]/10">
                    Child Nutrition
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#008081]/5 text-[#008081] text-xs font-medium border border-[#008081]/10">
                    Development
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#008081]/5 text-[#008081] text-xs font-medium border border-[#008081]/10">
                    Immunization
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#008081]/5 text-[#008081] text-xs font-medium border border-[#008081]/10">
                    General Pediatrics
                  </span>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">
                    Consultation Fee
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ₱600
                  </p>
                </div>
                <CreditCard size={32} className="text-slate-300" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 pb-12">
            <div className="rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-[0_8px_32px_rgba(31,38,135,0.07)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#008081] text-white flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Select Consultation Type
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="relative block">
                  <input
                    name="consultation_type"
                    type="radio"
                    checked={consultationType === "video"}
                    onChange={() => setConsultationType("video")}
                    className="sr-only"
                  />
                  <div
                    className={`rounded-2xl p-5 bg-white dark:bg-slate-900 h-full text-left border transition-all ${
                      consultationType === "video"
                        ? "border-[#008081] bg-[#008081]/5 text-[#008081]"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                        <Video size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                          Video Consultation
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">
                          Connect with the doctor remotely via secure video
                          call.
                        </p>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                          Available Now
                        </span>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative block">
                  <input
                    name="consultation_type"
                    type="radio"
                    checked={consultationType === "inperson"}
                    onChange={() => setConsultationType("inperson")}
                    className="sr-only"
                  />
                  <div
                    className={`rounded-2xl p-5 bg-white dark:bg-slate-900 h-full text-left border transition-all ${
                      consultationType === "inperson"
                        ? "border-[#81B641] bg-[#81B641]/5 text-[#81B641]"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#81B641]/10 text-[#81B641] flex items-center justify-center shrink-0">
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                          In-Person Visit
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">
                          Visit the doctor at Davao Doctors Hospital.
                        </p>
                        <span className="text-xs font-semibold text-slate-500">
                          Requires Confirmation
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-[0_8px_32px_rgba(31,38,135,0.07)]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#008081] text-white flex items-center justify-center font-bold shadow-lg">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    Choose Date
                  </h2>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                    aria-label="prev month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    October 2023
                  </span>
                  <button
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 flex items-center justify-center transition-colors"
                    aria-label="next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {DATES.map((d, i) => {
                  const selected = i === selectedDateIdx;
                  return (
                    <button
                      key={d.day + d.date}
                      onClick={() => !d.disabled && setSelectedDateIdx(i)}
                      disabled={d.disabled}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all min-w-[80px] ${
                        d.disabled
                          ? "opacity-50 cursor-not-allowed border-slate-100 bg-slate-50 dark:bg-slate-900"
                          : selected
                          ? "bg-[#008081] text-white border-[#008081] shadow-lg"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#008081]/50"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium mb-1 uppercase ${
                          selected ? "text-white/80" : "text-slate-400"
                        }`}
                      >
                        {d.day}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          selected ? "text-white" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {d.date}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/50 dark:border-slate-700 shadow-[0_8px_32px_rgba(31,38,135,0.07)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#008081] text-white flex items-center justify-center font-bold shadow-lg">
                  3
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Pick a Time
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sun size={16} className="text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Morning
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {MORNING_SLOTS.map((t) => {
                      const disabled = t === "11:00 AM";
                      const selected = t === selectedTime;
                      return (
                        <button
                          key={t}
                          onClick={() => !disabled && setSelectedTime(t)}
                          disabled={disabled}
                          className={`px-4 py-3 rounded-xl border border-[#E2E8F0] text-center text-sm font-medium transition-all ${
                            disabled
                              ? "text-slate-300 border-slate-100 bg-slate-50 dark:bg-slate-900 dark:text-slate-600 cursor-not-allowed"
                              : selected
                              ? "bg-[#008081] text-white border-[#008081] shadow-lg"
                              : "bg-white  dark:bg-slate-800 dark:border-slate-700 hover:border-[#008081]/50 hover:bg-[#008081]/5 hover:text-[#008081]"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Moon size={16} className="text-slate-400" />
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Afternoon
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {AFTERNOON_SLOTS.map((t) => {
                      const selected = t === selectedTime;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`px-4 py-3 border-[#E2E8F0] rounded-xl border text-center text-sm font-medium transition-all ${
                            selected
                              ? "bg-[#008081] text-white border-[#008081] shadow-lg"
                              : "bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-[#008081]/50 hover:bg-[#008081]/5 hover:text-[#008081]"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={confirm}
                disabled={!canConfirm}
                className={`bg-[#008081] hover:bg-[#00736f] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all flex items-center gap-2 w-full sm:w-auto justify-center ${
                  !canConfirm ? "opacity-60 cursor-not-allowed" : "hover:-translate-y-1"
                }`}
              >
                Confirm Appointment
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}