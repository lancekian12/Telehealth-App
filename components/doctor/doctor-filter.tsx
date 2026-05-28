"use client";

import { ChevronDown, X } from "lucide-react";
import type { JSX } from "react";

export type DoctorSortOption =
  | "relevance"
  | "rating"
  | "feeLow"
  | "feeHigh"
  | "experience";

export type DoctorFilters = {
  search: string;
  specializations: string[];
  consultationModes: string[];
  languages: string[];
  genders: string[];
  insurance: string[];
  patientGroups: string[];
  minRating: number;
  minExperience: number;
  maxFee: number;
  maxDistance: number;
  availableToday: boolean;
  availableThisWeek: boolean;
  weekendAvailability: boolean;
  acceptsNewPatients: boolean;
  telehealthOnly: boolean;
  inPersonOnly: boolean;
  boardCertifiedOnly: boolean;
  verifiedOnly: boolean;
  sortBy: DoctorSortOption;
};

type Props = {
  value: DoctorFilters;
  onChange: (next: DoctorFilters) => void;
  onReset: () => void;
};

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Psychiatry",
  "Oncology",
  "Endocrinology",
  "Gastroenterology",
  "Urology",
  "Pulmonology",
  "ENT",
  "Ophthalmology",
  "General Practice",
];

const CONSULTATION_MODES = ["Video Call", "In Person", "Phone Call"];
const LANGUAGES = ["English", "Tagalog", "Cebuano", "Spanish", "French", "Hindi"];
const GENDERS = ["Female", "Male", "Any"];
const INSURANCE = [
  "PhilHealth",
  "Private Pay",
  "Aetna",
  "Blue Cross",
  "Cigna",
  "UnitedHealthcare",
];
const PATIENT_GROUPS = ["Children", "Teens", "Adults", "Seniors"];

function Chip({
  active,
  label,
  onClick,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-2 text-sm font-medium transition",
        active
          ? "border-[#008081] bg-[#008081] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-[#008081] hover:text-[#008081]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#008081]">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function DoctorFilter({
  value,
  onChange,
  onReset,
}: Props): JSX.Element {
  const toggleArrayValue = (
    key:
      | "specializations"
      | "consultationModes"
      | "languages"
      | "genders"
      | "insurance"
      | "patientGroups",
    item: string,
  ) => {
    const current = value[key];
    const next = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];

    onChange({ ...value, [key]: next });
  };

  const setBoolean = (
    key:
      | "availableToday"
      | "availableThisWeek"
      | "weekendAvailability"
      | "acceptsNewPatients"
      | "telehealthOnly"
      | "inPersonOnly"
      | "boardCertifiedOnly"
      | "verifiedOnly",
    nextValue: boolean,
  ) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <aside className="h-full rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,128,129,0.05)] lg:overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-['Manrope'] text-xl font-extrabold text-slate-900">
          Filter By
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#008081] hover:text-[#008081]"
        >
          <X className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[#008081]">
            Search
          </label>
          <input
            type="text"
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
            placeholder="Name, specialty, condition..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#008081] focus:ring-4 focus:ring-[#008081]/10"
          />
        </div>

        <Section title="Specialization">
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                active={value.specializations.includes(item)}
                onClick={() => toggleArrayValue("specializations", item)}
              />
            ))}
          </div>
        </Section>

        <Section title="Consultation Mode">
          <div className="flex flex-wrap gap-2">
            {CONSULTATION_MODES.map((item) => (
              <Chip
                key={item}
                label={item}
                active={value.consultationModes.includes(item)}
                onClick={() => toggleArrayValue("consultationModes", item)}
              />
            ))}
          </div>
        </Section>

        <Section title="Availability">
          <div className="space-y-3">
            {[
              ["availableToday", "Available today"],
              ["availableThisWeek", "Available this week"],
              ["weekendAvailability", "Weekend availability"],
              ["acceptsNewPatients", "Accepts new patients"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={
                    value[
                      key as
                        | "availableToday"
                        | "availableThisWeek"
                        | "weekendAvailability"
                        | "acceptsNewPatients"
                    ]
                  }
                  onChange={(e) =>
                    setBoolean(
                      key as
                        | "availableToday"
                        | "availableThisWeek"
                        | "weekendAvailability"
                        | "acceptsNewPatients",
                      e.target.checked,
                    )
                  }
                  className="h-5 w-5 rounded border-slate-200 text-[#008081] focus:ring-[#008081]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Credentials">
          <div className="space-y-3">
            {[
              ["verifiedOnly", "Verified doctors only"],
              ["boardCertifiedOnly", "Board certified only"],
              ["telehealthOnly", "Telehealth only"],
              ["inPersonOnly", "In-person only"],
            ].map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={
                    value[
                      key as
                        | "verifiedOnly"
                        | "boardCertifiedOnly"
                        | "telehealthOnly"
                        | "inPersonOnly"
                    ]
                  }
                  onChange={(e) =>
                    setBoolean(
                      key as
                        | "verifiedOnly"
                        | "boardCertifiedOnly"
                        | "telehealthOnly"
                        | "inPersonOnly",
                      e.target.checked,
                    )
                  }
                  className="h-5 w-5 rounded border-slate-200 text-[#008081] focus:ring-[#008081]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title="Rating">
          <div className="flex gap-2">
            {[3.5, 4, 4.5, 4.8].map((rating) => (
              <Chip
                key={rating}
                label={`${rating}+`}
                active={value.minRating === rating}
                onClick={() => onChange({ ...value, minRating: rating })}
              />
            ))}
          </div>
        </Section>

        <Section title="Experience">
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={value.minExperience}
            onChange={(e) =>
              onChange({ ...value, minExperience: Number(e.target.value) })
            }
            className="w-full accent-[#008081]"
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
            <span>0 yrs</span>
            <span>{value.minExperience}+ yrs</span>
            <span>40+ yrs</span>
          </div>
        </Section>

        <Section title="Consultation Fee">
          <input
            type="range"
            min={0}
            max={500}
            step={5}
            value={value.maxFee}
            onChange={(e) => onChange({ ...value, maxFee: Number(e.target.value) })}
            className="w-full accent-[#008081]"
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
            <span>$0</span>
            <span>Up to ${value.maxFee}</span>
            <span>$500+</span>
          </div>
        </Section>

        <Section title="Distance">
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={value.maxDistance}
            onChange={(e) =>
              onChange({ ...value, maxDistance: Number(e.target.value) })
            }
            className="w-full accent-[#008081]"
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-500">
            <span>1 km</span>
            <span>Within {value.maxDistance} km</span>
            <span>100 km+</span>
          </div>
        </Section>

        <Section title="Language">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((item) => (
              <Chip
                key={item}
                label={item}
                active={value.languages.includes(item)}
                onClick={() => toggleArrayValue("languages", item)}
              />
            ))}
          </div>
        </Section>

        <Section title="Gender">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((item) => (
              <Chip
                key={item}
                label={item}
                active={value.genders.includes(item)}
                onClick={() => toggleArrayValue("genders", item)}
              />
            ))}
          </div>
        </Section>

        <Section title="Insurance / Payment">
          <div className="flex flex-wrap gap-2">
            {INSURANCE.map((item) => (
              <Chip
                key={item}
                label={item}
                active={value.insurance.includes(item)}
                onClick={() => toggleArrayValue("insurance", item)}
              />
            ))}
          </div>
        </Section>

        <Section title="Patient Group">
          <div className="flex flex-wrap gap-2">
            {PATIENT_GROUPS.map((item) => (
              <Chip
                key={item}
                label={item}
                active={value.patientGroups.includes(item)}
                onClick={() => toggleArrayValue("patientGroups", item)}
              />
            ))}
          </div>
        </Section>

        <Section title="Sort By">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["relevance", "Relevance"],
                ["rating", "Highest Rating"],
                ["feeLow", "Lowest Fee"],
                ["feeHigh", "Highest Fee"],
                ["experience", "Most Experience"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...value, sortBy: key })}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
                  value.sortBy === key
                    ? "border-[#008081] bg-[#008081] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#008081] hover:text-[#008081]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}