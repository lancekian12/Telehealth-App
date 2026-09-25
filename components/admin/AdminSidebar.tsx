"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  SquaresFour,
  CalendarBlank,
  FileText,
  GearSix,
  Hamburger,
  ShieldCheck,
  SignOut,
  Users,
  X,
} from "phosphor-react";
import { Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/modal/ConfirmDialog";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
};

function NavItem({ to, icon, label, onClick }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      href={to}
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all duration-200",
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-primary",
      ].join(" ")}
    >
      <span className="h-5 w-5 shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function AdminSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionState, setSessionState] = useState<
    "checking" | "authorized" | "unauthorized"
  >(isLoginPage ? "authorized" : "checking");
  const [admin, setAdmin] = useState<{ email: string; fullName: string } | null>(
    null,
  );

  useEffect(() => {
    if (isLoginPage) return;

    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/admin/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        if (res.ok && data.success) {
          setAdmin(data.admin);
          setSessionState("authorized");
        } else {
          setSessionState("unauthorized");
          router.replace("/admin/login");
        }
      } catch {
        if (!active) return;
        setSessionState("unauthorized");
        router.replace("/admin/login");
      }
    })();

    return () => {
      active = false;
    };
  }, [isLoginPage, pathname, router]);

  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (sessionState !== "authorized") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader2 size={22} className="animate-spin text-primary" />
      </div>
    );
  }

  const navItems = (
    <>
      <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        Admin
      </div>

      <NavItem
        to="/admin/dashboard"
        icon={<SquaresFour weight="fill" size={20} />}
        label="Dashboard"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/admin/appointments"
        icon={<CalendarBlank weight="fill" size={20} />}
        label="Appointments"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/admin/applications"
        icon={<FileText weight="fill" size={20} />}
        label="Doctor Applications"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/admin/patients"
        icon={<Users weight="fill" size={20} />}
        label="Patient Records"
        onClick={() => setMobileMenuOpen(false)}
      />

      <NavItem
        to="/admin/settings"
        icon={<GearSix weight="fill" size={20} />}
        label="Settings"
        onClick={() => setMobileMenuOpen(false)}
      />
    </>
  );

  return (
    <div className="flex min-h-dvh bg-background-light font-sans text-slate-900">
      <aside className="sticky top-0 z-20 hidden h-dvh w-72 flex-col border-r border-slate-200 bg-white/90 backdrop-blur-lg md:flex">
        <div className="flex items-center gap-2 p-8">
          <span className="material-icons text-primary" style={{ fontSize: "35px" }}>
            eco
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-slate-800">
            Appoint<span className="text-secondary">Care</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-auto px-4">{navItems}</nav>

        <div className="border-t border-slate-100 p-6">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <ShieldCheck weight="fill" size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {admin?.fullName || "Administrator"}
              </p>
              <p className="truncate text-xs text-slate-500">{admin?.email}</p>
            </div>

            <button
              type="button"
              aria-label="Sign out"
              onClick={() => setSignOutConfirmOpen(true)}
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
            <span className="material-icons text-primary" style={{ fontSize: "28px" }}>
              eco
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-800">
              Appoint<span className="text-secondary">Care</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-50 hover:text-primary"
            aria-label="Open menu"
          >
            <Hamburger size={22} />
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-slate-950/40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="absolute right-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <span className="text-lg font-extrabold tracking-tight text-slate-800">
                  Appoint<span className="text-secondary">Care</span>
                </span>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-4 py-4">{navItems}</nav>

              <div className="border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={() => setSignOutConfirmOpen(true)}
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

      <ConfirmDialog
        open={signOutConfirmOpen}
        title="Sign out of the admin dashboard?"
        description="You'll need to sign in again to manage AppointCare."
        confirmLabel="Sign out"
        loading={signingOut}
        onCancel={() => setSignOutConfirmOpen(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
}
