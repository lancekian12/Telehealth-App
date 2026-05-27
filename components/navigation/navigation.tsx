"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { LogOut, UserRound } from "lucide-react";
import Logout from "../buttons/logout";

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const setPatient = useAuthStore((state) => state.setPatient);
  const patient = useAuthStore((state) => state.patient);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const res = await fetch("/api/patient");
        const data = await res.json();

        if (data.success && data.patient) {
          setPatient(data.patient);
        } else {
          setPatient(null);
        }
      } catch (error) {
        console.log(error);
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
        const res = await fetch("/api/patient");
        const data = await res.json();

        if (data.success && data.patient) {
          setPatient(data.patient);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchPatient();
  }, [setPatient]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`w-full border-b border-slate-100 dark:border-slate-800 fixed top-0 left-0 right-0 z-[9999] backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "bg-white/90 shadow-sm" : "bg-white/80"
      } dark:${scrolled ? "bg-slate-900/90" : "bg-slate-900/80"}`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around items-center h-20">
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

          <nav className="hidden md:flex items-center gap-10">
            {[
              { href: "/", label: "Home" },
              { href: "/finddoctor", label: "Find Doctor" },
              { href: "/appointments", label: "Appointments" },
              { href: "/messages", label: "Messages" },
              { href: "/contact", label: "Contact Us" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative pb-2 text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? "text-[#008081]"
                    : "text-slate-600 hover:text-[#008081]"
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-[3px] rounded-full bg-[#008081] transition-all duration-300 ${
                    isActive(item.href)
                      ? "w-10 opacity-100"
                      : "w-0 opacity-0 group-hover:w-8"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && patient ? (
              <div className="flex items-center gap-4">
                <div className="h-12 w-px bg-slate-200" />

                <div className="flex items-center gap-3">
                  <div className="text-right leading-tight">
                    <h3 className="text-sm font-bold text-slate-800">
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
                      className="group relative rounded-full p-[3px] bg-gradient-to-br from-[#008081] via-[#0ea5a4] to-[#81B641] shadow-md transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#008081]/50"
                    >
                      <img
                        src={patient.profilePicture}
                        alt={patient.fullName}
                        className="w-14 h-14 rounded-full object-cover bg-white ring-2 ring-white"
                      />
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
                        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={patient.profilePicture}
                              alt={patient.fullName}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-[#008081]/20"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                                {patient.fullName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                View your account
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              // put your profile action here
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#008081]/10 text-[#008081]">
                              <UserRound size={18} />
                            </span>
                            View Profile
                          </button>

                          <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />

                          <Logout />
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
                  className="text-slate-600 font-semibold hover:opacity-80 transition-opacity"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all shadow-md"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008081]"
            >
              <svg
                className="w-7 h-7 text-slate-700 dark:text-slate-200"
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
    </header>
  );
}
