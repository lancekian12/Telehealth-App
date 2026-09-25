"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Cake,
  FileText,
  Loader2,
  Mail,
  Phone,
  Ruler,
  Search,
  Stethoscope,
  Users,
  Weight,
  X,
} from "lucide-react";
import type {
  PatientAppointmentRow,
  PatientDetail,
  PatientListRow,
} from "@/types/admin";

type LoadState = "idle" | "loading" | "success" | "error";

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function statusColor(status: string) {
  switch (status) {
    case "accepted":
      return "bg-primary/10 text-primary";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "completed":
      return "bg-emerald-50 text-emerald-700";
    case "rejected":
      return "bg-rose-50 text-rose-700";
    case "cancelled":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function AdminPatientsClient() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [listState, setListState] = useState<LoadState>("idle");
  const [patients, setPatients] = useState<PatientListRow[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointmentRow[]>([]);

  const loadPatients = useCallback(async (pageNum: number, searchTerm: string) => {
    setListState("loading");
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "10",
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/patients?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setPatients(data.patients || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setListState("success");
    } catch {
      setListState("error");
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailState("loading");
    try {
      const res = await fetch(`/api/admin/patients/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setDetail(data.patient);
      setAppointments(data.appointments || []);
      setDetailState("success");
    } catch {
      setDetailState("error");
    }
  }, []);

  useEffect(() => {
    void loadPatients(page, search);
  }, [page, search, loadPatients]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white pb-16">
      <div className="pointer-events-none fixed left-0 top-16 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Users size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Patient Records
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Every registered patient and their appointment history.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search patients..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          {listState === "error" ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} />
              Couldn&apos;t load patients.
              <button
                onClick={() => loadPatients(page, search)}
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
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Appointments</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {listState === "loading" ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-3" colSpan={5}>
                          <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className="cursor-pointer border-b border-slate-50 hover:bg-slate-50/60"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            {p.profilePicture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.profilePicture}
                                alt={p.fullName}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {initials(p.fullName)}
                              </span>
                            )}
                            <span className="font-semibold text-slate-800">
                              {p.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{p.email}</td>
                        <td className="py-3 pr-4 text-slate-600">{p.phone}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {p.appointmentCount}
                        </td>
                        <td className="py-3 text-slate-600">
                          {formatDate(p.joinedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setSelectedId(null)}
        >
          <div
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailState === "loading" ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 size={22} className="animate-spin text-primary" />
              </div>
            ) : detailState === "error" || !detail ? (
              <div className="p-8 text-center">
                <p className="text-sm text-rose-600">
                  Couldn&apos;t load this patient.
                </p>
                <button
                  onClick={() => loadDetail(selectedId)}
                  className="mt-3 text-sm font-semibold text-primary underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    {detail.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detail.profilePicture}
                        alt={detail.fullName}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                        {initials(detail.fullName)}
                      </span>
                    )}
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        {detail.fullName}
                      </p>
                      <p className="text-sm text-slate-500">
                        Patient since {formatDate(detail.joinedAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedId(null)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5 p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <Mail size={14} className="text-slate-400" />
                      {detail.email}
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      {detail.phone}
                    </div>
                    {detail.birthday && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Cake size={14} className="text-slate-400" />
                        {formatDate(detail.birthday)}
                      </div>
                    )}
                    {detail.height && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Ruler size={14} className="text-slate-400" />
                        {detail.height}
                      </div>
                    )}
                    {detail.weight && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Weight size={14} className="text-slate-400" />
                        {detail.weight}
                      </div>
                    )}
                  </div>

                  {detail.basicMedicalHistory && (
                    <div>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Medical history
                      </p>
                      <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                        {detail.basicMedicalHistory}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      <FileText size={15} className="text-primary" />
                      Appointment history ({appointments.length})
                    </p>

                    {appointments.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
                        No appointments yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {appointments.map((a) => (
                          <div
                            key={a.id}
                            className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Stethoscope size={15} />
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {a.doctorName}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {a.doctorSpecialization || a.condition || "—"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:justify-end">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar size={12} />
                                {formatDate(a.date)}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusColor(a.status)}`}
                              >
                                {a.status}
                              </span>
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
        </div>
      )}
    </div>
  );
}
