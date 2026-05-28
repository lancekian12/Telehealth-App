"use client";

import React from "react";
import { MapPin, Search, Sliders, X } from "lucide-react";

const PLACE_OPTIONS = [
  "All areas",
  "Davao City, PH",
  "Matina",
  "Poblacion",
  "Lanang",
  "Bajada",
];

const COMMON_SYMPTOMS = [
  "Fever and cough",
  "Chest pain",
  "Skin rash",
  "Headache and dizziness",
  "Back pain",
];

type SearchBarProps = {
  query: string;
  setQuery: (value: string) => void;
  locationQuery: string;
  setLocationQuery: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sort: string;
  setSort: (value: string) => void;
  onOpenFilters: () => void;
};

export default function SearchBar({
  query,
  setQuery,
  locationQuery,
  setLocationQuery,
  searchOpen,
  setSearchOpen,
  sort,
  setSort,
  onOpenFilters,
}: SearchBarProps) {
  return (
    <div className="mb-6 space-y-4">

      <div className="flex flex-col gap-2 md:flex-row">
        <button
          type="button"
          onClick={() => setSearchOpen((prev) => !prev)}
          className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <span className="text-slate-400">
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              Search doctors, symptoms, or specialties
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLocationQuery(locationQuery || "Davao City, PH")}
          className="flex w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-slate-50 md:w-56"
        >
          <div className="flex min-w-0 items-center gap-2">
            <MapPin size={16} className="shrink-0 text-[#008081]" />
            <span className="truncate text-sm font-medium text-slate-900">
              {locationQuery || "Davao City, PH"}
            </span>
          </div>
          <span className="text-xs text-slate-400">Places</span>
        </button>

        <button
          type="button"
          onClick={onOpenFilters}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 md:w-auto"
        >
          <Sliders size={16} />
          Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PLACE_OPTIONS.map((place) => {
          const active =
            (place === "All areas" && !locationQuery) || place === locationQuery;

          return (
            <button
              key={place}
              type="button"
              onClick={() => setLocationQuery(place === "All areas" ? "" : place)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-[#008081] bg-[#008081]/10 text-[#008081]"
                  : "border-slate-200 text-slate-600 hover:border-[#008081] hover:text-[#008081]"
              }`}
            >
              {place}
            </button>
          );
        })}
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between bg-gradient-to-br from-white to-slate-50 px-8 pb-6 pt-8">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#008081]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#008081]">
                  <span className="text-sm">✦</span>
                  AI Search
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
                  Search by symptoms or doctor type
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="close search"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#008081]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-8 px-8 pb-8">
              <div className="rounded-2xl bg-slate-50 p-6">
                <p className="mb-1 text-base font-semibold text-slate-900">
                  You can describe your symptoms instead of typing a doctor name.
                </p>
                <p className="text-sm text-slate-500">
                  Example: fever, cough, sore throat, skin rash, chest pain, or headache.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Example: I have a persistent fever and dry cough for the last 3 days..."
                  className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#008081] focus:ring-2 focus:ring-[#008081]/20 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#008081] text-white shadow-md transition-colors hover:bg-[#006a66]"
                  aria-label="Submit Search"
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Common Symptoms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setQuery(item)}
                      className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#008081]/20 hover:bg-[#008081]/10 hover:text-[#008081]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Nearby Places
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PLACE_OPTIONS.filter((place) => place !== "All areas").map(
                      (place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => setLocationQuery(place)}
                          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                            locationQuery === place
                              ? "border-[#008081] bg-[#008081] text-white"
                              : "border-slate-200 text-slate-700 hover:border-[#008081] hover:text-[#008081]"
                          }`}
                        >
                          {place}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}