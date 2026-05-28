"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
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
  X,
} from "lucide-react";

import SearchBar from "@/components/patient/SearchBar";
import FilterModal from "@/components/patient/FilterModal";
import { DoctorApiItem, FindDoctor } from "@/types/doctor";

declare global {
  interface Window {
    __doctorMap?: LeafletMap;
  }
}

function MapControls({
  center,
  onSearchArea,
}: {
  center: LatLngExpression;
  onSearchArea: () => void;
}) {
  return (
    <div className="absolute right-6 top-6 z-20 flex flex-col gap-2">
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

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
];

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
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);

  const [panelOpen, setPanelOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<FindDoctor | null>(null);
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const [doctors, setDoctors] = useState<FindDoctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

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
            ...(doctor.consultationModes.includes("video")
              ? ["Online Available"]
              : []),
            ...(doctor.languages || []),
          ];

          return {
            id: doctor.id,
            name: doctor.fullName,
            specialty: doctor.specialization,
            hospital: doctor.clinicAddress || "Clinic",
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

  const selectedDate = useMemo(() => {
    const days: {
      key: string;
      day: string;
      date: number;
      active: boolean;
      muted: boolean;
    }[] = [];

    const now = new Date();

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const day = d
        .toLocaleDateString("en-US", { weekday: "short" })
        .toUpperCase();

      days.push({
        key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
        day,
        date: d.getDate(),
        active: i === selectedDayIndex,
        muted: day === "SAT" || day === "SUN",
      });
    }

    return days;
  }, [selectedDayIndex]);

  const filteredAll = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    const spec = specialtyFilter.trim().toLowerCase();

    return doctors
      .filter((d) => {
        const matchesQuery =
          !q ||
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q) ||
          d.locationLabel.toLowerCase().includes(q);

        const matchesLocation =
          !loc ||
          loc === "all areas" ||
          d.locationLabel.toLowerCase().includes(loc) ||
          d.hospital.toLowerCase().includes(loc);

        const matchesSpecialty =
          !spec ||
          spec === "all specialties" ||
          d.specialty.toLowerCase().includes(spec);

        const matchesRating = d.rating >= minRating;
        const matchesPrice = d.fee >= minPrice && d.fee <= maxPrice;

        return (
          matchesQuery &&
          matchesLocation &&
          matchesSpecialty &&
          matchesRating &&
          matchesPrice
        );
      })
      .sort((a, b) => {
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
    minRating,
    minPrice,
    maxPrice,
  ]);

  const PAGE_SIZE = 2;
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / PAGE_SIZE));

  const displayed = useMemo(() => {
    const end = Math.min(page * PAGE_SIZE, filteredAll.length);
    return filteredAll.slice(0, end);
  }, [filteredAll, page]);

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

      const bounds = L.latLngBounds(
        doctorsWithCoords.map((doctor) => doctor.coords as [number, number]),
      );

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.45));
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

  function openAvailabilityPanel(doctor: FindDoctor) {
    if (doctor.status === "fully_booked") return;

    setActiveDoctor(doctor);
    setSelectedTime("11:00 AM");
    setSelectedDayIndex(0);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
  }

  function loadMore() {
    if (page < totalPages) setPage((p) => p + 1);
    else setPage(1);
  }

  const isAllLoaded = page >= totalPages;

  return (
    <div className="flex min-h-screen flex-col text-slate-900 dark:bg-[#0f172a] dark:text-slate-100">
      <main className="isolate relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
        <section className="relative z-30 h-screen w-full min-w-0 overflow-y-auto p-4 no-scrollbar sm:p-6 lg:w-1/2 lg:flex-none lg:p-8 dark:bg-[#0f172a]">
          <div className="relative z-[120] mx-auto mt-20 max-w-4xl">
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
            />

            <FilterModal
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              specialty={specialtyFilter}
              setSpecialty={setSpecialtyFilter}
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

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loadingDoctors
                    ? "Loading doctors..."
                    : `${filteredAll.length} Doctors in ${locationQuery === "All areas" ? "All Areas" : locationQuery}`}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Found near Poblacion District &amp; Matina
                </p>
                {doctorError ? (
                  <p className="mt-1 text-sm text-red-500">{doctorError}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                <span>Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 pr-6 text-sm font-semibold text-slate-700 focus:ring-0 dark:text-slate-300"
                >
                  <option>Recommended</option>
                  <option>Highest Rated</option>
                  <option>Consultation Fee</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {displayed.map((d) => (
                <article
                  key={d.id}
                  data-doctor={d.id}
                  className="doctor-card group flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:flex-row"
                >
                  <div className="relative h-36 w-full flex-shrink-0 sm:w-36">
                    <img
                      src={d.img}
                      alt={d.name}
                      className="h-full w-full rounded-xl object-cover shadow-md"
                    />
                    <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md border border-slate-100 bg-white/95 px-2 py-0.5 text-xs font-bold shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95">
                      <Star size={14} className="text-yellow-400" />
                      <span>{d.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="z-10 flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-[#008081] dark:text-white">
                            {d.name}
                          </h3>
                          <div className="mt-0.5 flex items-center gap-2">
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
                        {d.specialty} with years of experience —
                        patient-centered care, board certifications and
                        community trust.
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
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

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-700">
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

                      <div className="flex items-center gap-3">
                        {hasMounted && (
                          <>
                            {d.status === "fully_booked" ? (
                              <button
                                className="cursor-not-allowed rounded-full bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-400"
                                disabled
                              >
                                Fully Booked
                              </button>
                            ) : (
                              <button
                                onClick={() => openAvailabilityPanel(d)}
                                className="rounded-full bg-[#008081] px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#00736f] hover:shadow-xl"
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
                className="flex items-center gap-2 rounded-full border border-[#008081]/20 px-8 py-3 font-bold text-[#008081] transition-colors hover:bg-[#008081]/5"
              >
                {isAllLoaded ? "Show Less" : "Load More Specialists"}
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </section>

        <aside className="relative z-0 hidden h-screen w-1/2 overflow-hidden bg-slate-100 dark:bg-[#0f172a] lg:block">
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

      {panelOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/30"
          onClick={closePanel}
        />
      )}

      <aside
        className={[
          "fixed right-0 top-0 z-[210] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
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
              {selectedDate.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedDayIndex(index)}
                  className={[
                    "flex min-w-[60px] flex-col items-center rounded-lg p-3 transition-colors",
                    item.active
                      ? "bg-[#0f766e] text-white"
                      : item.muted
                        ? "bg-[#f3f3f4] text-[#bcc9c6]"
                        : "bg-[#f3f3f4] text-[#1a1c1c] hover:bg-[#e8e8e8]",
                  ].join(" ")}
                >
                  <span className="text-xs uppercase">{item.day}</span>
                  <span className="text-lg font-bold">{item.date}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#0f766e]">
              Available Slots
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((time) => {
                const selected = time === selectedTime;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={[
                      "rounded-lg border px-4 py-3 text-center text-sm font-medium transition",
                      selected
                        ? "border-[#0f766e] bg-[#0f766e]/5 text-[#0f766e]"
                        : "border-[#bcc9c6]/40 text-[#1a1c1c] hover:border-[#0f766e] hover:text-[#0f766e]",
                    ].join(" ")}
                  >
                    {time}
                  </button>
                );
              })}

              <button
                type="button"
                className="rounded-lg border border-[#bcc9c6]/30 bg-[#e8e8e8] px-4 py-3 text-center text-sm font-medium text-[#6d7a77] opacity-50"
                disabled
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
            Confirm {selectedTime}
          </button>
          <p className="mt-4 text-center text-xs text-[#5a6664]">
            A confirmation will be sent to your registered email.
          </p>
        </div>
      </aside>
    </div>
  );
}
