"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  CalendarBlank,
  Bell,
  GearSix,
  SignOut,
  FileText,
  ChatText,
} from "phosphor-react";

import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";

import {
  Menu,
  Calendar as CalendarIcon,
} from "lucide-react";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
};

function NavItem({
  to,
  icon,
  label,
  exact,
}: NavItemProps) {
  const pathname = usePathname();

  const active = exact
    ? pathname === to
    : pathname.startsWith(to);

  return (
    <Link
      href={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
      }`}
    >
      <span className="w-5 h-5 flex-shrink-0">
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>
    </Link>
  );
}

export default function DoctorNavigation({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  const isConsultationPage =
    pathname.includes("/consultation");

  // HIDE NAVBAR + HEADER
  if (isConsultationPage) {
    return (
      <main className="h-screen w-screen overflow-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen flex bg-background-light text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-72 bg-white/90 backdrop-blur-lg border-r border-slate-200 flex-col sticky top-0 h-screen z-20">
        <div className="p-8 flex items-center">
          <span
            className="material-icons text-[#008081]"
            style={{ fontSize: "35px" }}
          >
            eco
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-slate-800">
            Appoint
            <span className="text-secondary">
              Care
            </span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
            Main Menu
          </div>

          <NavItem
            to="/doctor/home"
            exact
            icon={<Squares2X2Icon />}
            label="Dashboard"
          />

          <NavItem
            to="/doctor/appointments"
            icon={
              <CalendarBlank
                weight="fill"
                size={20}
              />
            }
            label="Appointments"
          />

          <NavItem
            to="/doctor/schedule"
            icon={
              <ClipboardDocumentListIcon className="w-5 h-5" />
            }
            label="Schedule"
          />

          <NavItem
            to="/doctor/patientrecords"
            icon={
              <FileText
                weight="fill"
                size={20}
              />
            }
            label="Patient Records"
          />

          <NavItem
            to="/doctor/messages"
            icon={
              <ChatText
                weight="fill"
                size={20}
              />
            }
            label="Messages"
          />

          <div className="pt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
            System
          </div>

          <NavItem
            to="/doctor/notifications"
            icon={
              <Bell
                weight="fill"
                size={20}
              />
            }
            label="Notifications"
          />

          <NavItem
            to="/doctor/settings"
            icon={
              <GearSix
                weight="fill"
                size={20}
              />
            }
            label="Settings"
          />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
              AD
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">
                Admin User
              </p>

              <p className="text-xs text-slate-500 truncate">
                Super Admin
              </p>
            </div>

            <button
              type="button"
              aria-label="Sign out"
            >
              <SignOut
                weight="fill"
                size={20}
                className="text-slate-400 hover:text-red-500 transition-colors"
              />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* MOBILE HEADER */}
        <header className="h-16 md:hidden bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <CalendarIcon
              size={20}
              className="text-primary"
            />

            <span className="text-lg font-extrabold tracking-tight text-slate-800">
              Appoint
              <span className="text-secondary">
                Care
              </span>
            </span>
          </div>

          <button className="text-slate-500 hover:text-primary transition-colors">
            <Menu />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}