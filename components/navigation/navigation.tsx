"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "../buttons/logout";

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (href: string) => pathname === href;
  const activeClass = "text-[#008081] font-bold";
  const desktopClass = (href: string) =>
    `text-slate-600 dark:text-slate-300 hover:text-primary transition-colors ${
      isActive(href) ? activeClass : ""
    }`;

  return (
    <header
      className={`w-full border-b border-slate-100 dark:border-slate-800 fixed top-0 left-0 right-0 z-[9999] backdrop-blur-md transition-colors duration-300 ${
        scrolled ? "bg-white/90 shadow-sm" : "bg-white/80"
      } dark:${scrolled ? "bg-slate-900/90" : "bg-slate-900/80"}`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around items-center h-20">
          <Link href="/" className="flex items-center justify-center">
            <span className="material-icons text-[#008081]" style={{ fontSize: "35px" }}>
              eco
            </span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              Appoint<span className="text-[#81B641]">Care</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 space-x-8">
            <Link href="/" className={desktopClass("/")}>Home</Link>
            <Link href="/finddoctor" className={desktopClass("/finddoctor")}>Find Doctor</Link>
            <Link href="/appointments" className={desktopClass("/appointments")}>Appointments</Link>
            <Link href="/messages" className={desktopClass("/messages")}>Messages</Link>
            <Link href="/contact" className={desktopClass("/contact")}>Contact Us</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signup" className="text-slate-600 font-semibold hover:opacity-80 transition-opacity">
              Sign Up
            </Link>
            <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all shadow-md">
              Login
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008081]"
            >
              <svg className="w-7 h-7 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {menuOpen ? (
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}