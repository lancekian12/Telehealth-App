"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import FullCalendar from "@fullcalendar/react";
import type { DateClickArg } from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import WorkingHoursModal from "@/components/doctor/working-hours-modal";
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
  X,
  Repeat,
  Check,
  CalendarDays,
} from "lucide-react";
import {
  AppointmentEventProps,
  AppointmentRecord,
  AppointmentType,
  DoctorResponse,
  ScheduleResponse,
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

function formatDateAndTime(
  dateStr: string,
  startTime: string,
  endTime: string,
) {
  return `${formatShortDate(dateStr)} • ${formatTimeRange(startTime, endTime)}`;
}

function addMinutesToTime(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const normalized = ((total % 1440) + 1440) % 1440;
  const nextH = Math.floor(normalized / 60);
  const nextM = normalized % 60;
  return `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;
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

type WorkingHourView = WorkingHour & {
  date?: string;
  day?: string;
  isAvailable?: boolean;
};

type ScheduleListItem = {
  id: string;
  kind: "appointment" | "blocked";
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  badgeText: string;
  badgeClassName: string;
  avatar?: string;
  appointmentType?: AppointmentType;
};

export default function DoctorAppointmentClient() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [selectedDate, setSelectedDate] = useState(() =>
    getLocalDateString(new Date()),
  );
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>(
    [],
  );
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [consultationDurationMinutes, setConsultationDurationMinutes] =
    useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);

  const [showNewSlot, setShowNewSlot] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRecord | null>(null);

  const [slotDate, setSlotDate] = useState("");
  const [slotStatus, setSlotStatus] = useState<"available" | "blocked">(
    "available",
  );
  const [slotStartTime, setSlotStartTime] = useState("00:00");
  const [slotEndTime, setSlotEndTime] = useState("23:59");
  const [slotReason, setSlotReason] = useState("");

  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("09:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("09:30");
  const [saving, setSaving] = useState(false);
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const [showAllWorkingHours, setShowAllWorkingHours] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const [doctorRes, scheduleRes] = await Promise.all([
        fetch("/api/doctor", { method: "GET" }),
        fetch("/api/doctor/schedule-settings", { method: "GET" }),
      ]);

      const doctorJson: DoctorResponse = await doctorRes.json();
      const scheduleJson: ScheduleResponse = await scheduleRes.json();

      if (!doctorRes.ok || !doctorJson.success) {
        throw new Error(doctorJson.message || "Failed to load doctor data");
      }

      if (!scheduleRes.ok || !scheduleJson.success) {
        throw new Error(scheduleJson.message || "Failed to load schedule data");
      }

      setWorkingHours(
        scheduleJson.workingHours || doctorJson.doctor?.workingHours || [],
      );
      setUnavailableSlots(
        scheduleJson.unavailableSlots ||
          doctorJson.doctor?.unavailableSlots ||
          [],
      );

      setConsultationDurationMinutes(
        doctorJson.doctor?.consultationDurationMinutes || 60,
      );

      const rawAppointments =
        doctorJson.doctor?.appointments ??
        doctorJson.doctor?.bookings ??
        doctorJson.doctor?.scheduledPatients ??
        [];

      setAppointments(normalizeAppointments(rawAppointments));
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error ? error.message : "Something went wrong",
      );
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

  useEffect(() => {
    if (!showCreateSchedule && !showReschedule) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCreateSchedule(false);
        setShowReschedule(false);
        setShowAllSchedule(false);
        setShowAllWorkingHours(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCreateSchedule, showReschedule]);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
    setShowAllSchedule(false);
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

  const calendarEvents = useMemo<EventInput[]>(() => {
    return [...appointmentEvents, ...blockedEvents];
  }, [appointmentEvents, blockedEvents]);

  const selectedDaySchedule = useMemo<ScheduleListItem[]>(() => {
    const selectedAppointments: ScheduleListItem[] = appointments
      .filter((appt) => appt.date === selectedDate)
      .map((appt) => ({
        id: appt.id,
        kind: "appointment",
        date: appt.date,
        startTime: appt.time,
        endTime: addMinutesToTime(appt.time, consultationDurationMinutes),
        title: appt.patientName,
        description: appt.reason || "Booked appointment",
        badgeText: appt.type === "online" ? "Online" : "Clinic",
        badgeClassName:
          appt.type === "online"
            ? "bg-primary/10 text-primary"
            : "bg-secondary/10 text-secondary",
        avatar: appt.patientAvatar,
        appointmentType: appt.type,
      }));

    const blockedItems: ScheduleListItem[] = unavailableSlots
      .filter((slot) => slot.date === selectedDate)
      .map((slot) => ({
        id: `blocked-${slot.date}-${slot.startTime}-${slot.endTime}`,
        kind: "blocked",
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        title: "Blocked Slot",
        description: slot.reason || "Unavailable",
        badgeText: "Blocked",
        badgeClassName: "bg-red-100 text-red-700",
      }));

    return [...selectedAppointments, ...blockedItems].sort((a, b) =>
      a.startTime.localeCompare(b.startTime),
    );
  }, [
    appointments,
    consultationDurationMinutes,
    selectedDate,
    unavailableSlots,
  ]);

  const today = getLocalDateString(new Date());
  const todayAppointments = useMemo(() => {
    return appointments.filter((appt) => appt.date === today);
  }, [appointments, today]);

  const selectedUnavailableSlots = useMemo(() => {
    return unavailableSlots.filter((slot) => slot.date === selectedDate);
  }, [selectedDate, unavailableSlots]);


  const handleOpenNewSlot = () => {
    setSlotDate(selectedDate);
    setSlotStatus("available");
    setSlotStartTime("00:00");
    setSlotEndTime("23:59");
    setSlotReason("");
    setShowCreateSchedule(true);
  };

  const handleReschedule = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setSaving(true);

    try {
      const res = await fetch(
        `/api/doctor/appointments/${selectedAppointment.id}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentDate: rescheduleDate,
            startTime: rescheduleStartTime,
            endTime: rescheduleEndTime,
          }),
        },
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to reschedule appointment");
      }

      await loadData();
      setShowReschedule(false);
      setSelectedAppointment(null);
    } catch (error: unknown) {
      setLoadError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  const openRescheduleModal = (appt: AppointmentRecord) => {
    setSelectedAppointment(appt);
    setRescheduleDate(appt.date);
    setRescheduleStartTime(appt.time);
    setRescheduleEndTime(
      addMinutesToTime(appt.time, consultationDurationMinutes),
    );
    setShowReschedule(true);
  };

  const previewItems = selectedDaySchedule.slice(0, 9);

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

                  <button
                    onClick={handleOpenNewSlot}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 shadow-lg transition-all flex items-center gap-2"
                  >
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

                  <WorkingHoursCard
                    workingHours={workingHours}
                    onViewAll={() => setShowAllWorkingHours(true)}
                  />

                  <BlockedSlotsCard
                    selectedDate={selectedDate}
                    slots={selectedUnavailableSlots}
                  />
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
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />
                        Schedule for {formatDateLabel(selectedDate)}
                      </h3>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">
                          {selectedDaySchedule.length} item
                          {selectedDaySchedule.length !== 1 ? "s" : ""}
                        </span>

                        {selectedDaySchedule.length > 9 ? (
                          <button
                            onClick={() => setShowAllSchedule(true)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                          >
                            View all
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedDaySchedule.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">
                          {selectedDate === today
                            ? "No patients today."
                            : `No appointments on ${formatDateLabel(selectedDate)}.`}
                        </div>
                      ) : (
                        <>
                          {previewItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex sm:flex-col items-center sm:items-start justify-center min-w-[8rem] text-center sm:text-left border-r sm:border-r-0 border-slate-100 pr-4 sm:pr-0">
                                <span className="text-lg font-bold text-slate-800">
                                  {item.startTime}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  {formatShortDate(item.date)}
                                </span>
                                <span
                                  className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    item.kind === "blocked"
                                      ? "bg-red-100 text-red-700"
                                      : item.appointmentType === "clinic"
                                        ? "bg-secondary/10 text-secondary"
                                        : "bg-primary/10 text-primary"
                                  }`}
                                >
                                  {item.kind === "blocked"
                                    ? "Blocked"
                                    : item.appointmentType === "clinic"
                                      ? "Clinic"
                                      : "Online"}
                                </span>
                              </div>

                              <div className="flex-1 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm overflow-hidden">
                                  {item.kind === "blocked" ? (
                                    <Ban size={16} className="text-red-500" />
                                  ) : item.avatar ? (
                                    <img
                                      src={item.avatar}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    item.title
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((s) => s[0])
                                      .join("")
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm">
                                    {item.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        item.kind === "blocked"
                                          ? "bg-red-100 text-red-700"
                                          : item.badgeClassName
                                      }`}
                                    >
                                      {item.badgeText}
                                    </span>
                                    <span>• {item.description}</span>
                                    <span>
                                      •{" "}
                                      {formatDateAndTime(
                                        item.date,
                                        item.startTime,
                                        item.endTime,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {item.kind === "appointment" ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const appt = appointments.find(
                                        (a) => a.id === item.id,
                                      );
                                      if (appt) openRescheduleModal(appt);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                  >
                                    <RefreshCw size={14} />
                                    Reschedule
                                  </button>

                                  {item.appointmentType === "online" ? (
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
                              ) : (
                                <div className="flex items-center">
                                  <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-red-50 text-red-700">
                                    Schedule blocked
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}

                          {selectedDaySchedule.length > 9 ? (
                            <button
                              onClick={() => setShowAllSchedule(true)}
                              className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              View all {selectedDaySchedule.length} schedule
                              items
                            </button>
                          ) : null}
                        </>
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

      {showCreateSchedule && (
        <CreateSchedule
          selectedDate={selectedDate}
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

      {showAllSchedule ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setShowAllSchedule(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-[32px] border border-slate-200 bg-white shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => setShowAllSchedule(false)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-wide text-primary">
                  <CalendarDays className="h-4 w-4" />
                  FULL SCHEDULE
                </div>

                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  Schedule for {formatDateLabel(selectedDate)}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  All appointments and blocked slots for the selected date.
                </p>
              </div>

              <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-3">
                {selectedDaySchedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="md:min-w-[10rem]">
                      <p className="text-sm font-bold text-slate-900">
                        {formatShortDate(item.date)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.startTime} - {item.endTime}
                      </p>
                      <span
                        className={`mt-2 inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.kind === "blocked"
                            ? "bg-red-100 text-red-700"
                            : item.appointmentType === "clinic"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.badgeText}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAllSchedule(false)}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showReschedule && selectedAppointment ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setShowReschedule(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white shadow-2xl"
          >
            <button
              onClick={() => setShowReschedule(false)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold tracking-wide text-primary">
                  <Repeat className="h-4 w-4" />
                  RESCHEDULE APPOINTMENT
                </div>

                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">
                  Reschedule {selectedAppointment.patientName}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Move this appointment to a new date and time.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleReschedule}>
                <div>
                  <label className="mb-3 block text-sm font-bold text-slate-900">
                    New Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none"
                    required
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={rescheduleStartTime}
                      onChange={(e) => setRescheduleStartTime(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-900">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={rescheduleEndTime}
                      onChange={(e) => setRescheduleEndTime(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowReschedule(false)}
                    className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-70"
                  >
                    <Check className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
