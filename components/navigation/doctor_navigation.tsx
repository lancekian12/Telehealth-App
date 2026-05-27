"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarBlank,
  User,
  UsersThree,
  FirstAidKit,
  Bell,
  GearSix,
  SignOut,
} from "phosphor-react";
import { Squares2X2Icon } from "@heroicons/react/24/solid";

type DoctorShellProps = {
  children: ReactNode;
};

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
};

function NavItem({ to, icon, label, exact = false }: NavItemProps) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === to
    : pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      href={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? "bg-white text-primary shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-primary"
      }`}
    >
      <span
        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
          isActive ? "translate-x-[15px]" : ""
        }`}
      >
        {icon}
      </span>

      <span
        className={`truncate transition-transform duration-200 ${
          isActive ? "translate-x-[15px]" : ""
        }`} 
      >
        {label}
      </span>
    </Link>
  );
}

export default function DoctorShell({ children }: DoctorShellProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col h-full py-8 h-screen w-72 rounded-r-4xl bg-[#f3f3f4] shadow-none border-r border-slate-200 z-10 shrink-0">
        <div className="p-8 flex items-center">
          <span
            className="material-icons text-[#008081]"
            style={{ fontSize: "35px" }}
          >
            eco
          </span>

          <span className="text-2xl font-bold text-slate-800">
            Appoint<span className="text-secondary">Care</span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
            Main Menu
          </div>

          <NavItem
            to="/doctor/home"
            icon={<Squares2X2Icon className="w-5 h-5" />}
            label="Dashboard"
            exact
          />

          <NavItem
            to="/admin/appointments"
            icon={<CalendarBlank weight="fill" size={20} />}
            label="Appointments"
          />

          <NavItem
            to="/admin/doctors"
            icon={<User weight="fill" size={20} />}
            label="Doctors"
          />

          <NavItem
            to="/admin/patients"
            icon={<UsersThree weight="fill" size={20} />}
            label="Patients"
          />

          <NavItem
            to="/admin/specialties"
            icon={<FirstAidKit weight="fill" size={20} />}
            label="Specialties"
          />

          <div className="pt-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
            System
          </div>

          <NavItem
            to="/admin/notifications"
            icon={<Bell weight="fill" size={20} />}
            label="Notifications"
          />

          <NavItem
            to="/admin/settings"
            icon={<GearSix weight="fill" size={20} />}
            label="Settings"
          />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
              AD
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">Super Admin</p>
            </div>

            <SignOut
              weight="fill"
              size={20}
              className="text-slate-400 hover:text-red-500 transition-colors"
            />
          </div>
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6 bg-white overflow-y-auto">{children}</main>
    </div>
  );
}
