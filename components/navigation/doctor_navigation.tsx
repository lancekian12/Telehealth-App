"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";

import {
  CalendarBlank,
  Bell,
  SignOut,
  FileText,
} from "phosphor-react";

import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";

import { Menu, X, Calendar as CalendarIcon } from "lucide-react";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notification";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
  badge?: number;
  alert?: boolean;
  onClick?: () => void;
};

type DoctorProfile = {
  id?: string;
  _id?: string;
  fullName: string;
  specialization: string;
  profilePicture: string;
};

function NavItem({
  to,
  icon,
  label,
  exact,
  badge,
  alert,
  onClick,
}: NavItemProps) {
  const pathname = usePathname();
  const active = exact ? pathname === to : pathname.startsWith(to);

  const showBadge = typeof badge === "number" && badge > 0;

  return (
    <Link
      href={to}
      onClick={onClick}
      className={[
        "group flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200",
        active || alert
          ? "bg-[#008081]/10 text-[#008081]"
          : "text-slate-600 hover:bg-slate-50 hover:text-[#008081]",
      ].join(" ")}
    >
      <span
        className={[
          "relative h-5 w-5 flex-shrink-0",
          active || alert ? "text-[#008081]" : "",
        ].join(" ")}
      >
        {icon}
        {alert && !active && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#008081] ring-2 ring-white animate-pulse" />
        )}
      </span>

      <span className="truncate flex-1">{label}</span>

      {showBadge && (
        <span className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-[#008081] px-2 py-0.5 text-[11px] font-bold leading-none text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function DoctorNavigation({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  const isConsultationPage = pathname.includes("/consultation");

  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDoctor = async () => {
      try {
        const res = await fetch("/api/doctor", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await res.json();

        if (!mounted) return;

        if (res.ok && data.success && data.doctor) {
          setDoctor(data.doctor);

          const resolvedId =
            String(data.doctor.id || data.doctor._id || "").trim() || null;
          setDoctorId(resolvedId);
        } else {
          setDoctor(null);
          setDoctorId(null);
        }
      } catch (error) {
        console.error("Failed to load doctor profile:", error);
        if (mounted) {
          setDoctor(null);
          setDoctorId(null);
        }
      } finally {
        if (mounted) setLoadingDoctor(false);
      }
    };

    loadDoctor();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const { notifications } = useRealtimeNotifications({
    role: "doctor",
    userId: doctorId,
    enabled: !!doctorId,
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: "/login" });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const displayName = doctor?.fullName || "Doctor";
  const displaySpecialization = doctor?.specialization || "Specialization";
  const profilePicture = doctor?.profilePicture || "";
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "DR";

  const navItems = (
    <>
      <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Main Menu
      </div>

      <NavItem
        to="/doctor/home"
        exact
        icon={<Squares2X2Icon />}
        label="Dashboard"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/doctor/appointments"
        icon={<CalendarBlank weight="fill" size={20} />}
        label="Appointments"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/doctor/schedule"
        icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
        label="Schedule"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/doctor/patientrecords"
        icon={<FileText weight="fill" size={20} />}
        label="Patient Records"
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className="mb-2 px-4 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        System
      </div>

      <NavItem
        to="/doctor/notifications"
        icon={<Bell weight="fill" size={20} />}
        label="Notifications"
        badge={unreadCount}
        alert={unreadCount > 0}
        onClick={() => setMobileMenuOpen(false)}
      />
    </>
  );

  if (isConsultationPage) {
    return <main className="h-screen w-screen overflow-hidden">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-background-light font-sans text-slate-900">
      <aside className="sticky top-0 z-20 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white/90 backdrop-blur-lg md:flex">
        <div className="flex items-center p-8">
          <span
            className="material-icons text-[#008081]"
            style={{ fontSize: "35px" }}
          >
            eco
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-slate-800">
            Appoint<span className="text-secondary">Care</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-auto px-4">{navItems}</nav>

        <div className="border-t border-slate-100 p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
              {profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePicture}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {loadingDoctor ? "Loading..." : displayName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {loadingDoctor ? "Please wait" : displaySpecialization}
              </p>
            </div>

            <button
              type="button"
              aria-label="Sign out"
              onClick={handleSignOut}
              className="rounded-lg p-2 transition-colors hover:bg-white"
            >
              <SignOut
                weight="fill"
                size={20}
                className="text-slate-400 transition-colors hover:text-red-500"
              />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-slate-800">
              Appoint<span className="text-secondary">Care</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/doctor/notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary"
              aria-label="Open notifications"
              title="Notifications"
            >
              <Bell size={20} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#008081] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-slate-950/40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div className="flex items-center gap-2">
                  <span
                    className="material-icons text-[#008081]"
                    style={{ fontSize: "28px" }}
                  >
                    eco
                  </span>
                  <span className="text-lg font-extrabold tracking-tight text-slate-800">
                    Appoint<span className="text-secondary">Care</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="border-b border-slate-100 px-4 py-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
                    {profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profilePicture}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {loadingDoctor ? "Loading..." : displayName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {loadingDoctor ? "Please wait" : displaySpecialization}
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex h-[calc(100%-14rem)] flex-col overflow-y-auto px-4 py-4">
                {navItems}
              </nav>

              <div className="border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <SignOut weight="fill" size={18} className="text-slate-500" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}