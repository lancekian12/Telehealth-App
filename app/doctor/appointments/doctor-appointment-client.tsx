"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
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
} from "lucide-react";

type PendingRequest = {
  id: string;
  name: string;
  avatar?: string;
  requestedAt: string;
  type: "online" | "clinic";
  note?: string;
  slot: string;
};

type AppointmentEventProps = {
  type: "online" | "clinic";
  description?: string;
};

const initialPending: PendingRequest[] = [
  {
    id: "p1",
    name: "Alice Freeman",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    requestedAt: "10 mins ago",
    type: "online",
    note: "I've been experiencing mild headaches for the last 3 days. Would like a quick consultation.",
    slot: "Oct 24, 10:30 AM",
  },
  {
    id: "p2",
    name: "Michael King",
    requestedAt: "1 hour ago",
    type: "clinic",
    note: "Annual physical checkup and blood work review.",
    slot: "Oct 25, 09:00 AM",
  },
  {
    id: "p3",
    name: "Sarah Jenkins",
    avatar:
      "https://images.unsplash.com/photo-1545996124-66d39ea0f3f0?w=400&h=400&fit=crop",
    requestedAt: "2 hours ago",
    type: "online",
    note: "Follow up on my skin rash medication. It seems to be improving.",
    slot: "Oct 24, 02:00 PM",
  },
];

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialEvents(): EventInput[] {
  const today = new Date();
  const todayStr = getLocalDateString(today);

  const sampleDate = new Date();
  sampleDate.setDate(today.getDate() + 2);
  const sampleStr = getLocalDateString(sampleDate);

  return [
    {
      id: "e1",
      title: "Emma Wilson - Teleconsult",
      start: `${todayStr}T09:00:00`,
      extendedProps: {
        type: "online",
        description: "Teleconsult session",
      } satisfies AppointmentEventProps,
    },
    {
      id: "e2",
      title: "Robert Brown - Clinic",
      start: `${todayStr}T11:15:00`,
      extendedProps: {
        type: "clinic",
        description: "In-person visit",
      } satisfies AppointmentEventProps,
    },
    {
      id: "e3",
      title: "Sarah Miller - Routine",
      start: `${todayStr}T14:00:00`,
      extendedProps: {
        type: "online",
        description: "Routine follow-up",
      } satisfies AppointmentEventProps,
    },
    {
      id: "e4",
      title: "Follow-up (EKG)",
      start: `${sampleStr}T10:30:00`,
      extendedProps: {
        type: "clinic",
        description: "Follow-up check",
      } satisfies AppointmentEventProps,
    },
  ];
}

export default function DoctorAppointmentClient() {
  const calendarRef = useRef<FullCalendar | null>(null);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return getLocalDateString(d);
  });

  const [pending, setPending] = useState<PendingRequest[]>(() => initialPending);
  const [events, setEvents] = useState<EventInput[]>(() => getInitialEvents());

  useEffect(() => {
    calendarRef.current?.getApi().gotoDate(selectedDate);
  }, [selectedDate]);

  const handleDateClick = (arg: DateClickArg) => {
    setSelectedDate(arg.dateStr);
  };

  const handleAccept = (id: string) => {
    const req = pending.find((p) => p.id === id);
    if (!req) return;

    setPending((prev) => prev.filter((p) => p.id !== id));

    const ev: EventInput = {
      id: `evt-${Date.now()}`,
      title: `${req.name} - ${req.type === "online" ? "Teleconsult" : "Clinic"}`,
      start: `${getLocalDateString(new Date())}T10:00:00`,
      extendedProps: { type: req.type } satisfies AppointmentEventProps,
    };

    setEvents((prev) => [...prev, ev]);
  };

  const handleReject = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const eventsForSelectedDate = useMemo(() => {
    return events.filter((ev) => {
      if (!ev.start) return false;
      const start =
        typeof ev.start === "string"
          ? ev.start
          : (ev.start as Date).toISOString();
      return start.startsWith(selectedDate);
    });
  }, [events, selectedDate]);

  return (
    <div className="flex h-screen overflow-hidden">
      <style>{`
        .pending-card {
          display:flex; flex-direction: column; padding:1rem; border-radius:1rem; background: #ffffff;
          border: 1px solid #e6eef0;
        }
        .health-tag {
          padding: .375rem .625rem; border-radius:999px; font-size:10px; font-weight:700; text-transform: uppercase;
        }
        .status-badge {
          display:flex; align-items:center; gap:.375rem; padding:.375rem .625rem; border-radius:999px; font-size:11px; font-weight:700; text-transform: uppercase; border:1px solid rgba(0,0,0,0.05);
        }
        .status-badge.online { background-color: rgba(0,128,129,0.1); color:#008081; border-color: rgba(0,128,129,0.2); }
        .status-badge.clinic { background-color: rgba(129,182,65,0.1); color:#81B641; border-color: rgba(129,182,65,0.2); }
        .calendar-day {
          height:3rem; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top:.375rem; border-radius:.75rem;
          color:#334155; transition: background-color .15s, border .15s; cursor: pointer;
        }
        .calendar-day.selected { background-color: rgba(0,128,129,0.03); border: 1px solid rgba(0,128,129,0.12); color:#008081; font-weight:700; }
        .calendar-day.today { background-color: #f1f5f9; font-weight:700; }
        .dot { width:.375rem; height:.375rem; border-radius:999px; }
        .text-primary { color: #008081; }
        .bg-primary { background-color: #008081; }
        .bg-secondary { background-color: #81B641; }
        .text-secondary { color: #81B641; }
        .rounded-3xl { border-radius: 2rem; }
      `}</style>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
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

        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 h-full">
            <div className="flex flex-col h-full gap-6">
              <div className="flex items-center justify-between shrink-0">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    Appointment Management
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Manage pending requests and your daily schedule.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
                    <Settings size={16} /> Filters
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-lg transition-all flex items-center gap-2">
                    <Plus size={14} /> New Slot
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 h-full">
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-6 bg-secondary rounded-full" />{" "}
                      Pending Requests{" "}
                      <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-bold">
                        {pending.length}
                      </span>
                    </h3>
                    <button className="text-sm text-primary font-semibold hover:underline">
                      View All
                    </button>
                  </div>

                  <div
                    className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4 h-full"
                    style={{ maxHeight: "calc(100vh - 200px)" }}
                  >
                    {pending.map((p) => (
                      <div key={p.id} className="pending-card group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex gap-3">
                            {p.avatar ? (
                              <img
                                alt={p.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                src={p.avatar}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                                {p.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-white">
                                {p.name}
                              </h4>
                              <p className="text-xs text-slate-500">
                                Requested: {p.requestedAt}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`status-badge shrink-0 ${
                              p.type === "online" ? "online" : "clinic"
                            }`}
                          >
                            {p.type === "online" ? (
                              <Video size={14} />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                            <span className="ml-1">
                              {p.type === "online" ? "Online" : "F2F Visit"}
                            </span>
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-4 text-sm text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                          <p className="line-clamp-2">{p.note}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                            <CalendarIcon size={14} />
                            {p.slot}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <button
                            onClick={() => handleReject(p.id)}
                            className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 text-sm font-semibold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(p.id)}
                            className={`py-2 px-3 rounded-lg ${
                              p.type === "clinic"
                                ? "bg-secondary text-white hover:bg-secondary/90 shadow-md"
                                : "bg-primary text-white hover:bg-primary/90 shadow-md"
                            } text-sm font-semibold transition-colors`}
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {new Date().toLocaleString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <div className="flex gap-2">
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                          <button
                            onClick={() => {
                              const api = calendarRef.current?.getApi();
                              api?.prev();
                            }}
                            className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors text-slate-500"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => {
                              const api = calendarRef.current?.getApi();
                              api?.next();
                            }}
                            className="p-1 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-colors text-slate-500"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <div
                          key={`${d}-${i}`}
                          className="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                        >
                          {d}
                        </div>
                      ))}
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
                        height={420}
                        events={events}
                        dateClick={handleDateClick}
                        dayMaxEvents={3}
                        selectable
                        eventDisplay="block"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-primary rounded-full" />{" "}
                        Schedule for{" "}
                        {new Date(selectedDate).toLocaleDateString()}
                      </h3>
                      <span className="text-sm text-slate-500">
                        {eventsForSelectedDate.length} Appointments
                      </span>
                    </div>

                    <div
                      className="space-y-3 overflow-y-auto pr-2 pb-4"
                      style={{ maxHeight: "calc(100vh - 550px)" }}
                    >
                      {eventsForSelectedDate.length === 0 && (
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-slate-500">
                          No appointments on{" "}
                          {new Date(selectedDate).toLocaleDateString()}.
                        </div>
                      )}

                      {eventsForSelectedDate.map((ev) => {
                        const startStr =
                          typeof ev.start === "string"
                            ? ev.start
                            : (ev.start as Date).toISOString();
                        const time = new Date(startStr).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const evType =
                          (
                            ev.extendedProps as
                              | AppointmentEventProps
                              | undefined
                          )?.type || "online";

                        return (
                          <div
                            key={String(ev.id)}
                            className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex sm:flex-col items-center sm:items-start justify-center min-w-[4.5rem] text-center sm:text-left border-r sm:border-r-0 border-slate-100 pr-4 sm:pr-0">
                              <span
                                className={`text-xl font-bold ${
                                  evType === "online"
                                    ? "text-primary"
                                    : "text-slate-700"
                                }`}
                              >
                                {time}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                {
                                  new Date(startStr)
                                    .toLocaleString(undefined, { hour12: true })
                                    .split(" ")[1]
                                }
                              </span>
                            </div>

                            <div className="flex-1 flex items-center gap-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm">
                                  {(ev.title as string)
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((s) => s[0])
                                    .join("")}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                                  {ev.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <span
                                    className={`${
                                      evType === "clinic"
                                        ? "bg-secondary/10 text-secondary"
                                        : "bg-primary/10 text-primary"
                                    } px-1.5 py-0.5 rounded text-[10px] font-bold uppercase`}
                                  >
                                    {evType === "clinic" ? "Clinic" : "Online"}
                                  </span>
                                  <span>
                                    • {ev.extendedProps?.description || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center">
                              {evType === "online" ? (
                                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-lg transition-all flex items-center justify-center gap-2">
                                  <Video size={14} /> Start Tele-Consult
                                </button>
                              ) : (
                                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold hover:bg-secondary/90 shadow-lg transition-all flex items-center justify-center gap-2">
                                  <CheckCircle size={14} /> Clinic Check-in
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}