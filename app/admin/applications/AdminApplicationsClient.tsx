"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock3,
  FileText,
  Globe,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  X,
  XCircle,
} from "lucide-react";
import type { DoctorApplication } from "@/types/admin";

type LoadState = "idle" | "loading" | "success" | "error";
type StatusFilter = "all" | "pending" | "accepted" | "rejected";

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

function StatusPill({ status }: { status: DoctorApplication["status"] }) {
  const styles = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  } as const;

  const labels = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function AdminApplicationsClient() {
  const searchParams = useSearchParams();
  const initialStatus = (searchParams.get("status") as StatusFilter) || "all";
  const highlightId = searchParams.get("highlight") || "";

  const [forbidden, setForbidden] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    ["all", "pending", "accepted", "rejected"].includes(initialStatus)
      ? initialStatus
      : "all",
  );
  const [listState, setListState] = useState<LoadState>("idle");
  const [applications, setApplications] = useState<DoctorApplication[]>([]);

  const [selectedId, setSelectedId] = useState<string | null>(highlightId || null);
  const [detailState, setDetailState] = useState<LoadState>("idle");
  const [detail, setDetail] = useState<DoctorApplication | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const loadApplications = useCallback(async (filter: StatusFilter) => {
    setListState("loading");
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/applications${params}`, {
        cache: "no-store",
      });
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setApplications(data.applications || []);
      setListState("success");
    } catch {
      setListState("error");
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailState("loading");
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        cache: "no-store",
      });
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setDetail(data.application);
      setDetailState("success");
    } catch {
      setDetailState("error");
    }
  }, []);

  useEffect(() => {
    void loadApplications(statusFilter);
  }, [statusFilter, loadApplications]);

  useEffect(() => {
    if (selectedId) void loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      accepted: applications.filter((a) => a.status === "accepted").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };
  }, [applications]);

  async function handleApprove() {
    if (!detail) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/applications/${detail.id}/approve`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to approve");

      setDetail((prev) => (prev ? { ...prev, status: "accepted" } : prev));
      setApplications((prev) =>
        prev.map((a) => (a.id === detail.id ? { ...a, status: "accepted" } : a)),
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!detail || !rejectReason.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/applications/${detail.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to reject");

      setDetail((prev) =>
        prev
          ? { ...prev, status: "rejected", rejectionReason: rejectReason.trim() }
          : prev,
      );
      setApplications((prev) =>
        prev.map((a) =>
          a.id === detail.id
            ? { ...a, status: "rejected", rejectionReason: rejectReason.trim() }
            : a,
        ),
      );
      setRejectOpen(false);
      setRejectReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(false);
    }
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
            Your account isn&apos;t authorized to review applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-white pb-16">
      <div className="pointer-events-none fixed left-0 top-16 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Doctor Applications
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Review, approve, or reject doctor sign-up applications.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "accepted", label: "Accepted" },
              { key: "rejected", label: "Rejected" },
            ] as { key: StatusFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                statusFilter === tab.key
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && counts[tab.key] > 0 && (
                <span className="ml-1.5 text-xs text-slate-400">
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {listState === "loading" ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : listState === "error" ? (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={16} />
              Couldn&apos;t load applications.
              <button
                onClick={() => loadApplications(statusFilter)}
                className="ml-auto font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No {statusFilter !== "all" ? statusFilter : ""} applications found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedId(app.id)}
                  className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
                    app.id === highlightId
                      ? "border-primary/40 ring-2 ring-primary/20"
                      : "border-slate-100"
                  }`}
                >
                  {app.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.avatar}
                      alt={app.fullName}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                      {initials(app.fullName)}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-slate-900">
                        {app.fullName}
                      </p>
                      <StatusPill status={app.status} />
                    </div>
                    <p className="truncate text-sm text-slate-500">
                      {app.specialization} · Submitted {formatDate(app.submittedAt)}
                    </p>
                  </div>

                  <ArrowLeft size={16} className="shrink-0 rotate-180 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => {
            setSelectedId(null);
            setRejectOpen(false);
            setRejectReason("");
          }}
        >
          <div
            className="max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailState === "loading" ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 size={22} className="animate-spin text-primary" />
              </div>
            ) : detailState === "error" || !detail ? (
              <div className="p-8 text-center">
                <p className="text-sm text-rose-600">
                  Couldn&apos;t load this application.
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
                    {detail.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detail.avatar}
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
                      <p className="text-sm text-primary">{detail.specialization}</p>
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
                  <div className="flex items-center justify-between">
                    <StatusPill status={detail.status} />
                    <span className="text-xs text-slate-400">
                      Submitted {formatDate(detail.submittedAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <Mail size={14} className="text-slate-400" />
                      {detail.email}
                    </div>
                    {detail.phone && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Phone size={14} className="text-slate-400" />
                        {detail.phone}
                      </div>
                    )}
                    {detail.licenseNumber && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <ShieldCheck size={14} className="text-slate-400" />
                        License: {detail.licenseNumber}
                      </div>
                    )}
                    {!!detail.experienceYears && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <GraduationCap size={14} className="text-slate-400" />
                        {detail.experienceYears} yrs experience
                      </div>
                    )}
                    {detail.clinicAddress && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:col-span-2">
                        <MapPin size={14} className="text-slate-400" />
                        {detail.clinicAddress}
                      </div>
                    )}
                    {!!detail.consultationFee && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Briefcase size={14} className="text-slate-400" />
                        ₱{detail.consultationFee} / visit
                      </div>
                    )}
                    {!!detail.languages?.length && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <Globe size={14} className="text-slate-400" />
                        {detail.languages.join(", ")}
                      </div>
                    )}
                  </div>

                  {detail.bio && (
                    <div>
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <Stethoscope size={13} />
                        Bio
                      </p>
                      <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                        {detail.bio}
                      </p>
                    </div>
                  )}

                  {detail.status === "rejected" && detail.rejectionReason && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-600">
                        <Clock3 size={13} />
                        Rejection reason
                      </p>
                      <p className="text-sm text-rose-700">
                        {detail.rejectionReason}
                      </p>
                    </div>
                  )}

                  {actionError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {actionError}
                    </div>
                  )}

                  {detail.status === "pending" && (
                    <>
                      {rejectOpen ? (
                        <div className="rounded-2xl border border-slate-200 p-4">
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Reason for rejection
                          </label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Explain why this application is being rejected..."
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
                          />
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => {
                                setRejectOpen(false);
                                setRejectReason("");
                              }}
                              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleReject}
                              disabled={actionLoading || !rejectReason.trim()}
                              className="flex-1 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoading ? "Rejecting..." : "Confirm reject"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setRejectOpen(true)}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                          <button
                            onClick={handleApprove}
                            disabled={actionLoading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"
                          >
                            {actionLoading ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                            Approve
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
