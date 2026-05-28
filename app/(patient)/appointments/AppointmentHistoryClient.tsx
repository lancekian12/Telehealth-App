"use client";

import React, { JSX } from "react";
import {
  Calendar,
  Plus,
  Video,
  MapPin,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

type AppointmentStatus = "upcoming" | "scheduled" | "completed" | "cancelled";

type Appointment = {
  id: string;
  dateLabel: string;
  dateISO?: string;
  time?: string;
  duration?: string;
  doctorName: string;
  specialty: string;
  location?: string;
  img: string;
  type: "video" | "in-person";
  status: AppointmentStatus;
  note?: string;
};

const SAMPLE: Appointment[] = [
  {
    id: "a1",
    dateLabel: "Today",
    dateISO: "2026-02-12T10:30:00",
    time: "10:30 AM",
    duration: "30 min",
    doctorName: "Dr. Maria Santos",
    specialty: "General Pediatrics",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJlVhFcqU6rhRVGOSoSK85MOYvSWfF0iHljU1TGeexv_sSOkkfL4FTxy3vWUt_2crV_kpD6aTVmA1OsL45ywM7BZzgI2JXebJHrN0s_4x9bMLMk-3BVM2o0saMxf0rrjJIFu0ONvqgVt8IytR87mFc-9xTVuS3lzDAACVTDasGCSwpGVIQrJafDo2Lc3KRCaI-S4x9rqQ5vKwTy_KO2IEDbxEEpAIUYSFAndWJ69w2CDusJPk17ANQHoYmuRQ-lPYutTBdNfwLjko",
    type: "video",
    status: "upcoming",
    note: "Appointment starts in 2 hours",
  },
  {
    id: "a2",
    dateLabel: "Oct 26",
    dateISO: "2025-10-26T14:00:00",
    time: "02:00 PM",
    doctorName: "Dr. Robert Chen",
    specialty: "Cardiologist",
    location: "Davao Doctors Hospital, Room 304",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMQHpcRyxl4oEIXdtDzkoIwHABF-6C4DDuGeiN7mdqod_Fz6YI-6KnPYLkvLKeru1_ahi23vFXghZkbqtSeIR5mY0fV-uj1J4PCBIvlDsp5nDVuSBPxvSXF-khtOyRE5aGTnxkbx7yUeLXqE2V--xLOECJweRVjgAvHLlueDH4mwk9fzgqp2oJuIRgsgPltGx5PjRbaaEZfVE3iuuC04PxsViGR-EDHmoVMu2-n-SJ-slBmruSzVGWvVdvQPQaETGfy0UNbaVF8x8",
    type: "in-person",
    status: "scheduled",
  },
  {
    id: "a3",
    dateLabel: "Oct 12",
    dateISO: "2025-10-12T09:00:00",
    time: "09:00 AM",
    doctorName: "Dr. Sarah Lee",
    specialty: "Dermatologist",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGBP0D_VaD-rBZVmtqOMTbR7999R-WVaOs2LugWLuSe8oEXTUzGd0TDPyORzhyXBSdAyNNOQeOMnCjZ7YSWAW0fc7Wy9ThehoJixjlwV74eSUi3NmGFYewfdS_UsWys4gNVjHo355496ybrq0jCMFhwmsv3e8g13sBjnVkzmlmDv-Rk0d7Zyo1B8tst5SQb5WXsCU2QaltpGXLpbjLYj-LvUSmpXbs2b4mRHc5WvKlZK9Vi37JqXmynEamAPObW5Wnr7FlDCBy5BU",
    type: "in-person",
    status: "completed",
  },
  {
    id: "a4",
    dateLabel: "Sep 28",
    dateISO: "2025-09-28T11:30:00",
    time: "11:30 AM",
    doctorName: "Dr. James Wong",
    specialty: "Orthopedics",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdELdqNQM6ajn1ywxLksQVDG-IiL9i2UCmKnVd0tu8fWR8TLSwJcVEfe5Kfkg3mj1C8XcLu2feT0KC1AqvlkBK9jheQSpP6pG3aatkI0_3OeRtfHgeLKL16NMXg71XR6uY6lrTtToTyEePXrdCZSAaZPfuGXIee8mby1ss2DaChPPKMiHAwHTuWKzpmMnRQCJe_oD23SUNaPZLq2Ph3_LDs9vFOmcSJMSV8JJHGebhOw2iyNeT9r7z0S8JjyADecvxFHw4m2BmkpE",
    type: "video",
    status: "cancelled",
    note: "Cancelled by patient",
  },
];

export default function AppointmentHistoryClient(): JSX.Element {
  const [appointments] = React.useState<Appointment[]>(SAMPLE);

  function formatSmallDate(iso?: string) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return iso ?? "";
    }
  }

  function statusBadge(status: AppointmentStatus) {
    switch (status) {
      case "upcoming":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "scheduled":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "completed":
        return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  const isAvailable = (s: AppointmentStatus) => s === "upcoming";

  return (
    <div className="min-h-screen mt-20 flex flex-col font-sans bg-organic-pattern bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/20">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="fixed top-20 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />
        <div className="fixed bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Your Care Journey
            </h1>
            <p className="text-slate-500 mt-1">
              Track your appointments and health history
            </p>
          </div>

          <div className="flex gap-3">
            <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2">
              <Calendar size={16} />
              <span>Filter Date</span>
            </button>

            <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
              <Plus size={16} />
              <span>New Appointment</span>
            </button>
          </div>
        </div>

        <div className="relative space-y-0 pl-2">
          {appointments.map((a) => (
            <div key={a.id} className="timeline-item relative flex gap-6 pb-10">
              <div className="timeline-connector" />

              <div className="hidden sm:flex flex-col items-end w-32 pt-1 shrink-0">
                <span
                  className={`text-lg font-bold ${
                    isAvailable(a.status)
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {a.dateLabel}
                </span>
                {a.time && (
                  <span
                    className={`text-sm ${
                      a.status === "upcoming" ? "text-primary" : "text-slate-500"
                    } font-medium`}
                  >
                    {a.time}
                  </span>
                )}
                {a.duration && (
                  <span className="text-xs text-slate-400 mt-1">
                    {a.duration}
                  </span>
                )}
              </div>

              <div className="relative z-10 shrink-0">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-background-dark ${
                    a.status === "upcoming"
                      ? "bg-primary text-white"
                      : a.status === "scheduled"
                      ? "bg-secondary text-white"
                      : a.status === "completed"
                      ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {a.type === "video" ? <Video size={20} /> : <MapPin size={20} />}
                </div>
              </div>

              <div className="flex-1">
                <div
                  className={`glass-panel rounded-2xl p-6 hover:shadow-xl transition-shadow relative overflow-hidden border-l-4 ${
                    a.status === "upcoming" ? "border-l-primary" : "border-l-transparent"
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6 relative z-10">
                    <div
                      className={`flex gap-4 items-start ${
                        isAvailable(a.status) ? "" : "opacity-90"
                      }`}
                    >
                      <div className="relative">
                        <img
                          alt={a.doctorName}
                          className={`w-16 h-16 rounded-2xl object-cover shadow-md transition-all ${
                            isAvailable(a.status) ? "" : "grayscale opacity-80"
                          }`}
                          src={a.img}
                        />
                        {a.status === "upcoming" && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3
                            className={`text-lg font-bold ${
                              isAvailable(a.status)
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {a.doctorName}
                          </h3>
                          <span className={`status-badge ${statusBadge(a.status)}`}>
                            {a.status === "upcoming"
                              ? "Upcoming"
                              : a.status === "scheduled"
                              ? "Scheduled"
                              : a.status === "completed"
                              ? "Completed"
                              : "Cancelled"}
                          </span>
                        </div>

                        <p
                          className={`font-medium text-sm ${
                            a.status === "completed"
                              ? "text-slate-500"
                              : "text-primary"
                          }`}
                        >
                          {a.specialty}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          {a.type === "video" ? <Video size={14} /> : <MapPin size={14} />}
                          <span className="ml-1 text-xs text-slate-500">
                            {a.type === "video" ? "Video Consultation" : a.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-start md:items-end gap-3 md:border-l md:border-slate-100 dark:md:border-slate-700 md:pl-6">
                      <div className="sm:hidden mb-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatSmallDate(a.dateISO)}
                        </span>
                      </div>

                      {a.note && (
                        <p className="text-sm text-slate-500 mb-1">{a.note}</p>
                      )}

                      <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {a.status === "upcoming" && (
                          <>
                            <button className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors">
                              Reschedule
                            </button>

                            <button className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                              <Video size={16} />
                              Join Call
                            </button>
                          </>
                        )}

                        {a.status === "scheduled" && (
                          <button className="flex-1 md:flex-none px-5 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-sm transition-all flex items-center justify-center gap-2">
                            <MapPin size={16} />
                            Get Directions
                          </button>
                        )}

                        {a.status === "completed" && (
                          <>
                            <button className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/50 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                              <RefreshCw size={16} />
                              View Prescription
                            </button>

                            <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-primary hover:bg-primary/5 font-medium text-sm transition-colors">
                              Book Again
                            </button>
                          </>
                        )}

                        {a.status === "cancelled" && (
                          <p className="text-xs text-slate-400 italic">
                            {a.note ?? "Cancelled"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-8">
            <button className="text-slate-500 hover:text-primary font-medium text-sm flex items-center gap-2 transition-colors">
              Load More History
              <ChevronDown size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}