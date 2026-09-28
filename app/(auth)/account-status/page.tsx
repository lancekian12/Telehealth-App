"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import { Clock3, ShieldX } from "lucide-react";

function AccountStatus() {
  const params = useSearchParams();
  const rejected = params.get("status") === "rejected";
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  // The session is ended so a pending/rejected doctor is never left logged
  // in; returning to this same URL afterwards shows the message signed out.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void signOut({ redirectUrl: window.location.pathname + window.location.search });
    }
  }, [isLoaded, isSignedIn, signOut]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            rejected ? "bg-rose-50 text-rose-500" : "bg-amber-50 text-amber-500"
          }`}
        >
          {rejected ? <ShieldX size={26} /> : <Clock3 size={26} />}
        </span>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {rejected ? "Application rejected" : "Application under review"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {rejected
            ? "Your doctor application was not approved, so you can't log in as a doctor. Please contact support if you believe this is a mistake."
            : "Your doctor account is still pending approval. You'll be able to log in once an administrator approves your application."}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[#008081] px-6 py-3 text-sm font-bold text-white hover:brightness-110"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}

export default function AccountStatusPage() {
  return (
    <Suspense>
      <AccountStatus />
    </Suspense>
  );
}
