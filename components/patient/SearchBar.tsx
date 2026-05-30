"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Sliders, X } from "lucide-react";

const PH_LOCATION_OPTIONS = [
  {
    label: "All Philippines",
    value: "",
    note: "Search nationwide",
  },
  {
    label: "Metro Manila",
    value: "Metro Manila",
    note: "NCR · Clinics & hospitals",
  },
  {
    label: "Cebu",
    value: "Cebu",
    note: "Visayas hub",
  },
  {
    label: "Davao",
    value: "Davao",
    note: "Mindanao hub",
  },
  {
    label: "Baguio",
    value: "Baguio",
    note: "Cooler city choice",
  },
  {
    label: "Iloilo",
    value: "Iloilo",
    note: "Central Visayas access",
  },
  {
    label: "Cagayan de Oro",
    value: "Cagayan de Oro",
    note: "Northern Mindanao",
  },
  {
    label: "General Santos",
    value: "General Santos",
    note: "South Cotabato area",
  },
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
  onRecommendDoctors: (query: string, location: string) => Promise<void> | void;
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
  onRecommendDoctors,
}: SearchBarProps) {
  const [draftQuery, setDraftQuery] = useState(query);
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    if (searchOpen) {
      setDraftQuery(query);
    }
  }, [searchOpen, query]);

  const queryText = useMemo(() => {
    const value = query.trim();
    return value.length > 0 ? value : "Search doctors, symptoms, or specialties";
  }, [query]);

  const locationText = useMemo(() => {
    return locationQuery.trim().length > 0
      ? locationQuery
      : "Choose location in the Philippines";
  }, [locationQuery]);

  const handleSubmitSearch = () => {
    const nextQuery = draftQuery.trim();

    setQuery(nextQuery);
    setSearchOpen(false);

    if (nextQuery) {
      void onRecommendDoctors(nextQuery, locationQuery);
    }
  };

  const handleChooseLocation = (value: string) => {
    setLocationQuery(value);
    setLocationOpen(false);

    const nextQuery = draftQuery.trim() || query.trim();
    if (nextQuery) {
      void onRecommendDoctors(nextQuery, value);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row">
        <button
          type="button"
          onClick={() => setSearchOpen((prev) => !prev)}
          className="flex w-full flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-slate-50"
        >
          <span className="text-slate-400">
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </span>

          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm font-medium ${
                query.trim() ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {queryText}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLocationOpen(true)}
          className="flex w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:bg-slate-50 md:w-72"
        >
          <div className="flex min-w-0 items-center gap-2">
            <MapPin size={16} className="shrink-0 text-[#008081]" />
            <div className="min-w-0 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Location
              </p>
              <span
                className={`block truncate text-sm font-medium ${
                  locationQuery.trim() ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {locationText}
              </span>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            Pick area
          </span>
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
        {["All areas", "Davao City, PH", "Matina", "Poblacion", "Lanang", "Bajada"].map(
          (place) => {
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
          },
        )}
      </div>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-h-[90dvh] md:max-w-3xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between bg-gradient-to-br from-white to-slate-50 px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6 md:px-8 md:pb-6 md:pt-8">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#008081]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#008081] sm:text-xs">
                  <span className="text-sm">✦</span>
                  AI Search
                </div>
                <h3 className="max-w-[18rem] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:max-w-none">
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

            <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8 mobile-scroll">
              <div className="space-y-6 sm:space-y-8">
                <div className="rounded-2xl bg-slate-50 p-4 sm:p-6">
                  <p className="mb-1 text-sm font-semibold text-slate-900 sm:text-base">
                    Describe what you feel, and we’ll narrow down the best doctor type.
                  </p>
                  <p className="text-sm text-slate-500">
                    Example: fever, cough, sore throat, skin rash, chest pain, or headache.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={draftQuery}
                    onChange={(e) => setDraftQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitSearch();
                      }
                    }}
                    placeholder="Example: I have a persistent fever and dry cough for the last 3 days..."
                    className="h-32 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-16 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#008081] focus:ring-2 focus:ring-[#008081]/20 placeholder:text-slate-400 sm:px-5"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitSearch}
                    className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#008081] text-white shadow-md transition-colors hover:bg-[#006a66]"
                    aria-label="Submit Search"
                  >
                    <Search size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">
                    Common Symptoms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SYMPTOMS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDraftQuery(item)}
                        className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[#008081]/20 hover:bg-[#008081]/10 hover:text-[#008081] sm:px-4"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest text-slate-500 sm:text-xs">
                      Nearby Places
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {["Davao City, PH", "Matina", "Poblacion", "Lanang", "Bajada"].map(
                        (place) => (
                          <button
                            key={place}
                            type="button"
                            onClick={() => handleChooseLocation(place)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition-colors sm:px-4 ${
                              locationQuery === place
                                ? "border-[#008081] bg-[#008081] text-white"
                                : "border-slate-200 text-slate-700 hover:border-[#008081] hover:text-[#008081]"
                            }`}
                          >
                            {place}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {locationOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm md:items-center md:p-4"
          onClick={() => setLocationOpen(false)}
        >
          <div
            className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-h-[90dvh] md:max-w-4xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-4 pb-4 pt-5 sm:px-6 sm:pb-4 sm:pt-6 md:px-8">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#008081] sm:text-xs">
                  Choose location
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                  Where in the Philippines are you looking?
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pick a city or region to narrow down doctor results.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLocationOpen(false)}
                aria-label="close location picker"
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#008081]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-6 sm:pb-6 md:px-8 mobile-scroll">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PH_LOCATION_OPTIONS.map((item) => {
                  const active =
                    (item.value === "" && !locationQuery) ||
                    locationQuery === item.value;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleChooseLocation(item.value)}
                      className={`group rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        active
                          ? "border-[#008081] bg-[#008081]/5"
                          : "border-slate-200 bg-white hover:border-[#008081]/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold ${
                              active ? "text-[#008081]" : "text-slate-900"
                            }`}
                          >
                            {item.label}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                        </div>

                        <span
                          className={`mt-0.5 rounded-full px-2 py-1 text-[11px] font-semibold ${
                            active
                              ? "bg-[#008081] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {active ? "Selected" : "Choose"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    Current selection
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {locationQuery || "All Philippines"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}