"use client";

import React from "react";
import {
  Check,
  Plus,
  Stethoscope,
  Star,
  Wallet,
  Video,
  Globe,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { FilterModalProps } from "@/types/patient";

const SPECIALTY_OPTIONS = [
  "All specialties",
  "General Practitioner",
  "Dermatologist",
  "Cardiologist",
  "Pediatrician",
  "Obstetrician",
  "Neurologist",
];

const LANGUAGE_OPTIONS = [
  "All languages",
  "English",
  "Tagalog",
  "Cebuano",
  "Bisaya",
];

export default function FilterModal({
  open,
  onClose,
  specialty,
  setSpecialty,
  minRating,
  setMinRating,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  consultationMode,
  setConsultationMode,
  language,
  setLanguage,
  verifiedOnly,
  setVerifiedOnly,
  acceptingOnly,
  setAcceptingOnly,
  onApply,
  onReset,
}: FilterModalProps) {
  if (!open) return null;

  const ratingPercent = Math.max(0, Math.min(100, (minRating / 5) * 100));

  return (
    <div
      className="fixed inset-0 z-[999] mt-10 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-[600px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Refine Search
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Filter the doctor directory.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Stethoscope className="text-[#008081]" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">
                Specialty
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {SPECIALTY_OPTIONS.map((item) => {
                const active = specialty === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSpecialty(item)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all sm:px-5 ${
                      active
                        ? "bg-[#008081] text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item}</span>
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-4 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-[#008081] transition-colors hover:bg-slate-200"
            >
              <Plus size={18} />
              <span>Show More Specialties</span>
            </button>
          </section>

          <div className="h-px w-full bg-slate-200" />

          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Star
                  className="text-[#008081]"
                  size={20}
                  fill="currentColor"
                />
                <h3 className="text-lg font-semibold text-slate-900">
                  Minimum Rating
                </h3>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-[#008081]">
                {minRating === 0
                  ? "Any rating"
                  : `${minRating.toFixed(1)} & up`}
              </span>
            </div>

            <div className="relative px-1">
              <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
              <div
                className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-[#008081]"
                style={{ width: `${ratingPercent}%` }}
              />

              <input
                aria-label="Minimum Rating Slider"
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="relative z-10 w-full appearance-none bg-transparent"
                style={{
                  background: `linear-gradient(to right, #008081 0%, #008081 ${ratingPercent}%, #e5e7eb ${ratingPercent}%, #e5e7eb 100%)`,
                }}
              />

              <div className="mt-4 flex justify-between text-xs text-slate-500">
                <span>Any</span>
                <span>3.0</span>
                <span>4.0</span>
                <span>5.0</span>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-slate-200" />

          <section>
            <div className="mb-5 flex items-center gap-2">
              <Wallet className="text-[#008081]" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">
                Consultation Fee
              </h3>
            </div>
 
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-xs font-medium text-slate-500"
                  htmlFor="min-price"
                >
                  Minimum
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₱
                  </span>
                  <input
                    id="min-price"
                    type="number"
                    min={0}
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Min"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-[#008081]"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-medium text-slate-500"
                  htmlFor="max-price"
                >
                  Maximum
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    ₱
                  </span>
                  <input
                    id="max-price"
                    type="number"
                    min={0}
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Max"
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 focus:ring-[#008081]"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="h-px w-full bg-slate-200" />

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Video className="text-[#008081]" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">
                Consultation Type
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { value: "all", label: "All" },
                { value: "video", label: "Video" },
                { value: "in_person", label: "In Person" },
              ].map((item) => {
                const active = consultationMode === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setConsultationMode(
                        item.value as "all" | "video" | "in_person",
                      )
                    }
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#008081] text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="h-px w-full bg-slate-200" />

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Globe className="text-[#008081]" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">Language</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {LANGUAGE_OPTIONS.map((item) => {
                const active = language === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLanguage(item)}
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-[#008081] text-white shadow-md"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="h-px w-full bg-slate-200" />

          <section className="pb-2">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="text-[#008081]" size={20} />
              <h3 className="text-lg font-semibold text-slate-900">
                Doctor Status
              </h3>
            </div>

            <div className="grid gap-3">
              {[
                {
                  label: "Verified Only",
                  desc: "Doctors with verified profiles",
                  checked: verifiedOnly,
                  setChecked: setVerifiedOnly,
                },
                {
                  label: "Accepting New Patients",
                  desc: "Doctors currently open for booking",
                  checked: acceptingOnly,
                  setChecked: setAcceptingOnly,
                },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#008081]/30 hover:bg-slate-50"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.setChecked(e.target.checked)}
                      className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-300 bg-white transition-all checked:border-[#008081] checked:bg-[#008081]"
                    />
                    <Check
                      size={14}
                      className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100"
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-800">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-5 py-3 text-sm font-medium text-[#008081] transition-colors hover:bg-slate-100"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-[#008081] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#00736f]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
