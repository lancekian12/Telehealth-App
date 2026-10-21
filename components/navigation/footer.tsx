"use client";

import { useState } from "react";
import Link from "next/link";

type User = {
  name?: string;
  avatarUrl?: string | null;
} | null;

export default function Footer() {
  const [storedUserData] = useState<User>(null);

  return (
    <footer className="relative border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/80 py-10 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#008081]/40 to-transparent"
      />
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <Link href="/" className="flex items-center justify-center gap-2">
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

          <div className="flex flex-col items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 sm:flex-row sm:gap-2">
            <Link
              href="/privacy-policy"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-[#008081]/8 hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-[#008081]/8 hover:text-primary"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="rounded-full px-3 py-1.5 transition-colors hover:bg-[#008081]/8 hover:text-primary"
            >
              Cookies
            </Link>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400 md:text-right">
            {storedUserData ? (
              <div className="space-y-1">
                <div>
                  Signed in as{" "}
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {storedUserData.name}
                  </span>
                </div>
                <div>© {new Date().getFullYear()} AppointCare. All rights reserved.</div>
              </div>
            ) : (
              <div>© {new Date().getFullYear()} AppointCare. All rights reserved.</div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}