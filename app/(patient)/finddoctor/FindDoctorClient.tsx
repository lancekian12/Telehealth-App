"use client";

import React, {
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { DivIcon, LatLngExpression, Map as LeafletMap } from "leaflet";
import {
  Star,
  Heart,
  Plus,
  Minus,
  Navigation2,
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

function MapControls({
  center,
  onSearchArea,
}: {
  center: LatLngExpression;
  onSearchArea: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 sm:right-6 sm:top-6">
      <button
        onClick={() => window.__doctorMap?.zoomIn()}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 shadow-lg transition-colors hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="zoom in"
      >
        <Plus size={18} />
      </button>

      <button
        onClick={() => window.__doctorMap?.zoomOut()}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 shadow-lg transition-colors hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="zoom out"
      >
        <Minus size={18} />
      </button>

      <button
        onClick={() => {
          const map = window.__doctorMap;
          if (map) {
            map.panTo(center);
            map.setZoom(14);
          }
        }}
        className="mt-2 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-600 shadow-lg transition-colors hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="locate center"
      >
        <Navigation2 size={18} />
      </button>

      <button
        onClick={onSearchArea}
        className="mt-2 w-max rounded-2xl border border-slate-100 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-800/90"
      >
        <div className="flex items-center gap-3 text-sm font-medium">
          <MapIcon size={18} className="text-[#008081]" />
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Searching in
            </p>
            <p className="font-bold text-slate-900 dark:text-white">
              Davao City, PH
            </p>
          </div>
        </div>
      </button>
    </div>
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

  const center = useMemo<LatLngExpression>(() => [7.1907, 125.4553], []);
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

  async function createDoctorIcon(img: string): Promise<DivIcon> {
    const L = await import("leaflet");

    return L.divIcon({
      className: "custom-doctor-icon",
      html: `
        <div class="h-12 w-12 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
          <img src="${img}" alt="Doctor" class="h-full w-full object-cover" />
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });
  }

  useEffect(() => {
    if (!hasMounted) return;
    if (!mapHostRef.current) return;
    if (mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");
      if (cancelled || !mapHostRef.current || mapRef.current) return;

      const map = L.map(mapHostRef.current, {
        zoomControl: false,
      });

      mapRef.current = map;
      window.__doctorMap = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      map.setView(philippinesCenter, 5);

      const handleResize = () => map.invalidateSize();
      window.addEventListener("resize", handleResize);

      const timeout = window.setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {
          // ignore
        }
      }, 200);

      const cleanup = () => {
        window.clearTimeout(timeout);
        window.removeEventListener("resize", handleResize);
        map.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
        if (window.__doctorMap === map) delete window.__doctorMap;
      };

      map.on("unload", cleanup);
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
      if (window.__doctorMap) delete window.__doctorMap;
    };
  }, [hasMounted, philippinesCenter]);

  useEffect(() => {
    const syncMarkers = async () => {
      const map = mapRef.current;
      const markerLayer = markerLayerRef.current;

      if (!map || !markerLayer) return;

      const L = await import("leaflet");
      markerLayer.clearLayers();

      const doctorsWithCoords = doctors.filter(
        (doctor) => Array.isArray(doctor.coords) && doctor.coords.length === 2,
      );

      if (doctorsWithCoords.length === 0) {
        return;
      }

      for (const doctor of doctorsWithCoords) {
        const icon = await createDoctorIcon(doctor.img);

        const marker = L.marker(doctor.coords as LatLngExpression, {
          icon,
        }).bindPopup(`
          <div class="w-64 rounded-lg">
            <div class="flex items-start gap-3">
              <img src="${doctor.img}" alt="${doctor.name}" class="h-16 w-16 rounded-md object-cover" />
              <div class="flex-1">
                <h4 class="font-bold">${doctor.name}</h4>
                <div class="text-xs font-bold uppercase text-[#008081]">${doctor.specialty}</div>
                <div class="text-xs text-slate-500">${doctor.hospital}</div>
                <div class="mt-2 flex items-center gap-2 text-sm">
                  <span class="font-bold">${doctor.rating.toFixed(1)}</span>
                  <span class="text-xs text-slate-400">(${doctor.reviews ?? 0} reviews)</span>
                </div>
              </div>
            </div>
            <div class="mt-3 text-right">
              <div class="text-lg font-bold">₱${doctor.fee}</div>
            </div>
          </div>
        `);

        marker.addTo(markerLayer);
      }
    };

    void syncMarkers();
  }, [doctors]);

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
        <section className="relative z-30 w-full min-w-0 overflow-y-auto px-4 py-4 pb-24 no-scrollbar sm:px-6 sm:py-6 lg:h-[100dvh] lg:w-1/2 lg:flex-none lg:p-8 dark:bg-[#0f172a]">
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

            <div className="mb-5 flex flex-col gap-3 lg:mb-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                  {loadingDoctors
                    ? "Loading doctors..."
                    : `${visibleDoctors.length} Doctors in ${
                        locationQuery === "All areas"
                          ? "All Areas"
                          : locationQuery
                      }`}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Found near Poblacion District &amp; Matina
                </p>

                {aiLoading ? (
                  <p className="mt-1 text-sm text-[#008081]">
                    Getting AI doctor suggestions...
                  </p>
                ) : aiSuggestedSpecializations.length > 0 ? (
                  <p className="mt-1 text-sm text-[#008081]">
                    Suggested: {aiSuggestedSpecializations.join(", ")}
                  </p>
                ) : aiError ? (
                  <p className="mt-1 text-sm text-amber-600">{aiError}</p>
                ) : null}

                {doctorError ? (
                  <p className="mt-1 text-sm text-red-500">{doctorError}</p>
                ) : null}
              </div>

              <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 lg:w-auto">
                <span className="shrink-0">Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="min-w-0 cursor-pointer border-none bg-transparent p-0 pr-6 text-sm font-semibold text-slate-700 focus:ring-0 dark:text-slate-300"
                >
                  <option>Recommended</option>
                  <option>Highest Rated</option>
                  <option>Consultation Fee</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {displayed.map((d) => (
                <article
                  key={d.id}
                  data-doctor={d.id}
                  className="doctor-card group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:gap-6 sm:p-6 lg:flex-row"
                >
                  <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-xl sm:h-40 sm:w-40">
                    <img
                      src={d.img}
                      alt={d.name}
                      className="h-full w-full object-cover shadow-md"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-slate-100 bg-white/95 px-2 py-0.5 text-xs font-bold shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
                      <Star size={14} className="text-yellow-400" />
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
                          <div className="mt-0.5 flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-[#008081]">
                              {d.specialty}
                            </p>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <p className="text-xs text-slate-500">
                              {d.hospital}
                            </p>
                          </div>
                        </div>

                        <button
                          className="p-1 text-slate-300 transition-colors hover:text-red-500"
                          aria-label="favorite"
                        >
                          <Heart size={18} />
                        </button>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                        {d.specialty} with years of experience — patient-centered
                        care, board certifications and community trust.
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500">
                        {d.tags?.map((tag) => (
                          <div
                            key={tag}
                            className={`flex items-center gap-1.5 rounded px-2 py-1 ${
                              tag.includes("Accepting")
                                ? "bg-green-50 text-[#81B641] dark:bg-green-900/20"
                                : "bg-slate-100 dark:bg-slate-700/50"
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

                        <div className="flex items-center gap-1.5 rounded bg-slate-100 px-2 py-1 dark:bg-slate-700/50">
                          <span className="text-[#008081]">
                            <MapIcon size={14} />
                          </span>
                          <span className="text-[11px]">{d.locationLabel}</span>
                        </div>
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
                                className="w-full cursor-not-allowed rounded-full bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-400 sm:w-auto"
                                disabled
                              >
                                Fully Booked
                              </button>
                            ) : (
                              <button
                                onClick={() => openAvailabilityPanel(d)}
                                className="w-full rounded-full bg-[#008081] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#00736f] hover:shadow-xl sm:w-auto"
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
            </div>

            <div className="mb-10 mt-6 flex justify-center">
              <button
                onClick={loadMore}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#008081]/20 px-8 py-3 font-bold text-[#008081] transition-colors hover:bg-[#008081]/5 sm:w-auto"
              >
                {isAllLoaded ? "Show Less" : "Load More Specialists"}
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </section>

        <aside className="relative z-0 hidden h-[100dvh] w-1/2 overflow-hidden bg-slate-100 dark:bg-[#0f172a] lg:block">
          <div ref={mapHostRef} className="h-full w-full" />
          <MapControls
            center={center}
            onSearchArea={() => {
              const el = document.querySelector("section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </aside>
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