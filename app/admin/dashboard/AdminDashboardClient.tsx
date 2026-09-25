"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Bell,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Hourglass,
  Loader2,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import WeeklyTrendChart from "@/components/admin/WeeklyTrendChart";
import type {
  AdminNotification,
  DashboardStat,
  RecentPatientRow,
  SearchResults,
  SpecialtyStat,
  WeeklyTrendPoint,
} from "@/types/admin";

type LoadState = "idle" | "loading" | "success" | "error";

const RANGE_OPTIONS: { value: string; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

function formatChange(stat: DashboardStat | null) {
  if (!stat) return null;
  if (stat.trend === "stable") {
    return { label: "Stable", className: "text-slate-500 bg-slate-100" };
  }
  const sign = stat.trend === "up" ? "+" : "";
  return {
    label: `${sign}${stat.changePercent}%`,
    className:
      stat.trend === "up"
        ? "text-emerald-700 bg-emerald-50"
        : "text-rose-700 bg-rose-50",
  };
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

function StatCard({
  icon,
  label,
  stat,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  stat: DashboardStat | null;
  loading: boolean;
  accent: string;
}) {
  const change = formatChange(stat);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
        >
          {icon}
        </span>
        {change && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${change.className}`}
          >
            {change.label}
          </span>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p className="text-3xl font-bold text-slate-900">
            {stat?.total ?? 0}
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  loading,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  loading: boolean;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        {icon}
      </span>
      <div>
        {loading ? (
          <div className="h-6 w-10 animate-pulse rounded-md bg-slate-100" />
        ) : (
          <p className="text-xl font-bold text-slate-900">{value}</p>
        )}
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboardClient() {
  const [forbidden, setForbidden] = useState(false);

  // Quick stats
  const [statsState, setStatsState] = useState<LoadState>("idle");
  const [stats, setStats] = useState<{
    totalUsers: DashboardStat;
    totalPatients: DashboardStat;
    totalDoctors: DashboardStat;
    totalAppointments: DashboardStat;
  } | null>(null);

  // Appointments overview
  const [range, setRange] = useState("7d");
  const [overviewState, setOverviewState] = useState<LoadState>("idle");
  const [summary, setSummary] = useState<{
    pending: number;
    completed: number;
    today: number;
    upcoming: number;
  } | null>(null);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyTrendPoint[]>([]);
  const [reportOpen, setReportOpen] = useState(false);

  // Specialties
  const [specialtiesState, setSpecialtiesState] = useState<LoadState>("idle");
  const [specialties, setSpecialties] = useState<SpecialtyStat[]>([]);

  // Recent patients
  const [patientsState, setPatientsState] = useState<LoadState>("idle");
  const [patients, setPatients] = useState<RecentPatientRow[]>([]);
  const [patientsPage, setPatientsPage] = useState(1);
  const [patientsTotalPages, setPatientsTotalPages] = useState(1);
  const [patientsSearch, setPatientsSearch] = useState("");
  const [viewAllPatients, setViewAllPatients] = useState(false);

  // Doctor verification
  const [verificationState, setVerificationState] = useState<LoadState>("idle");
  const [verification, setVerification] = useState<{
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Header search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [addNewOpen, setAddNewOpen] = useState(false);
  const addNewRef = useRef<HTMLDivElement>(null);

  const handleUnauthorized = useCallback((res: Response) => {
    if (res.status === 403) {
      setForbidden(true);
      return true;
    }
    return false;
  }, []);

  const loadStats = useCallback(async () => {
    setStatsState("loading");
    try {
      const res = await fetch("/api/admin/dashboard/stats", { cache: "no-store" });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setStats(data.stats);
      setStatsState("success");
    } catch {
      setStatsState("error");
    }
  }, [handleUnauthorized]);

  const loadOverview = useCallback(
    async (selectedRange: string) => {
      setOverviewState("loading");
      try {
        const res = await fetch(
          `/api/admin/dashboard/appointments?range=${selectedRange}`,
          { cache: "no-store" },
        );
        if (handleUnauthorized(res)) return;
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        setSummary(data.summary);
        setWeeklyTrend(data.weeklyTrend || []);
        setOverviewState("success");
      } catch {
        setOverviewState("error");
      }
    },
    [handleUnauthorized],
  );

  const loadSpecialties = useCallback(async () => {
    setSpecialtiesState("loading");
    try {
      const res = await fetch("/api/admin/dashboard/specialties", {
        cache: "no-store",
      });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSpecialties(data.specialties || []);
      setSpecialtiesState("success");
    } catch {
      setSpecialtiesState("error");
    }
  }, [handleUnauthorized]);

  const loadPatients = useCallback(
    async (page: number, search: string) => {
      setPatientsState("loading");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search,
        });
        const res = await fetch(`/api/admin/patients/recent?${params.toString()}`, {
          cache: "no-store",
        });
        if (handleUnauthorized(res)) return;
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message);
        setPatients(data.patients || []);
        setPatientsTotalPages(data.pagination?.totalPages || 1);
        setPatientsState("success");
      } catch {
        setPatientsState("error");
      }
    },
    [handleUnauthorized],
  );

  const loadVerificationStats = useCallback(async () => {
    setVerificationState("loading");
    try {
      const res = await fetch("/api/admin/doctors/verification-stats", {
        cache: "no-store",
      });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setVerification(data.stats);
      setVerificationState("success");
    } catch {
      setVerificationState("error");
    }
  }, [handleUnauthorized]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      if (handleUnauthorized(res)) return;
      const data = await res.json();
      if (!res.ok || !data.success) return;
      setNotifications(data.notifications || []);
    } catch {
      // silent — notifications are non-critical
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadStats();
    void loadSpecialties();
    void loadVerificationStats();
    void loadNotifications();
  }, [loadStats, loadSpecialties, loadVerificationStats, loadNotifications]);

  useEffect(() => {
    void loadOverview(range);
  }, [range, loadOverview]);

  useEffect(() => {
    void loadPatients(patientsPage, patientsSearch);
  }, [patientsPage, patientsSearch, loadPatients]);

  useEffect(() => {
    const interval = window.setInterval(() => void loadNotifications(), 30000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  // Debounced header search
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`, {
          cache: "no-store",
        });
        if (handleUnauthorized(res)) return;
        const data = await res.json();
        if (res.ok && data.success) {
          setSearchResults(data.results);
        }
      } catch {
        // ignore
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, handleUnauthorized]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
      if (addNewRef.current && !addNewRef.current.contains(target)) {
        setAddNewOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  async function markNotificationRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
    );
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // optimistic; a future refresh will reconcile
    }
  }

  async function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/admin/notifications/read-all", { method: "PATCH" });
    } catch {
      // optimistic; a future refresh will reconcile
    }
  }

  function handleRefreshAll() {
    void loadStats();
    void loadOverview(range);
    void loadSpecialties();
    void loadPatients(patientsPage, patientsSearch);
    void loadVerificationStats();
  }

  if (forbidden) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <ShieldCheck size={26} />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account isn&apos;t authorized to view the admin dashboard. Ask
            an existing admin to add your email to the allowlist.
          </p>
        </div>
      </div>
    );
  }

  const maxSpecialtyPercentage = Math.max(
    1,
    ...specialties.map((s) => s.percentage),
  );

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white pb-16">
      <div className="pointer-events-none fixed left-0 top-16 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, here&apos;s what&apos;s happening today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-xs" ref={searchRef}>
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search patients, doctors, appointments..."
                className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
              />

              {searchOpen && searchQuery.trim() && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-96 max-w-[80vw] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                  <div className="max-h-96 overflow-y-auto p-2">
                    {searchLoading ? (
                      <div className="flex items-center justify-center gap-2 p-6 text-sm text-slate-400">
                        <Loader2 size={16} className="animate-spin" />
                        Searching...
                      </div>
                    ) : !searchResults ||
                      (searchResults.patients.length === 0 &&
                        searchResults.doctors.length === 0 &&
                        searchResults.appointments.length === 0 &&
                        searchResults.applications.length === 0) ? (
                      <p className="p-6 text-center text-sm text-slate-400">
                        No matches for &quot;{searchQuery}&quot;.
                      </p>
                    ) : (
                      <>
                        {searchResults.patients.length > 0 && (
                          <div className="mb-2">
                            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Patients
                            </p>
                            {searchResults.patients.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
                              >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {initials(p.name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {p.name}
                                  </p>
                                  <p className="truncate text-xs text-slate-400">
                                    {p.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {searchResults.doctors.length > 0 && (
                          <div className="mb-2">
                            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Doctors
                            </p>
                            {searchResults.doctors.map((d) => (
                              <div
                                key={d.id}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
                              >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                                  {initials(d.name)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {d.name}
                                  </p>
                                  <p className="truncate text-xs text-slate-400">
                                    {d.specialization}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    d.status === "accepted"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : d.status === "rejected"
                                        ? "bg-rose-50 text-rose-700"
                                        : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {d.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {searchResults.appointments.length > 0 && (
                          <div className="mb-2">
                            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Appointments
                            </p>
                            {searchResults.appointments.map((a) => (
                              <div
                                key={a.id}
                                className="rounded-xl px-3 py-2 hover:bg-slate-50"
                              >
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {a.patientName}{" "}
                                  <span className="font-normal text-slate-400">
                                    with
                                  </span>{" "}
                                  {a.doctorName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatDate(a.date)} · {a.status}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {searchResults.applications.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Pending Applications
                            </p>
                            {searchResults.applications.map((app) => (
                              <Link
                                key={app.id}
                                href={`/admin/applications?highlight=${app.id}`}
                                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
                              >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                                  {initials(app.name)}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {app.name}
                                  </p>
                                  <p className="truncate text-xs text-slate-400">
                                    {app.specialization}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                aria-label="Notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">
                      Notifications
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => void markAllNotificationsRead()}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <p className="p-6 text-center text-sm text-slate-400">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n._id}
                          onClick={() => {
                            if (!n.read) void markNotificationRead(n._id);
                          }}
                          className={`mb-1 flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition ${
                            n.read
                              ? "hover:bg-slate-50"
                              : "bg-primary/5 hover:bg-primary/10"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {n.title}
                          </p>
                          <p className="line-clamp-2 text-xs text-slate-500">
                            {n.message}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {formatDateTime(n.createdAt)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative" ref={addNewRef}>
            <button
              onClick={() => setAddNewOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
            >
              <Plus size={16} />
              Add New
            </button>

            {addNewOpen && (
              <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl">
                <Link
                  href="/patientsignup"
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <UserRound size={16} className="text-primary" />
                  Invite a patient
                </Link>
                <Link
                  href="/doctorsignup"
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Stethoscope size={16} className="text-primary" />
                  Invite a doctor
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/admin/applications?status=pending"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CheckCircle2 size={16} className="text-emerald-600" />
            Verify
            {verification && verification.pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                {verification.pending}
              </span>
            )}
          </Link>

          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FileText size={16} className="text-primary" />
            Review Applications
          </Link>

          <button
            onClick={handleRefreshAll}
            className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 transition hover:text-primary"
          >
            <Activity size={14} />
            Refresh data
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users size={20} className="text-primary" />}
            label="Total Users"
            stat={stats?.totalUsers ?? null}
            loading={statsState === "loading"}
            accent="bg-primary/10"
          />
          <StatCard
            icon={<UserRound size={20} className="text-secondary" />}
            label="Total Patients"
            stat={stats?.totalPatients ?? null}
            loading={statsState === "loading"}
            accent="bg-secondary/10"
          />
          <StatCard
            icon={<Stethoscope size={20} className="text-sky-600" />}
            label="Total Doctors"
            stat={stats?.totalDoctors ?? null}
            loading={statsState === "loading"}
            accent="bg-sky-50"
          />
          <StatCard
            icon={<CalendarClock size={20} className="text-violet-600" />}
            label="Total Appointments"
            stat={stats?.totalAppointments ?? null}
            loading={statsState === "loading"}
            accent="bg-violet-50"
          />
        </div>

        {statsState === "error" && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle size={16} />
            Couldn&apos;t load quick stats.
            <button onClick={loadStats} className="ml-auto font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* Appointments overview */}
        <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Appointments Overview
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Booking activity across the selected period.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 outline-none focus:border-primary"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FileText size={14} />
                View Report
              </button>
            </div>
          </div>

          {overviewState === "error" ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} />
              Couldn&apos;t load appointments overview.
              <button
                onClick={() => loadOverview(range)}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={<Hourglass size={18} className="text-amber-600" />}
                  label="Pending"
                  value={summary?.pending ?? 0}
                  loading={overviewState === "loading"}
                  accent="bg-amber-100"
                />
                <SummaryCard
                  icon={<CheckCircle2 size={18} className="text-emerald-600" />}
                  label="Completed"
                  value={summary?.completed ?? 0}
                  loading={overviewState === "loading"}
                  accent="bg-emerald-100"
                />
                <SummaryCard
                  icon={<Calendar size={18} className="text-primary" />}
                  label="Today's"
                  value={summary?.today ?? 0}
                  loading={overviewState === "loading"}
                  accent="bg-primary/10"
                />
                <SummaryCard
                  icon={<Clock size={18} className="text-secondary" />}
                  label="Upcoming"
                  value={summary?.upcoming ?? 0}
                  loading={overviewState === "loading"}
                  accent="bg-secondary/10"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="mb-2 text-sm font-bold text-slate-800">
                    Weekly Trend
                  </p>
                  {overviewState === "loading" ? (
                    <div className="flex h-56 items-center justify-center">
                      <Loader2 size={20} className="animate-spin text-primary" />
                    </div>
                  ) : (
                    <WeeklyTrendChart data={weeklyTrend} />
                  )}
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Sparkles size={15} className="text-primary" />
                    Top Specialties
                  </p>

                  {specialtiesState === "loading" ? (
                    <div className="space-y-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      ))}
                    </div>
                  ) : specialtiesState === "error" ? (
                    <p className="text-sm text-rose-600">
                      Couldn&apos;t load specialties.
                    </p>
                  ) : specialties.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No appointment data yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {specialties.map((item) => (
                        <div key={item.specialty}>
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span className="truncate">{item.specialty}</span>
                            <span className="shrink-0 text-slate-400">
                              {item.percentage}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${(item.percentage / maxSpecialtyPercentage) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent patients + doctor management */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Patients
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Latest booked appointments across all doctors.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={patientsSearch}
                    onChange={(e) => {
                      setPatientsSearch(e.target.value);
                      setPatientsPage(1);
                    }}
                    placeholder="Search table..."
                    className="w-40 rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs outline-none focus:border-primary sm:w-48"
                  />
                </div>

                <button
                  onClick={() => setViewAllPatients((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  {viewAllPatients ? "Collapse" : "View All"}
                  <ChevronRight
                    size={14}
                    className={`transition-transform ${viewAllPatients ? "rotate-90" : ""}`}
                  />
                </button>
              </div>
            </div>

            {patientsState === "error" ? (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} />
                Couldn&apos;t load recent patients.
                <button
                  onClick={() => loadPatients(patientsPage, patientsSearch)}
                  className="ml-auto font-semibold underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
                      <th className="pb-3 pr-4">Patient</th>
                      <th className="pb-3 pr-4">Patient ID</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Doctor</th>
                      <th className="pb-3">Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsState === "loading" ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-50">
                          <td className="py-3 pr-4" colSpan={5}>
                            <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
                          </td>
                        </tr>
                      ))
                    ) : patients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No patient records found.
                        </td>
                      </tr>
                    ) : (
                      (viewAllPatients ? patients : patients.slice(0, 5)).map(
                        (row) => (
                          <tr
                            key={row.appointmentId}
                            className="border-b border-slate-50 hover:bg-slate-50/60"
                          >
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                {row.patientAvatar ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={row.patientAvatar}
                                    alt={row.patientName}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                    {initials(row.patientName)}
                                  </span>
                                )}
                                <span className="font-semibold text-slate-800">
                                  {row.patientName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                              {row.patientId.slice(-8).toUpperCase()}
                            </td>
                            <td className="py-3 pr-4 text-slate-600">
                              {formatDate(row.date)}
                            </td>
                            <td className="py-3 pr-4 text-slate-600">
                              {row.doctorName}
                            </td>
                            <td className="py-3 text-slate-600">
                              {row.condition || "—"}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>

                {viewAllPatients && patientsTotalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <button
                      disabled={patientsPage <= 1}
                      onClick={() => setPatientsPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-400">
                      Page {patientsPage} of {patientsTotalPages}
                    </span>
                    <button
                      disabled={patientsPage >= patientsTotalPages}
                      onClick={() =>
                        setPatientsPage((p) => Math.min(patientsTotalPages, p + 1))
                      }
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Doctor Management
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Application review status.
            </p>

            {verificationState === "error" ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <AlertCircle size={16} />
                Failed to load.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <Hourglass size={16} />
                    Pending
                  </span>
                  {verificationState === "loading" ? (
                    <div className="h-5 w-6 animate-pulse rounded bg-amber-200" />
                  ) : (
                    <span className="text-lg font-bold text-amber-700">
                      {verification?.pending ?? 0}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 size={16} />
                    Accepted
                  </span>
                  {verificationState === "loading" ? (
                    <div className="h-5 w-6 animate-pulse rounded bg-emerald-200" />
                  ) : (
                    <span className="text-lg font-bold text-emerald-700">
                      {verification?.accepted ?? 0}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-rose-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <XCircle size={16} />
                    Rejected
                  </span>
                  {verificationState === "loading" ? (
                    <div className="h-5 w-6 animate-pulse rounded bg-rose-200" />
                  ) : (
                    <span className="text-lg font-bold text-rose-700">
                      {verification?.rejected ?? 0}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Link
              href="/admin/applications"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
            >
              Review Applications
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Appointments Report — {RANGE_OPTIONS.find((o) => o.value === range)?.label}
              </h3>
              <button
                onClick={() => setReportOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-400">Pending</p>
                <p className="text-lg font-bold text-slate-800">{summary?.pending ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-400">Completed</p>
                <p className="text-lg font-bold text-slate-800">{summary?.completed ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-400">Today&apos;s</p>
                <p className="text-lg font-bold text-slate-800">{summary?.today ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-slate-400">Upcoming</p>
                <p className="text-lg font-bold text-slate-800">{summary?.upcoming ?? 0}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-slate-700">
                Weekly breakdown
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-slate-400">
                    <th className="pb-1 text-left">Day</th>
                    <th className="pb-1 text-right">Consultations</th>
                    <th className="pb-1 text-right">Follow-ups</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyTrend.map((row) => (
                    <tr key={row.day} className="border-t border-slate-100">
                      <td className="py-1.5">{row.day}</td>
                      <td className="py-1.5 text-right">{row.consultations}</td>
                      <td className="py-1.5 text-right">{row.followUps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-bold text-slate-700">
                Top specialties
              </p>
              <ul className="space-y-1 text-sm text-slate-600">
                {specialties.map((s) => (
                  <li key={s.specialty} className="flex justify-between">
                    <span>{s.specialty}</span>
                    <span className="font-semibold">{s.percentage}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Printer size={16} />
              Print report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
