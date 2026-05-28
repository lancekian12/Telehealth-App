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
  Plus,
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
    <div className="min-h-screen bg-background-light text-slate-900 font-sans transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <style>{`
        body { font-family: Inter, sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: Manrope, sans-serif; }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 relative flex h-screen flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <Layout className="text-primary" size={22} />
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                Appoint<span className="text-secondary">Care</span>
              </span>
            </div>
            <button className="text-slate-500 transition-colors hover:text-primary" aria-label="Open menu">
              <Menu />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-primary">
                    Today&apos;s Overview
                  </p>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    Welcome back,
                    <span className="text-primary"> Dr. Santos</span>
                  </h1>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
                    Here is your daily summary for{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {currentDate}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    className="relative flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-slate-800" />
                  </button>

                  <div className="flex items-center gap-3 border-l border-slate-200 pl-4 dark:border-slate-700">
                    <img
                      alt="Dr. Santos"
                      className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLMcpfukM9AR2v53WlZ5CFQiQgL07gW2spUdlIMGYaIMdnstnxd1N1ivR_Ku9ZiRIA-i4PI-znymA2MafDXjEJd8zkGqiWHD5ZrFzJ4QQE5SgrcB03jFoSI8z5o6lATJIslotdbIazkLbQ3qXfKibnqqhS3zJhHWnm-pU9DPB6ju1abyTsnnqLbEL7wqeJ0oSO7OaxeCSZ_9rGQWIS2_t7jOBauvJ2Qh3Y7sCdKdJzeNPyPgytr-n9i8pHseLzOXas6FLF98TETjM"
                    />
                    <div className="hidden md:block">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Dr. Maria Santos
                      </p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Cardiologist
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="space-y-8 lg:col-span-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-400">
                            Today&apos;s Appointments
                          </p>
                          <h3 className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                            12
                          </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <CalendarClock className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mb-2 h-10 w-full opacity-60" />
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/10 px-2 py-0.5 text-secondary">
                          <TrendingUp className="h-4 w-4" />
                          +2
                        </span>
                        <span className="text-slate-400">vs yesterday</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-400">
                            New Consultations
                          </p>
                          <h3 className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                            5
                          </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                          <Plus className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mb-2 h-10 w-full opacity-60" />
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-primary">
                          <TrendingUp className="h-4 w-4" />
                          +1
                        </span>
                        <span className="text-slate-400">vs yesterday</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-400">
                            Average Rating
                          </p>
                          <h3 className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">
                            4.9
                          </h3>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-500">
                          <Star className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mb-2 h-10 w-full opacity-60" />
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-secondary/10 px-2 py-0.5 text-secondary">
                          <TrendingUp className="h-4 w-4" />
                          +0.1
                        </span>
                        <span className="text-slate-400">last 30 days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Upcoming Appointments
                      </h3>
                      <a
                        className="rounded-lg px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                        href="#"
                      >
                        View All
                      </a>
                    </div>

                    <div className="space-y-4">
                      <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center">
                        <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l-3xl bg-slate-200" />
                        <div className="min-w-[5rem] pl-2 text-center sm:text-left">
                          <span className="block text-2xl font-bold text-slate-800 dark:text-white">
                            09:00
                          </span>
                          <span className="text-xs font-semibold uppercase text-slate-400">
                            AM
                          </span>
                        </div>

                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-lg font-bold text-slate-600 shadow-sm">
                            JS
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                John Smith
                              </h4>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-secondary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary">
                                <Folder className="h-4 w-4" />
                                Clinic
                              </span>
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                                General Checkup
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              History: Mild hypertension • Last visit: -
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-secondary/20 transition-all hover:bg-secondary/90">
                            <CheckCircle className="h-4 w-4" />
                            Check-in
                          </button>
                          <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                            Details
                          </button>
                        </div>
                      </div>

                      <div className="relative flex flex-col gap-4 rounded-3xl border border-slate-100 bg-primary/[0.02] p-5 ring-2 ring-primary/20 dark:border-slate-700 sm:flex-row sm:items-center">
                        <div className="absolute bottom-0 left-0 top-0 w-1.5 rounded-l-3xl bg-primary" />
                        <div className="min-w-[5rem] pl-2 text-center sm:text-left">
                          <span className="block text-2xl font-bold text-primary">
                            10:30
                          </span>
                          <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold uppercase text-primary">
                            Now
                          </span>
                        </div>

                        <div className="flex flex-1 items-center gap-4">
                          <img
                            alt="Emma W"
                            className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2jbB8JdD-wcip6r4FHscyu19Ht4k7CCHWY53ws3DGWTkZn5MCXA0rU7gQ20JcK8wcLAPihfNEiMfzKFUyMKdy_wz6DkIxIW3fGn3uKQrhIxxE0nOez-GqEHTzKlZQek3_Zv0gZUeM2z_5CgA93gf9BC8ReqPEPkx3fHH79XECtqIq7WnabOQAhjd9IHM2LtRF2ndQdphJuIy6LgGmz6Zu0ygNzllGvK8CrehFuxONC4nyi5zRCzt2is-SnhjtNYPTALfC2z68QHc"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold text-slate-800 dark:text-white">
                                Emma Wilson
                              </h4>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                                <Video className="h-4 w-4" />
                                Online
                              </span>
                              <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                                Heart Condition
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              History: Post-surgery recovery • Last visit: 2 weeks ago
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110">
                            <Video className="h-4 w-4" />
                            Start Tele-Consult
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="flex h-full flex-col gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700/50 dark:bg-slate-800/50">
                    <div className="rounded-3xl bg-gradient-to-br from-primary to-[#006060] p-6 text-white shadow-xl shadow-primary/20">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <Calendar className="h-5 w-5" />
                        Monthly Availability
                      </h3>
                      <p className="mb-4 text-xs text-white/80">
                        Manage your consultation slots and off-days for the next 30 days.
                      </p>
                      <div className="space-y-3">
                        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 py-3 text-sm font-bold backdrop-blur-md transition-all hover:bg-white/20">
                          <Edit3 className="h-4 w-4" />
                          Edit Schedule
                        </button>
                        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:bg-secondary/90">
                          <CheckCircle className="h-4 w-4" />
                          Set Busy Periods
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="mb-4 flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                          Recent Notes
                        </h3>
                        <button className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white hover:text-primary dark:hover:bg-slate-700">
                          <MoreHorizontal />
                        </button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-400" />
                              <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-white">
                                Michael Chang
                              </p>
                            </div>
                            <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-400 dark:bg-slate-700">
                              2h ago
                            </span>
                          </div>
                          <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                            Patient reported mild chest pain after exercise. Recommended EKG and stress test.
                            Scheduled follow-up for next Tuesday.
                          </p>
                        </div>

                        <div className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-400" />
                              <p className="text-sm font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-white">
                                Linda Garcia
                              </p>
                            </div>
                            <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-400 dark:bg-slate-700">
                              Yesterday
                            </span>
                          </div>
                          <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                            Prescription renewed for Lisinopril 10mg. Patient monitoring BP at home, stable logs
                            provided via app.
                          </p>
                        </div>
                      </div>

                      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-transparent py-3 text-sm font-medium text-slate-500 transition-all hover:border-slate-200 hover:bg-white hover:text-primary dark:hover:bg-slate-700">
                        View All Notes
                        <ArrowRight className="h-4 w-4" />
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