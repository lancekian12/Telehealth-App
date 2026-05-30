"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventInput, EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import WorkingHoursModal from "@/components/doctor/working-hours-modal";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  Calendar as CalendarIcon,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  AppointmentEventProps,
  AppointmentRecord,
  AppointmentType,
  DoctorResponse,
  UnavailableSlot,
  WorkingHour,
} from "@/types/doctor";
import CreateSchedule from "@/components/doctor/create-schedule";
import WorkingHoursCard from "@/components/doctor/working-hours-card";
import BlockedSlotsCard from "@/components/doctor/blocked-slots-card";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatMonthYear(date = new Date()) {
  return date.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatLastUpdated(date: Date | null) {
  if (!date) return "Not refreshed yet";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type WorkingHourRange = {
  date: string;
  startTime: string;
  endTime: string;
};

function formatTime12(time: string) {
  const [hourStr, minuteStr = "00"] = time.slice(0, 5).split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;

  return `${normalizedHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function groupWorkingHourRanges(slots: WorkingHour[]): WorkingHourRange[] {
  const sorted = [...slots].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  const ranges: WorkingHourRange[] = [];

  for (const slot of sorted) {
    const last = ranges[ranges.length - 1];

    if (!last || last.date !== slot.date || last.endTime !== slot.startTime) {
      ranges.push({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    } else {
      last.endTime = slot.endTime;
    }
  }

  return ranges;
}

function isFullWorkingDay(startTime: string, endTime: string) {
  return startTime === "08:00" && endTime === "17:00";
}

function isFullBlockedDay(slot: UnavailableSlot) {
  return (
    slot.allDay === true ||
    (!slot.startTime && !slot.endTime) ||
    (slot.startTime === "00:00" && slot.endTime === "23:59")
  );
}

function addDaysToDateString(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);

  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function normalizeAppointments(input: unknown): AppointmentRecord[] {
  const source = Array.isArray(input) ? input : [];

  return source
    .map((item): AppointmentRecord | null => {
      if (!isRecord(item)) return null;

      const id = asString(item.id || item._id || crypto.randomUUID());
      const patientName =
        asString(item.patientName) ||
        asString(item.patient?.name) ||
        asString(item.name) ||
        asString(item.fullName) ||
        "Unknown Patient";

      const date =
        asString(item.date) ||
        asString(item.appointmentDate) ||
        asString(item.bookedDate);

      const time =
        asString(item.time) ||
        asString(item.startTime) ||
        asString(item.slotTime);

      const typeRaw = asString(item.type || item.mode || item.kind, "online");
      const type: AppointmentType = typeRaw === "clinic" ? "clinic" : "online";

      const reason =
        asString(item.reason) ||
        asString(item.note) ||
        asString(item.description) ||
        "";

      const statusRaw = asString(item.status, "confirmed");
      const status =
        statusRaw === "pending" ||
        statusRaw === "confirmed" ||
        statusRaw === "completed" ||
        statusRaw === "cancelled"
          ? statusRaw
          : "confirmed";

      const patientAvatar =
        asString(item.patientAvatar) ||
        asString(item.avatar) ||
        asString(item.photo) ||
        "";

      if (!date || !time) return null;

      return {
        id,
        patientName,
        patientAvatar: patientAvatar || undefined,
        date,
        time,
        type,
        reason: reason || undefined,
        status,
      };
    })
    .filter((x): x is AppointmentRecord => x !== null);
}

export default function DoctorAppointmentClient() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  const [selectedDate, setSelectedDate] = useState(() =>
    getLocalDateString(new Date()),
  );
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>(
    [],
  );
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [consultationDurationMinutes, setConsultationDurationMinutes] =
    useState(60);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showAllWorkingHours, setShowAllWorkingHours] = useState(false);
  const [refreshState, setRefreshState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const loadData = useCallback(async (options?: { manual?: boolean }) => {
    const manual = options?.manual ?? false;

    if (manual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setLoadError(null);

    try {
      const doctorRes = await fetch("/api/doctor", { method: "GET" });
      const doctorJson: DoctorResponse = await doctorRes.json();

      if (!doctorRes.ok || !doctorJson.success) {
        throw new Error(doctorJson.message || "Failed to load doctor data");
      }

      setWorkingHours(doctorJson.doctor?.workingHours || []);
      setUnavailableSlots(doctorJson.doctor?.unavailableSlots || []);
      setConsultationDurationMinutes(
        doctorJson.doctor?.consultationDurationMinutes || 60,
      );

      const rawAppointments =
        doctorJson.doctor?.appointments ??
        doctorJson.doctor?.bookings ??
        doctorJson.doctor?.scheduledPatients ??
        [];

      setAppointments(normalizeAppointments(rawAppointments));
      setLastUpdatedAt(new Date());

      return true;
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error ? error.message : "Something went wrong",
      );
      setWorkingHours([]);
      setUnavailableSlots([]);
      setAppointments([]);
      return false;
    } finally {
      if (manual) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshState("loading");

    const ok = await loadData({ manual: true });

    setRefreshState(ok ? "success" : "error");

    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = window.setTimeout(() => {
      setRefreshState("idle");
    }, 1400);
  }, [loadData]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    calendarRef.current?.getApi().gotoDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  };

  const handleOpenNewSlot = () => {
    setShowCreateSchedule(true);
  };

  const appointmentEvents = useMemo<EventInput[]>(() => {
    return appointments.map((appt) => ({
      id: appt.id,
      title: appt.patientName,
      start: `${appt.date}T${
        appt.time.length === 5 ? `${appt.time}:00` : appt.time
      }`,
      backgroundColor: appt.type === "clinic" ? "#81B641" : "#008081",
      borderColor: appt.type === "clinic" ? "#81B641" : "#008081",
      textColor: "#ffffff",
      extendedProps: {
        type: appt.type,
        description: appt.reason || "Booked appointment",
        patientName: appt.patientName,
        status: appt.status,
      } satisfies AppointmentEventProps,
    }));
  }, [appointments]);

  const workingHourEvents = useMemo<EventInput[]>(() => {
    const ranges = groupWorkingHourRanges(workingHours);

    return ranges.map((range, index) => {
      const fullDay = isFullWorkingDay(range.startTime, range.endTime);

      return {
        id: `working-${range.date}-${range.startTime}-${range.endTime}-${index}`,
        title: fullDay
          ? "Available all day"
          : `Available ${formatTime12(range.startTime)} - ${formatTime12(range.endTime)}`,
        start: range.date,
        end: addDaysToDateString(range.date, 1),
        allDay: true,
        backgroundColor: "#008081",
        borderColor: "#008081",
        textColor: "#ffffff",
        extendedProps: {
          description: fullDay
            ? "Working hours"
            : `Working hours ${formatTime12(range.startTime)} - ${formatTime12(range.endTime)}`,
        },
      };
    });
  }, [workingHours]);

  const blockedEvents = useMemo<EventInput[]>(() => {
    return unavailableSlots.map((slot, index) => {
      const fullDay = isFullBlockedDay(slot);
      const startTime = slot.startTime || "00:00";
      const endTime = slot.endTime || "23:59";

      return {
        id: `blocked-${slot.date}-${startTime}-${endTime}-${index}`,
        title: fullDay
          ? "Blocked all day"
          : `Blocked ${formatTime12(startTime)} - ${formatTime12(endTime)}`,
        start: fullDay ? slot.date : `${slot.date}T${startTime}:00`,
        end: fullDay
          ? addDaysToDateString(slot.date, 1)
          : `${slot.date}T${endTime}:00`,
        allDay: fullDay,
        backgroundColor: "#ef4444",
        borderColor: "#ef4444",
        textColor: "#ffffff",
        extendedProps: {
          description: fullDay
            ? slot.reason || "Blocked all day"
            : `${slot.reason || "Blocked"} · ${formatTime12(startTime)} - ${formatTime12(endTime)}`,
        },
      };
    });
  }, [unavailableSlots]);

  const calendarEvents = useMemo<EventInput[]>(() => {
    return [...appointmentEvents, ...workingHourEvents, ...blockedEvents];
  }, [appointmentEvents, workingHourEvents, blockedEvents]);

  const selectedUnavailableSlots = useMemo(() => {
    return unavailableSlots.filter((slot) => slot.date === selectedDate);
  }, [selectedDate, unavailableSlots]);

  const refreshLabel =
    refreshState === "loading"
      ? "Refreshing..."
      : refreshState === "success"
        ? "Refreshed"
        : refreshState === "error"
          ? "Retry failed"
          : "Refresh";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      <style>{`
        .text-primary { color: #008081; }
        .bg-primary { background-color: #008081; }
        .bg-secondary { background-color: #81B641; }
        .text-secondary { color: #81B641; }
        .rounded-3xl { border-radius: 2rem; }

        .fc {
          --fc-border-color: #e2e8f0;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #ffffff;
          --fc-list-event-hover-bg-color: #f8fafc;
          --fc-today-bg-color: rgba(0, 128, 129, 0.06);
          font-family: inherit;
        }

        .fc .fc-toolbar-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .fc .fc-button {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          box-shadow: none;
          border-radius: 0.75rem;
          padding: 0.4rem 0.75rem;
          font-weight: 700;
        }

        .fc .fc-button:hover {
          background: #f8fafc;
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background: #008081;
          border-color: #008081;
          color: #ffffff;
        }

        .fc .fc-daygrid-day-number,
        .fc .fc-col-header-cell-cushion {
          color: #475569;
          text-decoration: none;
          font-weight: 600;
        }

        .fc .fc-day-today {
          background: rgba(0, 128, 129, 0.06) !important;
        }

        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          color: #008081;
          font-weight: 800;
        }

        .fc .fc-event {
          border-radius: 0.75rem;
          border-width: 0;
          padding: 0.15rem 0.35rem;
          font-weight: 700;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          cursor: default !important;
        }

        .fc .fc-daygrid-event {
          margin-top: 0.25rem;
        }

        .fc .fc-scrollgrid {
          border-radius: 1.25rem;
          overflow: hidden;
        }

        .fc .fc-daygrid-day-frame {
          min-height: 82px;
        }

        .fc a.fc-event {
          pointer-events: none;
        }
      `}</style>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary" />
            <span className="text-lg font-bold">
              Appoint<span className="text-secondary">Care</span>
            </span>
          </div>
          <button type="button" className="text-slate-500">
            <Menu />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-white">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                    Appointment Management
                  </h1>
                  <p className="mt-1 text-slate-500">
                    View booked patients, working hours, and blocked slots.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleRefresh()}
                    disabled={isLoading || isRefreshing}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <RefreshCw
                      size={16}
                      className={isLoading || isRefreshing ? "animate-spin" : ""}
                    />
                    {refreshLabel}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenNewSlot}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90"
                  >
                    <Plus size={14} />
                    New Slot
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                {refreshState === "success" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                    <CheckCircle2 size={12} />
                    Updated at {formatLastUpdated(lastUpdatedAt)}
                  </span>
                ) : refreshState === "error" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 font-semibold text-red-700">
                    <AlertCircle size={12} />
                    Refresh failed
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                    Last updated: {formatLastUpdated(lastUpdatedAt)}
                  </span>
                )}
              </div>

              {loadError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {loadError}
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <div className="flex flex-col gap-4">
                  <WorkingHoursCard
                    workingHours={workingHours}
                    onViewAll={() => setShowAllWorkingHours(true)}
                  />

                  <BlockedSlotsCard
                    selectedDate={selectedDate}
                    slots={selectedUnavailableSlots}
                  />
                </div>

                <div className="flex flex-col gap-6">
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">
                          {formatMonthYear()}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Click a day to jump to it in the calendar.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-slate-100 p-1">
                          <button
                            type="button"
                            onClick={() => calendarRef.current?.getApi().prev()}
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => calendarRef.current?.getApi().next()}
                            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-white"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 overflow-hidden rounded-[1.25rem] border border-slate-200">
                      <FullCalendar
                        ref={calendarRef}
                        plugins={[
                          dayGridPlugin,
                          timeGridPlugin,
                          interactionPlugin,
                          listPlugin,
                        ]}
                        initialView="dayGridMonth"
                        headerToolbar={false}
                        height={520}
                        events={calendarEvents}
                        dateClick={handleDateClick}
                        selectable
                        dayMaxEvents={3}
                        eventDisplay="block"
                        eventTimeFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }}
                        eventClick={(info: EventClickArg) => {
                          info.jsEvent.preventDefault();
                          info.jsEvent.stopPropagation();
                        }}
                        eventDidMount={(info) => {
                          const description =
                            (info.event.extendedProps as { description?: string })
                              .description || info.event.title;

                          info.el.setAttribute("title", description);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-lg">
                  <RefreshCw size={14} className="animate-spin" />
                  Loading data...
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      {showCreateSchedule && (
        <CreateSchedule
          selectedDate={selectedDate}
          workingHours={workingHours}
          unavailableSlots={unavailableSlots}
          onClose={() => setShowCreateSchedule(false)}
          onSaved={async () => {
            await loadData();
            setShowCreateSchedule(false);
          }}
        />
      )}

      {showAllWorkingHours ? (
        <WorkingHoursModal
          open={showAllWorkingHours}
          onClose={() => setShowAllWorkingHours(false)}
          workingHours={workingHours}
        />
      ) : null}
    </div>
  );
}