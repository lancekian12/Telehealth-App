"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Video,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Menu,
  Settings,
  Calendar as CalendarIcon,
  RefreshCw,
  Clock3,
  Ban,
  UserRound,
} from "lucide-react";

type WorkingHour = {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type UnavailableSlot = {
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
};

type AppointmentType = "online" | "clinic";

type AppointmentRecord = {
  id: string;
  patientName: string;
  patientAvatar?: string;
  date: string;
  time: string;
  type: AppointmentType;
  reason?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
};

type DoctorResponse = {
  success: boolean;
  message?: string;
  doctor?: {
    workingHours?: WorkingHour[];
    unavailableSlots?: UnavailableSlot[];
    appointments?: unknown;
    bookings?: unknown;
    scheduledPatients?: unknown;
  };
};

type AppointmentEventProps = {
  type: AppointmentType;
  description?: string;
  patientName?: string;
  status?: string;
};

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

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRange(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
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

function normalizeSchedule(doctor: DoctorResponse["doctor"]) {
  const workingHours = Array.isArray(doctor?.workingHours) ? doctor!.workingHours! : [];
  const unavailableSlots = Array.isArray(doctor?.unavailableSlots)
    ? doctor!.unavailableSlots!
    : [];

  return { workingHours, unavailableSlots };
}

export default function DoctorAppointmentClient() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const res = await fetch("/api/doctor", { method: "GET" });
      const json: DoctorResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load doctor data");
      }

      const schedule = normalizeSchedule(json.doctor);
      setWorkingHours(schedule.workingHours);
      setUnavailableSlots(schedule.unavailableSlots);

      const rawAppointments =
        json.doctor?.appointments ??
        json.doctor?.bookings ??
        json.doctor?.scheduledPatients ??
        [];

      setAppointments(normalizeAppointments(rawAppointments));
    } catch (error: unknown) {
      setLoadError(error instanceof Error ? error.message : "Something went wrong");
      setWorkingHours([]);
      setUnavailableSlots([]);
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    calendarRef.current?.getApi().gotoDate(selectedDate);
  }, [selectedDate]);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  };

  const appointmentEvents = useMemo<EventInput[]>(() => {
    return appointments.map((appt) => ({
      id: appt.id,
      title: appt.patientName,
      start: `${appt.date}T${appt.time.length === 5 ? `${appt.time}:00` : appt.time}`,
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

  const blockedEvents = useMemo<EventInput[]>(() => {
    return unavailableSlots.map((slot) => ({
      id: `blocked-${slot.date}-${slot.startTime}-${slot.endTime}`,
      start: `${slot.date}T${slot.startTime}:00`,
      end: `${slot.date}T${slot.endTime}:00`,
      display: "background",
      backgroundColor: "rgba(239, 68, 68, 0.18)",
      extendedProps: {
        description: slot.reason || "Unavailable",
      },
    }));
  }, [unavailableSlots]);

  const calendarEvents = useMemo<EventInput[]>(
    () => [...appointmentEvents, ...blockedEvents],
    [appointmentEvents, blockedEvents]
  );

  const eventsForSelectedDate = useMemo(() => {
    return appointments.filter((appt) => appt.date === selectedDate);
  }, [appointments, selectedDate]);

  const today = getLocalDateString(new Date());
  const todayAppointments = useMemo(() => {
    return appointments.filter((appt) => appt.date === today);
  }, [appointments, today]);

  const selectedUnavailableSlots = useMemo(() => {
    return unavailableSlots.filter((slot) => slot.date === selectedDate);
  }, [selectedDate, unavailableSlots]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <style>{`
        .status-badge {
          display:flex;
          align-items:center;
          gap:.375rem;
          padding:.375rem .625rem;
          border-radius:999px;
          font-size:11px;
          font-weight:700;
          text-transform: uppercase;
          border:1px solid rgba(0,0,0,0.05);
        }
        .status-badge.online {
          background-color: rgba(0,128,129,0.1);
          color:#008081;
          border-color: rgba(0,128,129,0.2);
        }
        .status-badge.clinic {
          background-color: rgba(129,182,65,0.1);
          color:#81B641;
          border-color: rgba(129,182,65,0.2);
        }
        .text-primary { color: #008081; }
        .bg-primary { background-color: #008081; }
        .bg-secondary { background-color: #81B641; }
        .text-secondary { color: #81B641; }
        .rounded-3xl { border-radius: 2rem; }
      `}</style>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 md:hidden bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary" />
            <span className="text-lg font-bold">
              Appoint<span className="text-secondary">Care</span>
            </span>
          </div>
          <button className="text-slate-500">
            <Menu />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Appointment Management
                  </h1>
                  <p className="text-slate-500 mt-1">
                    View booked patients, daily schedule, and blocked slots.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => void loadData()}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>

                  <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                    <Settings size={16} />
                    Filters
                  </button>

                  <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 shadow-lg transition-all flex items-center gap-2">
                    <Plus size={14} />
                    New Slot
                  </button>
                </div>
              </div>

              {loadError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {loadError}
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-6 bg-secondary rounded-full" />
                      Today&apos;s Patients
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-bold">
                        {todayAppointments.length}
                      </span>
                    </h3>
                  </div>

                  {todayAppointments.length === 0 ? (
                    <div className="rounded-2xl bg-white border border-slate-200 p-5 text-slate-500">
                      No patients today.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {todayAppointments.map((appt) => (
                        <div
                          key={appt.id}
                          className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {appt.patientAvatar ? (
                                <img
                                  src={appt.patientAvatar}
                                  alt={appt.patientName}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
                                  {appt.patientName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")}
                                </div>
                              )}

                              <div>
                                <h4 className="font-bold text-slate-800">
                                  {appt.patientName}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {appt.reason || "Booked appointment"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`status-badge shrink-0 ${
                                appt.type === "online" ? "online" : "clinic"
                              }`}
                            >
                              {appt.type === "online" ? (
                                <Video size={14} />
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              <span>{appt.type === "online" ? "Online" : "Clinic"}</span>
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                              <CalendarIcon size={14} />
                              {formatDateLabel(appt.date)}
                            </div>
                            <div className="flex items-center gap-2 font-semibold text-slate-700">
                              <Clock3 size={14} />
                              {appt.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock3 size={16} className="text-primary" />
                      <h4 className="font-semibold text-slate-800">Working Hours</h4>
                    </div>

                    {workingHours.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No working hours found.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {workingHours.map((item, index) => (
                          <div
                            key={`${item.day}-${index}`}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                          >
                            <div>
                              <p className="font-medium text-slate-800">{item.day}</p>
                              <p className="text-slate-500">
                                {formatTimeRange(item.startTime, item.endTime)}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                item.isAvailable
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Ban size={16} className="text-secondary" />
                      <h4 className="font-semibold text-slate-800">Blocked Slots</h4>
                    </div>

                    {selectedUnavailableSlots.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No blocked slots on {formatDateLabel(selectedDate)}.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedUnavailableSlots.map((slot, index) => (
                          <div
                            key={`${slot.date}-${slot.startTime}-${slot.endTime}-${index}`}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-slate-800">
                                  {formatShortDate(slot.date)}
                                </p>
                                <p className="text-slate-500">
                                  {slot.startTime} - {slot.endTime}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                                Blocked
                              </span>
                            </div>
                            {slot.reason ? (
                              <p className="mt-2 text-xs text-slate-500">
                                {slot.reason}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <h2 className="text-xl font-bold text-slate-800">
                        {new Date().toLocaleString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>

                      <div className="flex items-center gap-2">
                        <div className="flex bg-slate-100 rounded-lg p-1">
                          <button
                            onClick={() => calendarRef.current?.getApi().prev()}
                            className="p-1 hover:bg-white rounded-md transition-colors text-slate-500"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => calendarRef.current?.getApi().next()}
                            className="p-1 hover:bg-white rounded-md transition-colors text-slate-500"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
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
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />
                        Schedule for {formatDateLabel(selectedDate)}
                      </h3>
                      <span className="text-sm text-slate-500">
                        {eventsForSelectedDate.length} appointment
                        {eventsForSelectedDate.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {eventsForSelectedDate.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">
                          {selectedDate === today
                            ? "No patients today."
                            : `No appointments on ${formatDateLabel(selectedDate)}.`}
                        </div>
                      ) : (
                        eventsForSelectedDate.map((appt) => (
                          <div
                            key={appt.id}
                            className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex sm:flex-col items-center sm:items-start justify-center min-w-[5rem] text-center sm:text-left border-r sm:border-r-0 border-slate-100 pr-4 sm:pr-0">
                              <span
                                className={`text-xl font-bold ${
                                  appt.type === "online"
                                    ? "text-primary"
                                    : "text-slate-700"
                                }`}
                              >
                                {appt.time}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {appt.type === "online" ? "ONLINE" : "CLINIC"}
                              </span>
                            </div>

                            <div className="flex-1 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm">
                                {appt.patientName
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((s) => s[0])
                                  .join("")}
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 text-sm">
                                  {appt.patientName}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                  <span
                                    className={`${
                                      appt.type === "clinic"
                                        ? "bg-secondary/10 text-secondary"
                                        : "bg-primary/10 text-primary"
                                    } px-1.5 py-0.5 rounded text-[10px] font-bold uppercase`}
                                  >
                                    {appt.type === "clinic" ? "Clinic" : "Online"}
                                  </span>
                                  <span>• {appt.reason || "Booked appointment"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {appt.type === "online" ? (
                                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2">
                                  <Video size={14} />
                                  Start Tele-Consult
                                </button>
                              ) : (
                                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:opacity-90 shadow-lg transition-all flex items-center justify-center gap-2">
                                  <CheckCircle size={14} />
                                  Clinic Check-in
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="fixed bottom-4 right-4 rounded-full bg-white border border-slate-200 shadow-lg px-4 py-2 text-sm text-slate-600 flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  Loading data...
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}