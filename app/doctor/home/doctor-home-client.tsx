"use client";

import { useEffect, useState } from "react";
import {
  Layout,
  Calendar,
  Folder,
  Bell,
  Menu,
  CalendarClock,
  Star,
  TrendingUp,
  Video,
  CheckCircle,
  Edit3,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";

export default function DoctorHomeClient() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const d = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentDate(
      d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans">
      <div className="flex h-screen overflow-hidden">
        {/* Main column */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Mobile header */}
          <header className="h-16 md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Layout className="text-primary text-2xl" />
              <span className="text-lg font-bold">
                Appoint<span className="text-secondary">Care</span>
              </span>
            </div>
            <button className="text-slate-500" aria-label="Open menu">
              <Menu />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                    Welcome back, Dr. Santos
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Here is your daily summary for{" "}
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {currentDate}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary transition-all relative shadow-sm"
                    aria-label="Notifications"
                  >
                    <Bell />
                    <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  </button>

                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                    <img
                      alt="Dr. Santos"
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLMcpfukM9AR2v53WlZ5CFQiQgL07gW2spUdlIMGYaIMdnstnxd1N1ivR_Ku9ZiRIA-i4PI-znymA2MafDXjEJd8zkGqiWHD5ZrFzJ4QQE5SgrcB03jFoSI8z5o6lATJIslotdbIazkLbQ3qXfKibnqqhS3zJhHWnm-pU9DPB6ju1abyTsnnqLbEL7wqeJ0oSO7OaxeCSZ_9rGQWIS2_t7jOBauvJ2Qh3Y7sCdKdJzeNPyPgytr-n9i8pHseLzOXas6FLF98TETjM"
                    />
                    <div className="hidden md:block">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Dr. Maria Santos
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Cardiologist
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Metric 1 */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-400">
                            Today&apos;s Appointments
                          </p>
                          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                            12
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <CalendarClock className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="h-10 w-full mb-2 opacity-60">{/* decorative svg */}</div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> +2
                        </span>
                        <span className="text-slate-400">vs yesterday</span>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-400">
                            New Consultations
                          </p>
                          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                            5
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                          <PlusIconFallback />
                        </div>
                      </div>
                      <div className="h-10 w-full mb-2 opacity-60">{/* decorative svg */}</div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          {/* empty on purpose to preserve the original design */}
                        </span>
                        <span className="text-slate-400">vs yesterday</span>
                      </div>
                    </div>

                    {/* Metric 3 */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-400">
                            Average Rating
                          </p>
                          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                            4.9
                          </h3>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-500">
                          <Star className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="h-10 w-full mb-2 opacity-60">{/* decorative svg */}</div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" /> +0.1
                        </span>
                        <span className="text-slate-400">last 30 days</span>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Appointments */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl text-slate-800 dark:text-white">
                        Upcoming Appointments
                      </h3>
                      <a
                        className="text-primary text-sm font-bold hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                        href="#"
                      >
                        View All
                      </a>
                    </div>

                    <div className="space-y-4">
                      {/* Appointment Card 1 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 rounded-l-3xl" />
                        <div className="flex flex-col items-center sm:items-start justify-center min-w-[5rem] text-center sm:text-left pl-2">
                          <span className="text-2xl font-bold text-slate-800 dark:text-white">
                            09:00
                          </span>
                          <span className="text-xs uppercase font-semibold text-slate-400">
                            AM
                          </span>
                        </div>
                        <div className="flex-1 flex items-center gap-4 w-full">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border-2 border-white shadow-sm">
                            JS
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg text-slate-800 dark:text-white">
                                John Smith
                              </h4>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-secondary/10 text-secondary border-secondary/20">
                                <Folder className="w-4 h-4" /> Clinic
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700">
                                General Checkup
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">
                              History: Mild hypertension • Last visit: -
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-semibold hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Check-in
                          </button>
                          <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                            Details
                          </button>
                        </div>
                      </div>

                      {/* Appointment Card (Now) */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-3xl bg-primary/[0.02] ring-2 ring-primary/20 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-3xl" />
                        <div className="flex flex-col items-center sm:items-start justify-center min-w-[5rem] text-center sm:text-left pl-2">
                          <span className="text-2xl font-bold text-primary">
                            10:30
                          </span>
                          <span className="text-xs uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                            Now
                          </span>
                        </div>
                        <div className="flex-1 flex items-center gap-4 w-full">
                          <img
                            alt="Emma W"
                            className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2jbB8JdD-wcip6r4FHscyu19Ht4k7CCHWY53ws3DGWTkZn5MCXA0rU7gQ20JcK8wcLAPihfNEiMfzKFUyMKdy_wz6DkIxIW3fGn3uKQrhIxxE0nOez-GqEHTzKlZQek3_Zv0gZUeM2z_5CgA93gf9BC8ReqPEPkx3fHH79XECtqIq7WnabOQAhjd9IHM2LtRF2ndQdphJuIy6LgGmz6Zu0ygNzllGvK8CrehFuxONC4nyi5zRCzt2is-SnhjtNYPTALfC2z68QHc"
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg text-slate-800 dark:text-white">
                                Emma Wilson
                              </h4>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border bg-primary/10 text-primary border-primary/20">
                                <Video className="w-4 h-4" /> Online
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-red-100 text-red-700">
                                Heart Condition
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">
                              History: Post-surgery recovery • Last visit: 2 weeks ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                            <Video className="w-4 h-4" /> Start Tele-Consult
                          </button>
                        </div>
                      </div>

                      {/* More appointment cards... (kept concise) */}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-4">
                  <div className="bg-gray-100 dark:bg-slate-800/50 rounded-3xl p-6 h-full border border-slate-200 dark:border-slate-700/50 flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-primary to-[#006060] rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5" /> Monthly Availability
                        </h3>
                        <p className="text-white/80 text-xs mb-4">
                          Manage your consultation slots and off-days for the next 30 days.
                        </p>
                        <div className="space-y-3">
                          <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md py-3 rounded-2xl flex items-center justify-center gap-2 transition-all group border border-white/10 text-sm font-bold">
                            <Edit3 className="w-4 h-4" /> Edit Schedule
                          </button>
                          <button className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-secondary/20 transition-all flex items-center justify-center gap-2 group">
                            <CheckCircle className="w-4 h-4" /> Set Busy Periods
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                          Recent Notes
                        </h3>
                        <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700">
                          <MoreHorizontal />
                        </button>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400" />
                              <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                                Michael Chang
                              </p>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md">
                              2h ago
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                            Patient reported mild chest pain after exercise. Recommended EKG and
                            stress test. Scheduled follow-up for next Tuesday.
                          </p>
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">
                                Linda Garcia
                              </p>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md">
                              Yesterday
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                            Prescription renewed for Lisinopril 10mg. Patient monitoring BP at
                            home, stable logs provided via app.
                          </p>
                        </div>
                      </div>

                      <button className="w-full mt-6 py-3 text-sm text-slate-500 hover:text-primary hover:bg-white font-medium transition-all rounded-xl border border-transparent hover:border-slate-200 flex items-center justify-center gap-2">
                        View All Notes <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Small fallback icon component for the "Plus" used earlier.
function PlusIconFallback() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}