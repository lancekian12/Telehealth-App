"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Bell, UserRound } from "lucide-react";
import Logout from "../buttons/logout";
import NotificationModal from "./notification-modal";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notification";
import ViewProfileModal from "@/components/modal/ViewProfileModal";

export default function Navigation() {
  const pathname = usePathname();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const desktopNotificationRef = useRef<HTMLDivElement>(null);
  const mobileNotificationRef = useRef<HTMLDivElement>(null);

  const setPatient = useAuthStore((state) => state.setPatient);
  const patient = useAuthStore((state) => state.patient);

  const {
    notifications,
    loading: notificationLoading,
    markAllAsRead,
    markAsRead,
    refreshNotifications,
  } = useRealtimeNotifications({
    role: "patient",
    userId: patient?._id ?? null,
    enabled: true,
  });

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const insideDesktop =
        desktopNotificationRef.current?.contains(target) ?? false;
      const insideMobile =
        mobileNotificationRef.current?.contains(target) ?? false;

      if (!insideDesktop && !insideMobile) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await fetch("/api/patient", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success && data.patient) {
          setPatient(data.patient);
        } else {
          setPatient(null);
        }
      } catch (error) {
        console.log("syncAuth error:", error);
      }
    };

    const handleAuthChange = () => {
      syncAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, [setPatient]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch("/api/patient", {
          cache: "no-store",
          credentials: "include",
        });
        const data = await res.json();

        if (data.success && data.patient) {
          setPatient(data.patient);
        } else {
          setPatient(null);
        }
      } catch (error) {
        console.log("fetchPatient error:", error);
      }
    };

    fetchPatient();
  }, [setPatient]);

  useEffect(() => {
    if (patient?._id) {
      refreshNotifications();
    }
  }, [patient?._id, refreshNotifications]);

  useEffect(() => {
    if (notificationOpen) {
      refreshNotifications();
    }
  }, [notificationOpen, refreshNotifications]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = (href: string) => pathname === href;

  const renderBell = (mobile = false) => (
    <div
      ref={mobile ? mobileNotificationRef : desktopNotificationRef}
      className="relative flex items-center justify-center"
    >
      <button
        type="button"
        onClick={() => setNotificationOpen((prev) => !prev)}
        aria-label="Open notifications"
        aria-expanded={notificationOpen}
        className={[
          "relative flex items-center justify-center rounded-full border bg-white/90 text-[#008081] shadow-sm transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#008081]/50 dark:bg-slate-800/90",
          mobile
            ? "h-11 w-11 border-slate-200 dark:border-slate-700"
            : "h-12 w-12 border-slate-200 dark:border-slate-700",
        ].join(" ")}
      >
        <Bell size={mobile ? 19 : 20} />

        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex min-w-5 items-center justify-center rounded-full bg-[#008081] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationModal
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
        notifications={notifications}
        loading={notificationLoading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-[9999] w-full border-b border-slate-100 backdrop-blur-md transition-colors duration-300 dark:border-slate-800 ${
          scrolled
            ? "bg-background-surface shadow-sm dark:bg-slate-900/90"
            : "bg-white/80 dark:bg-slate-900/80"
        }`}
      >
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-around">
            <Link href="/" className="flex items-center justify-center">
              <span
                className="material-icons text-[#008081]"
                style={{ fontSize: "35px" }}
              >
                eco
              </span>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">
                Appoint<span className="text-[#81B641]">Care</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-10 md:flex">
              {[
                { href: "/", label: "Home" },
                { href: "/finddoctor", label: "Find Doctor" },
                { href: "/appointments", label: "Appointments" },
                { href: "/medicalrecord", label: "Medical Record" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative pb-2 text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? "text-[#008081]"
                      : "text-slate-600 hover:text-[#008081]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-1/2 h-[3px] -translate-x-1/2 rounded-full bg-[#008081] transition-all duration-300 ${
                      isActive(item.href)
                        ? "w-10 opacity-100"
                        : "w-0 opacity-0 group-hover:w-8"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            <div className="hidden items-center space-x-4 md:flex">
              {patient ? (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-px bg-slate-200" />

                  <div className="flex items-center gap-3">
                    {renderBell(false)}

                    <div className="text-right leading-tight">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {patient.fullName}
                      </h3>
                      <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">
                        Patient
                      </p>
                    </div>

                    <div className="relative" ref={profileRef}>
                      <button
                        type="button"
                        onClick={() => setProfileOpen((prev) => !prev)}
                        aria-label="Open profile menu"
                        aria-expanded={profileOpen}
                        className="group relative rounded-full bg-gradient-to-br from-[#008081] via-[#0ea5a4] to-[#81B641] p-[3px] shadow-md transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#008081]/50"
                      >
                        <img
                          src={patient.profilePicture}
                          alt={patient.fullName}
                          className="h-14 w-14 rounded-full bg-white object-cover ring-2 ring-white"
                        />
                        <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </button>

                      {profileOpen && (
                        <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
                          <div className="p-2">
                            {/* <button
                            type="button"
                            onClick={() => setProfileOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008081]/10 text-[#008081]">
                              <UserRound size={18} />
                            </span>
                            View Profile
                          </button> */}

                            <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                            <Logout />

                            <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                            <button
                              type="button"
                              onClick={() => {
                                setProfileOpen(false);
                                setProfileModalOpen(true);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008081]/10 text-[#008081]">
                                <UserRound size={18} />
                              </span>

                              <span>View Profile</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="font-semibold text-slate-600 transition-opacity hover:opacity-80"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full bg-primary px-6 py-2 font-semibold text-white shadow-md transition-all hover:bg-opacity-90"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 md:hidden">
              {patient && renderBell(true)}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                className="rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#008081]"
              >
                <svg
                  className="h-7 w-7 text-slate-700 dark:text-slate-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  {menuOpen ? (
                    <path
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        <ViewProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          patient={patient}
        />
      </header>
    </>
  );
}
