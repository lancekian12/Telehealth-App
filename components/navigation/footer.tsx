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
    <footer className="border-t border-slate-100 py-8 dark:border-slate-800 sm:py-12">
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

          <div className="flex flex-col items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 sm:flex-row sm:gap-8">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-primary"
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