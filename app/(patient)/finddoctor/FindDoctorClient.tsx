"use client";

import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  DivIcon,
  LatLngExpression,
  Map as LeafletMap,
  Marker as LeafletMarker,
} from "leaflet";
import {
  Star,
  Heart,
  Plus,
  Minus,
  LocateFixed,
  Maximize2,
  List as ListIcon,
  Map as MapIcon,
  RefreshCw,
  Stethoscope,
  Video,
  Globe,
  Sparkles,
  X,
} from "lucide-react";

import SearchBar from "@/components/patient/SearchBar";
import FilterModal from "@/components/patient/FilterModal";
import { DoctorApiItem, FindDoctor } from "@/types/doctor";
import AvailabilityPanel from "@/components/patient/AvailabilityPanel";

declare global {
  interface Window {
    __doctorMap?: LeafletMap;
  }
}

type AiResponse = {
  success: boolean;
  source: "gemini" | "fallback";
  input: string;
  location: string;
  recommendation: {
    urgency: "routine" | "soon" | "urgent" | "emergency";
    specializations: string[];
    summary: string;
    redFlags: string[];
    searchKeywords: string[];
    confidence: number;
  };
  suggestedSpecializations: string[];
  suggestedDoctors: Array<{
    id: string;
    name: string;
    specialization: string;
    location: string;
    score: number;
    reason: string;
  }>;
  disclaimer: string;
  message?: string;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SPECIALTY_ALIASES: Record<string, string[]> = {
  "general practitioner": [
    "general practitioner",
    "family medicine",
    "internal medicine",
    "primary care",
    "general physician",
  ],
  "family medicine": [
    "family medicine",
    "general practitioner",
    "internal medicine",
    "primary care",
    "general physician",
  ],
  "internal medicine": [
    "internal medicine",
    "general practitioner",
    "family medicine",
    "primary care",
    "general physician",
  ],
  cardiology: ["cardiology", "cardiologist", "heart specialist"],
  pulmonology: ["pulmonology", "pulmonologist", "lung specialist"],
  dermatology: ["dermatology", "dermatologist", "skin specialist"],
  neurology: ["neurology", "neurologist", "brain specialist"],
  orthopedics: ["orthopedics", "orthopedic", "orthopedist", "bone specialist"],
};

function matchesSpecialty(doctorSpecialty: string, targetSpecialty: string) {
  const doctor = normalize(doctorSpecialty);
  const target = normalize(targetSpecialty);

  const doctorAliases = SPECIALTY_ALIASES[doctor] ?? [doctor];
  const targetAliases = SPECIALTY_ALIASES[target] ?? [target];

  return doctorAliases.some((d) =>
    targetAliases.some((t) => d.includes(t) || t.includes(d)),
  );
}

function AiSearchModal({
  open,
  loading,
  error,
  summary,
  specializations,
  urgency,
  onClose,
}: {
  open: boolean;
  loading: boolean;
  error: string | null;
  summary: string;
  specializations: string[];
  urgency: "routine" | "soon" | "urgent" | "emergency" | null;
  onClose: () => void;
}) {
  if (!open) return null;

  const urgencyLabel =
    urgency === "emergency"
      ? "Emergency"
      : urgency === "urgent"
        ? "Urgent"
        : urgency === "soon"
          ? "Soon"
          : "Routine";

  return (
    <div className=" fixed inset-0 z-[260] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#008081]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#008081]">
              <Sparkles size={14} />
              AI Searching
            </div>
            <h3 className="mt-3 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Finding the best doctor match
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The assistant is checking symptoms and matching them to
              specializations.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#008081] dark:hover:bg-slate-800"
            aria-label="Close AI modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50 sm:mt-6">
          {loading ? (
            <div className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 animate-spin rounded-full border-2 border-[#008081] border-t-transparent" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  AI is searching doctors...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Please wait while we rank the most relevant specializations.
                </p>
              </div>
            </div>
          ) : error ? (
            <div>
              <p className="font-semibold text-amber-600">
                Search completed with a warning
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {error}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {urgencyLabel} priority
                </p>
                <span className="w-fit rounded-full bg-[#008081]/10 px-3 py-1 text-xs font-semibold text-[#008081]">
                  AI Ready
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {summary || "Results are ready."}
              </p>

              {specializations.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {specializations.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#008081]/20 bg-white px-3 py-1 text-xs font-medium text-[#008081] dark:border-[#008081]/30 dark:bg-slate-900"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-stretch sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-[#008081] px-5 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#00736f] sm:w-auto"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

const mapButtonClass =
  "flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/95 text-slate-600 shadow-[var(--shadow-soft)] backdrop-blur-md transition-colors hover:text-primary disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-300";

function MapOverlay({
  locationLabel,
  total,
  accepting,
  booked,
  locating,
  onFitAll,
  onLocate,
}: {
  locationLabel: string;
  total: number;
  accepting: number;
  booked: number;
  locating: boolean;
  onFitAll: () => void;
  onLocate: () => void;
}) {
  return (
    <>
      {/* Top: where we are searching + how many pins */}
      <div className="pointer-events-none absolute left-3 right-16 top-3 z-[500] sm:left-5 sm:top-5 lg:top-24">
        <div className="pointer-events-auto inline-flex max-w-full animate-fade-up items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-2.5 shadow-[var(--shadow-soft)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Searching in
            </p>
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {locationLabel}
              <span className="ml-2 font-medium text-slate-500 dark:text-slate-400">
                · {total} {total === 1 ? "doctor" : "doctors"} on map
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Right: map controls */}
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2 sm:right-5 sm:top-5 lg:top-24">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 shadow-[var(--shadow-soft)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95">
          <button
            type="button"
            onClick={() => window.__doctorMap?.zoomIn()}
            className="flex h-11 w-11 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Plus size={18} />
          </button>
          <div className="h-px bg-slate-200/80 dark:bg-slate-700" />
          <button
            type="button"
            onClick={() => window.__doctorMap?.zoomOut()}
            className="flex h-11 w-11 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Minus size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={onFitAll}
          className={mapButtonClass}
          aria-label="Show all doctors"
          title="Show all doctors"
        >
          <Maximize2 size={18} />
        </button>

        <button
          type="button"
          onClick={onLocate}
          disabled={locating}
          className={mapButtonClass}
          aria-label="Show my location"
          title="Show my location"
        >
          <LocateFixed size={18} className={locating ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Bottom: legend */}
      <div className="absolute bottom-24 left-3 z-[500] sm:left-5 lg:bottom-8">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-[var(--shadow-soft)] backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-white" />
            Accepting ({accepting})
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-400 ring-2 ring-white" />
            Fully booked ({booked})
          </span>
        </div>
      </div>
    </>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isDarkScheme(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

export default function FindDoctorClient(): JSX.Element {
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("All areas");
  const [sort, setSort] = useState("Recommended");
  const [page, setPage] = useState(1);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [consultationMode, setConsultationMode] = useState<
    "all" | "video" | "in_person"
  >("all");
  const [language, setLanguage] = useState("All languages");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState("All specialties");
  const [minRating, setMinRating] = useState(0);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">(5000);

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<FindDoctor | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const [doctors, setDoctors] = useState<FindDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  const [aiRankedDoctorIds, setAiRankedDoctorIds] = useState<string[]>([]);
  const [aiSuggestedSpecializations, setAiSuggestedSpecializations] = useState<
    string[]
  >([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiUrgency, setAiUrgency] = useState<
    "routine" | "soon" | "urgent" | "emergency" | null
  >(null);

  const mapHostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const markersRef = useRef<Map<string, LeafletMarker>>(new Map());
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const fittedKeyRef = useRef("");
  // Work deferred while the map is hidden (mobile list view): zero-size
  // maps cannot fit bounds or fly anywhere.
  const pendingFitRef = useRef(false);
  const pendingFocusRef = useRef<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [hoveredDoctorId, setHoveredDoctorId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const philippinesCenter = useMemo<LatLngExpression>(
    () => [12.8797, 121.774],
    [],
  );

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setDoctorError(null);

        const res = await fetch("/api/doctors");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load doctors");
        }

        const mappedDoctors: FindDoctor[] = (
          data.doctors as DoctorApiItem[]
        ).map((doctor) => {
          const tags = [
            ...(doctor.verified ? ["Verified"] : []),
            ...(doctor.acceptsNewPatients ? ["Accepting patients"] : []),
            ...(doctor.consultationModes?.includes("video")
              ? ["Online Available"]
              : []),
            ...(doctor.languages || []),
          ];

          return {
            id: doctor.id,
            name: doctor.fullName,
            specialty: doctor.specialization,
            hospital: doctor.clinicAddress || "Clinic",
            clinicAddress: doctor.clinicAddress || "",
            locationLabel: doctor.clinicAddress || "Unknown location",
            coords:
              typeof doctor.latitude === "number" &&
              typeof doctor.longitude === "number"
                ? [doctor.latitude, doctor.longitude]
                : null,
            fee: doctor.consultationFee ?? 0,
            rating: doctor.rating ?? 0,
            reviews: 0,
            img: doctor.profilePicture || "/doctor-placeholder.png",
            tags,
            status: doctor.acceptsNewPatients ? "accepting" : "fully_booked",
            bio: doctor.bio || "",
            verified: doctor.verified ?? false,
            acceptsNewPatients: doctor.acceptsNewPatients ?? false,
            consultationModes: (doctor.consultationModes || []) as Array<
              "video" | "in_person"
            >,
            languages: doctor.languages || [],
          };
        });

        setDoctors(mappedDoctors);
      } catch (error) {
        setDoctorError(
          error instanceof Error ? error.message : "Failed to load doctors",
        );
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    void loadDoctors();
  }, []);

  const specialtyOptions = useMemo(() => {
    const items = doctors.map((d) => d.specialty?.trim()).filter(Boolean);
    return ["All specialties", ...Array.from(new Set(items)).sort()];
  }, [doctors]);

  const languageOptions = useMemo(() => {
    const items = doctors
      .flatMap((d) => d.languages || [])
      .map((l) => l.trim())
      .filter(Boolean);

    return ["All languages", ...Array.from(new Set(items)).sort()];
  }, [doctors]);

  const runAiRecommendation = useCallback(
    async (nextQuery: string, nextLocation: string) => {
      const symptoms = nextQuery.trim();

      if (!symptoms) {
        setAiRankedDoctorIds([]);
        setAiSuggestedSpecializations([]);
        setAiError(null);
        setAiSummary("");
        setAiUrgency(null);
        setAiModalOpen(false);
        return;
      }

      setAiModalOpen(true);
      setAiLoading(true);
      setAiError(null);
      setAiSummary("");
      setAiUrgency(null);

      try {
        const res = await fetch("/api/ai-recommendation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: symptoms,
            location: nextLocation,
            doctors,
          }),
        });

        const data = (await res.json()) as AiResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to get recommendations");
        }

        setAiSuggestedSpecializations(
          Array.isArray(data.suggestedSpecializations)
            ? data.suggestedSpecializations
            : [],
        );

        setAiRankedDoctorIds(
          Array.isArray(data.suggestedDoctors)
            ? data.suggestedDoctors
                .map((item) => item.id)
                .filter((id): id is string => Boolean(id))
            : [],
        );

        setAiSummary(data.recommendation?.summary || "");
        setAiUrgency(data.recommendation?.urgency ?? null);
      } catch (error) {
        setAiRankedDoctorIds([]);
        setAiSuggestedSpecializations([]);
        setAiSummary("");
        setAiUrgency(null);
        setAiError(
          error instanceof Error ? error.message : "Recommendation unavailable",
        );
      } finally {
        setAiLoading(false);
      }
    },
    [doctors],
  );

  const aiRankMap = useMemo(() => {
    return new Map(aiRankedDoctorIds.map((id, index) => [id, index]));
  }, [aiRankedDoctorIds]);

  const filteredAll = useMemo(() => {
    const queryText = normalize(query);
    const locationText = normalize(locationQuery);
    const specialtyText = normalize(specialtyFilter);
    const languageText = normalize(language);

    const minPriceValue = typeof minPrice === "number" ? minPrice : 0;
    const maxPriceValue = typeof maxPrice === "number" ? maxPrice : 5000;

    return doctors
      .filter((d) => {
        const searchPool = normalize(
          [
            d.name,
            d.specialty,
            d.hospital,
            d.locationLabel,
            d.clinicAddress,
            d.bio || "",
            ...(d.languages || []),
            ...(d.consultationModes || []),
            ...(d.tags || []),
          ].join(" "),
        );

        const queryMatchesText =
          !queryText ||
          searchPool.includes(queryText) ||
          normalize(d.specialty).includes(queryText) ||
          normalize(d.name).includes(queryText);

        const queryMatchesAiSpecialization =
          aiSuggestedSpecializations.length > 0
            ? aiSuggestedSpecializations.some((spec) =>
                matchesSpecialty(d.specialty, spec),
              )
            : false;

        const matchesQuery = queryMatchesText || queryMatchesAiSpecialization;

        const matchesLocation =
          !locationText ||
          locationQuery === "All areas" ||
          searchPool.includes(locationText);

        const matchesSpecialtyFilter =
          !specialtyText ||
          specialtyFilter === "All specialties" ||
          normalize(d.specialty).includes(specialtyText);

        const matchesLanguage =
          !languageText ||
          language === "All languages" ||
          (d.languages || []).some((item) =>
            normalize(item).includes(languageText),
          );

        const matchesConsultationMode =
          consultationMode === "all" ||
          (d.consultationModes || []).includes(consultationMode);

        const matchesVerified = !verifiedOnly || !!d.verified;
        const matchesAccepting = !acceptingOnly || !!d.acceptsNewPatients;
        const matchesRating = d.rating >= minRating;
        const matchesPrice = d.fee >= minPriceValue && d.fee <= maxPriceValue;

        return (
          matchesQuery &&
          matchesLocation &&
          matchesSpecialtyFilter &&
          matchesLanguage &&
          matchesConsultationMode &&
          matchesVerified &&
          matchesAccepting &&
          matchesRating &&
          matchesPrice
        );
      })
      .sort((a, b) => {
        const rankA = aiRankMap.get(a.id);
        const rankB = aiRankMap.get(b.id);

        if (rankA !== undefined || rankB !== undefined) {
          if (rankA === undefined) return 1;
          if (rankB === undefined) return -1;
          return rankA - rankB;
        }

        if (sort === "Highest Rated") return b.rating - a.rating;
        if (sort === "Consultation Fee") return a.fee - b.fee;
        return b.rating - a.rating;
      });
  }, [
    doctors,
    query,
    locationQuery,
    sort,
    specialtyFilter,
    language,
    consultationMode,
    verifiedOnly,
    acceptingOnly,
    minRating,
    minPrice,
    maxPrice,
    aiRankMap,
    aiSuggestedSpecializations,
  ]);

  const visibleDoctors = useMemo(() => {
    if (!aiSuggestedSpecializations.length) return filteredAll;

    const matches = filteredAll.filter((doctor) =>
      aiSuggestedSpecializations.some((spec) =>
        matchesSpecialty(doctor.specialty, spec),
      ),
    );

    return matches.length > 0 ? matches : filteredAll;
  }, [filteredAll, aiSuggestedSpecializations]);

  const selectedDate = useMemo(() => {
    const days: {
      key: string;
      day: string;
      date: number;
      fullDate: string;
      active: boolean;
      muted: boolean;
    }[] = [];

    const now = new Date();

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${dayNum}`;

      const day = d
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();

      days.push({
        key: fullDate,
        day,
        date: d.getDate(),
        fullDate,
        active: i === selectedDayIndex,
        muted: day === "SAT" || day === "SUN",
      });
    }

    return days;
  }, [selectedDayIndex]);

  const openAvailabilityPanel = (doctor: FindDoctor) => {
    if (doctor.status === "fully_booked") return;

    setActiveDoctor(doctor);
    setSelectedTime("");
    setSelectedDayIndex(0);
    setPanelOpen(true);
  };

  const PAGE_SIZE = 2;
  const totalPages = Math.max(1, Math.ceil(visibleDoctors.length / PAGE_SIZE));

  const displayed = useMemo(() => {
    const end = Math.min(page * PAGE_SIZE, visibleDoctors.length);
    return visibleDoctors.slice(0, end);
  }, [visibleDoctors, page]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [
    query,
    locationQuery,
    sort,
    specialtyFilter,
    minRating,
    minPrice,
    maxPrice,
    aiSuggestedSpecializations,
    aiRankedDoctorIds,
  ]);

  function createDoctorIcon(
    L: typeof import("leaflet"),
    doctor: FindDoctor,
    active: boolean,
  ): DivIcon {
    const classes = [
      "doc-pin",
      doctor.status === "fully_booked" ? "is-booked" : "",
      active ? "is-active" : "",
    ]
      .filter(Boolean)
      .join(" ");

    // CSS url() needs quotes/parens escaped before the HTML attribute escape.
    const photoUrl = doctor.img.replace(
      /["'()\\]/g,
      (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
    );

    return L.divIcon({
      className: "doc-pin-icon",
      html: `
        <div class="${classes}">
          <div class="doc-pin__bubble">
            <span class="doc-pin__photo" style="background-image:url('${escapeHtml(photoUrl)}')"></span>
            <span class="doc-pin__fee">₱${escapeHtml(doctor.fee.toLocaleString())}</span>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [0, -48],    });
  }

  function buildPopupHtml(doctor: FindDoctor): string {
    const booked = doctor.status === "fully_booked";
    return `
      <div>
        <div style="display:flex;gap:12px;padding:16px 16px 12px">
          <img src="${escapeHtml(doctor.img)}" alt="" style="width:56px;height:56px;border-radius:14px;object-fit:cover;flex-shrink:0" />
          <div style="min-width:0;padding-right:20px">
            <p style="margin:0;font-weight:800;font-size:15px;color:#0f172a;line-height:1.3">${escapeHtml(doctor.name)}</p>
            <p style="margin:4px 0 0;display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(0,128,129,.1);color:#008081;font-size:11px;font-weight:700">${escapeHtml(doctor.specialty)}</p>
            <p style="margin:6px 0 0;font-size:12px;color:#64748b;line-height:1.35">${escapeHtml(doctor.hospital)}</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 16px;border-top:1px solid #f1f5f9;background:#f8fafc">
          <span style="font-size:12px;color:#475569"><b style="color:#f59e0b">★</b> <b style="color:#0f172a">${doctor.rating.toFixed(1)}</b></span>
          <span style="font-size:15px;font-weight:800;color:#0f172a">₱${escapeHtml(String(doctor.fee))}<span style="font-size:11px;font-weight:500;color:#64748b"> / visit</span></span>
        </div>
        <div style="padding:12px 16px 16px">
          ${
            booked
              ? `<button type="button" disabled style="width:100%;padding:10px;border-radius:999px;border:0;background:#f1f5f9;color:#94a3b8;font-weight:700;font-size:13px">Fully booked</button>`
              : `<button type="button" data-book-doctor="${escapeHtml(doctor.id)}" style="width:100%;padding:10px;border-radius:999px;border:0;background:linear-gradient(90deg,#008081,#0a9a8f);color:#fff;font-weight:700;font-size:13px;cursor:pointer;box-shadow:0 8px 18px -8px rgba(0,128,129,.7)">View availability</button>`
          }
        </div>
      </div>
    `;
  }

  // Latest values for Leaflet event handlers, which are bound once.
  const visibleDoctorsRef = useRef(visibleDoctors);
  const openAvailabilityRef = useRef(openAvailabilityPanel);
  useEffect(() => {
    visibleDoctorsRef.current = visibleDoctors;
    openAvailabilityRef.current = openAvailabilityPanel;
  });

  const fitToDoctors = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const size = map.getSize();
    if (!size.x || !size.y) {
      pendingFitRef.current = true;
      return;
    }
    pendingFitRef.current = false;
    const points = [...markersRef.current.values()].map((m) => m.getLatLng());
    if (points.length === 0) {
      map.setView(philippinesCenter, 5);
      return;
    }
    if (points.length === 1) {
      map.flyTo(points[0], 14, { duration: 0.8 });
      return;
    }
    map.flyToBounds(points.map((p) => [p.lat, p.lng]) as [number, number][], {
      paddingTopLeft: [60, 140],
      paddingBottomRight: [80, 90],
      maxZoom: 14,
      duration: 0.8,
    });
  }, [philippinesCenter]);

  const flyToDoctor = useCallback((doctorId: string) => {
    const map = mapRef.current;
    const marker = markersRef.current.get(doctorId);
    if (!map || !marker) return;
    map.stop(); // cancel any running fly so its moveend can't open the popup early
    map.closePopup();
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), {
      duration: 0.8,
    });
    map.once("moveend", () => marker.openPopup());
  }, []);

  const focusDoctorOnMap = useCallback(
    (doctorId: string) => {
      setSelectedDoctorId(doctorId);
      const size = mapRef.current?.getSize();
      if (size && size.x && size.y) {
        flyToDoctor(doctorId);
      } else {
        // Mobile: open the map sheet first; the effect below flies once sized.
        pendingFocusRef.current = doctorId;
        setMapOpen(true);
      }
    },
    [flyToDoctor],
  );

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const map = mapRef.current;
        setLocating(false);
        if (!map) return;
        const L = await import("leaflet");
        const latLng: LatLngExpression = [coords.latitude, coords.longitude];
        userMarkerRef.current?.remove();
        userMarkerRef.current = L.marker(latLng, {
          icon: L.divIcon({
            className: "doc-pin-icon",
            html: '<div class="user-dot"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
          keyboard: false,
          zIndexOffset: 1000,
        })
          .bindTooltip("You are here", { direction: "top", offset: [0, -10] })
          .addTo(map);
        map.flyTo(latLng, 13, { duration: 0.8 });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    if (!mapHostRef.current) return;
    if (mapRef.current) return;

    let cancelled = false;
    const markers = markersRef.current;

    const initMap = async () => {
      const L = await import("leaflet");
      if (cancelled || !mapHostRef.current || mapRef.current) return;

      // No live map is tracked here, so any Leaflet id left on the node is
      // from an instance that was torn down (e.g. by a dev hot reload).
      const host = mapHostRef.current as HTMLDivElement & {
        _leaflet_id?: number | null;
      };
      if (host._leaflet_id) host._leaflet_id = null;

      const map = L.map(mapHostRef.current, {
        zoomControl: false,
        zoomSnap: 0.5,
      });

      mapRef.current = map;
      window.__doctorMap = map;

      // Esri Canvas basemap (no API key): a calm gray base so doctor pins
      // stand out, with labels drawn on a separate layer above it.
      const canvas = isDarkScheme() ? "World_Dark_Gray" : "World_Light_Gray";
      const esri = (layer: string) =>
        `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/${layer}/MapServer/tile/{z}/{y}/{x}`;
      L.tileLayer(esri(`${canvas}_Base`), {
        attribution:
          'Tiles &copy; <a href="https://www.esri.com">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors',
        maxZoom: 16,
      }).addTo(map);
      L.tileLayer(esri(`${canvas}_Reference`), { maxZoom: 16 }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      map.setView(philippinesCenter, 5);

      // Fee tags only when zoomed in enough that pins stop overlapping.
      const syncZoomClass = () =>
        map.getContainer().classList.toggle("map-zoomed-out", map.getZoom() < 13);
      map.on("zoomend", syncZoomClass);
      syncZoomClass();

      // Popup "View availability" button opens the booking panel.
      map.on("popupopen", (event) => {
        const button = event.popup
          .getElement()
          ?.querySelector<HTMLButtonElement>("[data-book-doctor]");
        if (!button) return;
        button.onclick = () => {
          const doctor = visibleDoctorsRef.current.find(
            (d) => d.id === button.dataset.bookDoctor,
          );
          if (doctor) {
            map.closePopup();
            setMapOpen(false);
            openAvailabilityRef.current(doctor);
          }
        };
      });

      // Re-measure whenever the map's box changes (window resize, mobile
      // sheet opening, page transitions), so Leaflet never uses a stale size.
      const resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(mapHostRef.current);

      const timeout = window.setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 200);

      const cleanup = () => {
        window.clearTimeout(timeout);
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
        if (window.__doctorMap === map) delete window.__doctorMap;
      };

      map.on("unload", cleanup);
      setMapReady(true);
    };

    void initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // ignore
        }
      }
      mapRef.current = null;
      markerLayerRef.current = null;
      markers.clear();
      if (window.__doctorMap) delete window.__doctorMap;
    };
  }, [hasMounted, philippinesCenter]);

  // Pins follow the filtered list, so the map always matches what you see.
  useEffect(() => {
    if (!mapReady) return;

    const syncMarkers = async () => {
      const map = mapRef.current;
      const markerLayer = markerLayerRef.current;
      if (!map || !markerLayer) return;

      const L = await import("leaflet");
      markerLayer.clearLayers();
      markersRef.current.clear();

      const doctorsWithCoords = visibleDoctors.filter(
        (doctor) => Array.isArray(doctor.coords) && doctor.coords.length === 2,
      );

      for (const doctor of doctorsWithCoords) {
        const marker = L.marker(doctor.coords as LatLngExpression, {
          icon: createDoctorIcon(L, doctor, false),
          title: doctor.name,
          riseOnHover: true,
        })
          .bindPopup(buildPopupHtml(doctor), {
            className: "doc-popup",
            closeButton: true,
            // Keep popups clear of the search chip (top) and legend (bottom).
            autoPanPaddingTopLeft: [16, 150],
            autoPanPaddingBottomRight: [16, 170],
          })
          .on("click", () => {
            setSelectedDoctorId(doctor.id);
            document
              .querySelector(`[data-doctor="${CSS.escape(doctor.id)}"]`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          })
          .on("mouseover", () => setHoveredDoctorId(doctor.id))
          .on("mouseout", () => setHoveredDoctorId(null));

        marker.addTo(markerLayer);
        markersRef.current.set(doctor.id, marker);
      }

      const key = doctorsWithCoords.map((d) => d.id).join("|");
      if (key !== fittedKeyRef.current) {
        fittedKeyRef.current = key;
        fitToDoctors();
      }
    };

    void syncMarkers();
  }, [visibleDoctors, mapReady, fitToDoctors]);

  // Highlight the pin for the hovered or selected doctor card.
  useEffect(() => {
    if (!mapReady) return;
    const activeId = hoveredDoctorId ?? selectedDoctorId;

    void import("leaflet").then((L) => {
      for (const doctor of visibleDoctorsRef.current) {
        const marker = markersRef.current.get(doctor.id);
        if (!marker) continue;
        const active = doctor.id === activeId;
        marker.setIcon(createDoctorIcon(L, doctor, active));
        marker.setZIndexOffset(active ? 900 : 0);
      }
    });
  }, [hoveredDoctorId, selectedDoctorId, mapReady]);

  // The mobile map sheet starts hidden; resize the map when it opens.
  useEffect(() => {
    if (!mapOpen) return;
    const id = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
      if (pendingFocusRef.current) {
        flyToDoctor(pendingFocusRef.current);
        pendingFocusRef.current = null;
        pendingFitRef.current = false;
      } else if (pendingFitRef.current) {
        fitToDoctors();
      }
    }, 80);
    return () => window.clearTimeout(id);
  }, [mapOpen, flyToDoctor, fitToDoctors]);

  const mapStats = useMemo(() => {
    const onMap = visibleDoctors.filter(
      (d) => Array.isArray(d.coords) && d.coords.length === 2,
    );
    const booked = onMap.filter((d) => d.status === "fully_booked").length;
    return { total: onMap.length, booked, accepting: onMap.length - booked };
  }, [visibleDoctors]);

  useEffect(() => {
    mapRef.current?.invalidateSize();
  }, [page]);

  function closePanel() {
    setPanelOpen(false);
  }

  function loadMore() {
    if (page < totalPages) setPage((p) => p + 1);
    else setPage(1);
  }

  const isAllLoaded = page >= totalPages;

  return (
    <div className="flex min-h-[100dvh] flex-col text-slate-900 dark:bg-[#0f172a] dark:text-slate-100">
      <main className="isolate relative flex min-h-[100dvh] flex-col overflow-hidden lg:flex-row">
        <section className="relative z-30 w-full min-w-0 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-4 pb-24 no-scrollbar sm:px-6 sm:py-6 lg:h-[100dvh] lg:w-1/2 lg:flex-none lg:p-8 dark:bg-[#0f172a] dark:from-transparent dark:to-transparent">
          <div className="relative z-[120] mx-auto max-w-4xl">
            <SearchBar
              query={query}
              setQuery={(value) => {
                setQuery(value);
                setPage(1);
              }}
              locationQuery={locationQuery}
              setLocationQuery={(value) => {
                setLocationQuery(value);
                setPage(1);
              }}
              searchOpen={searchOpen}
              setSearchOpen={setSearchOpen}
              sort={sort}
              setSort={setSort}
              onOpenFilters={() => setFiltersOpen(true)}
              onRecommendDoctors={runAiRecommendation}
            />

            <FilterModal
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              specialty={specialtyFilter}
              setSpecialty={setSpecialtyFilter}
              specialties={specialtyOptions}
              minRating={minRating}
              setMinRating={setMinRating}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              consultationMode={consultationMode}
              setConsultationMode={setConsultationMode}
              language={language}
              setLanguage={setLanguage}
              languages={languageOptions}
              verifiedOnly={verifiedOnly}
              setVerifiedOnly={setVerifiedOnly}
              acceptingOnly={acceptingOnly}
              setAcceptingOnly={setAcceptingOnly}
              onApply={() => setFiltersOpen(false)}
              onReset={() => {
                setSpecialtyFilter("All specialties");
                setMinRating(0);
                setMinPrice(0);
                setMaxPrice(5000);
                setConsultationMode("all");
                setLanguage("All languages");
                setVerifiedOnly(false);
                setAcceptingOnly(false);
              }}
            />

            {aiLoading ||
            aiSuggestedSpecializations.length > 0 ||
            aiError ||
            doctorError ? (
              <div className="mb-5 space-y-2 lg:mb-6">
                {aiLoading ? (
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-[#008081]">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#008081] border-t-transparent" />
                    Getting AI doctor suggestions...
                  </p>
                ) : aiSuggestedSpecializations.length > 0 ? (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-[#008081]/10 px-3 py-1 text-xs font-semibold text-[#008081] dark:bg-[#008081]/20">
                    <Sparkles size={12} />
                    Suggested: {aiSuggestedSpecializations.join(", ")}
                  </p>
                ) : aiError ? (
                  <p className="text-sm text-amber-600">{aiError}</p>
                ) : null}

                {doctorError ? (
                  <p className="text-sm text-red-500">{doctorError}</p>
                ) : null}
              </div>
            ) : null}

            <div className="stagger space-y-4 sm:space-y-5">
              {loadingDoctors
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex animate-pulse flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 sm:gap-6 sm:p-6 lg:flex-row"
                    >
                      <div className="h-48 w-full flex-shrink-0 rounded-2xl bg-slate-100 dark:bg-slate-700 sm:h-40 sm:w-40" />
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="h-5 w-2/3 rounded-full bg-slate-100 dark:bg-slate-700" />
                        <div className="h-3 w-1/3 rounded-full bg-slate-100 dark:bg-slate-700" />
                        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700" />
                        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-700">
                          <div className="h-8 w-20 rounded-full bg-slate-100 dark:bg-slate-700" />
                          <div className="h-9 w-32 rounded-full bg-slate-100 dark:bg-slate-700" />
                        </div>
                      </div>
                    </div>
                  ))
                : displayed.map((d) => (
                    <article
                      key={d.id}
                      data-doctor={d.id}
                      onMouseEnter={() => setHoveredDoctorId(d.id)}
                      onMouseLeave={() => setHoveredDoctorId(null)}
                      className={`doctor-card group flex flex-col gap-4 rounded-3xl border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#008081]/25 hover:shadow-xl dark:bg-slate-800 sm:gap-6 sm:p-6 lg:flex-row ${
                        selectedDoctorId === d.id || hoveredDoctorId === d.id
                          ? "border-[#008081]/40 ring-2 ring-[#008081]/15 dark:border-[#008081]/50"
                          : "border-slate-100 dark:border-slate-700"
                      }`}
                    >
                      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-2xl sm:h-40 sm:w-40">
                        <img
                          src={d.img}
                          alt={d.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-slate-100 bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
                          <Star size={13} className="fill-yellow-400 text-yellow-400" />
                          <span>{d.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="z-10 flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-bold text-slate-900 transition-colors group-hover:text-[#008081] dark:text-white sm:text-xl">
                                {d.name}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#008081]/10 px-2.5 py-0.5 text-xs font-bold text-[#008081] dark:bg-[#008081]/20">
                                  {d.specialty}
                                </span>
                                <p className="truncate text-xs text-slate-500">
                                  {d.hospital}
                                </p>
                              </div>
                            </div>

                            <button
                              className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                              aria-label="favorite"
                            >
                              <Heart size={18} />
                            </button>
                          </div>

                          <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                            {d.specialty} with years of experience — patient-centered
                            care, board certifications and community trust.
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
                            {d.tags?.map((tag) => (
                              <div
                                key={tag}
                                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                                  tag.includes("Accepting")
                                    ? "bg-green-50 text-[#81B641] dark:bg-green-900/20"
                                    : tag === "Verified"
                                      ? "bg-[#008081]/10 text-[#008081] dark:bg-[#008081]/20"
                                      : "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-300"
                                }`}
                              >
                                {tag.includes("Online") ? (
                                  <Video size={14} />
                                ) : tag.toLowerCase().includes("language") ? (
                                  <Globe size={14} />
                                ) : (
                                  <Stethoscope size={14} />
                                )}
                                <span className="text-[11px]">{tag}</span>
                              </div>
                            ))}

                            {d.coords ? (
                              <button
                                type="button"
                                onClick={() => focusDoctorOnMap(d.id)}
                                className="flex items-center gap-1.5 rounded-full bg-[#008081]/10 px-2.5 py-1 text-[#008081] transition-colors hover:bg-[#008081] hover:text-white dark:bg-[#008081]/20"
                                title="Show on map"
                              >
                                <MapIcon size={14} aria-hidden="true" />
                                <span className="text-[11px]">{d.locationLabel}</span>
                                <span className="sr-only">, show on map</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-500 dark:bg-slate-700/50 dark:text-slate-300">
                                <span className="text-[#008081]">
                                  <MapIcon size={14} />
                                </span>
                                <span className="text-[11px]">{d.locationLabel}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="mb-0.5 block text-xs text-slate-400">
                              Consultation Fee
                            </span>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              ₱{d.fee}{" "}
                              <span className="text-xs font-normal text-slate-400">
                                / visit
                              </span>
                            </div>
                          </div>

                          <div className="flex w-full items-center gap-3 sm:w-auto">
                            {hasMounted && (
                              <>
                                {d.status === "fully_booked" ? (
                                  <button
                                    className="w-full cursor-not-allowed rounded-full bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-400 dark:bg-slate-700 dark:text-slate-500 sm:w-auto"
                                    disabled
                                  >
                                    Fully Booked
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openAvailabilityPanel(d)}
                                    className="w-full rounded-full bg-[#008081] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#008081]/20 transition-all hover:bg-[#00736f] hover:shadow-xl sm:w-auto"
                                  >
                                    Book Consultation
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}

              {!loadingDoctors && displayed.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#008081]/10 text-[#008081] dark:bg-[#008081]/20">
                    <Stethoscope size={22} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No doctors match your search
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-slate-400">
                    Try adjusting your filters, location, or search keywords.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mb-10 mt-6 flex justify-center">
              <button
                onClick={loadMore}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#008081]/20 bg-white px-8 py-3 font-bold text-[#008081] shadow-sm transition-colors hover:bg-[#008081]/5 dark:bg-slate-800 sm:w-auto"
              >
                {isAllLoaded ? "Show Less" : "Load More Specialists"}
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </section>

        <aside
          className={`overflow-hidden bg-slate-100 dark:bg-[#0f172a] lg:relative lg:z-0 lg:block lg:h-[100dvh] lg:w-1/2 lg:animate-none ${
            mapOpen
              ? "fixed inset-x-0 bottom-0 top-20 z-[150] block animate-slide-up"
              : "hidden"
          }`}
          aria-label="Map of doctors"
        >
          <div ref={mapHostRef} className="h-full w-full" />
          <MapOverlay
            locationLabel={
              locationQuery && locationQuery !== "All areas"
                ? locationQuery
                : "All areas"
            }
            total={mapStats.total}
            accepting={mapStats.accepting}
            booked={mapStats.booked}
            locating={locating}
            onFitAll={fitToDoctors}
            onLocate={locateUser}
          />
        </aside>

        {/* Mobile: switch between list and map */}
        <button
          type="button"
          onClick={() => setMapOpen((open) => !open)}
          className="fixed bottom-6 left-1/2 z-[160] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-10px_rgba(15,23,42,0.6)] lg:hidden dark:bg-white dark:text-slate-900"
          aria-pressed={mapOpen}
        >
          {mapOpen ? (
            <>
              <ListIcon size={18} aria-hidden="true" />
              Show list
            </>
          ) : (
            <>
              <MapIcon size={18} aria-hidden="true" />
              Show map
              {mapStats.total > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs dark:bg-slate-900/10">
                  {mapStats.total}
                </span>
              )}
            </>
          )}
        </button>
      </main>

      <AiSearchModal
        open={aiModalOpen}
        loading={aiLoading}
        error={aiError}
        summary={aiSummary}
        specializations={aiSuggestedSpecializations}
        urgency={aiUrgency}
        onClose={() => setAiModalOpen(false)}
      />

      {panelOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/30"
          onClick={closePanel}
        />
      )}

      <AvailabilityPanel
        open={panelOpen}
        onClose={closePanel}
        activeDoctor={activeDoctor}
        selectedDate={selectedDate}
        selectedDayIndex={selectedDayIndex}
        setSelectedDayIndex={setSelectedDayIndex}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
      />
    </div>
  );
}