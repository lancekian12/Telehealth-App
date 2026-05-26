"use client";

import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  error: Error;
};

export default function error({ error }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="text-center max-w-xl space-y-6">
        <style>{`
          .blob-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
        `}</style>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide bg-red-500/10 text-red-500">
          <ShieldAlert className="w-4 h-4" />
          SERVER ERROR
        </div>

        <h1 className="text-red-500 text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-none">
          500
        </h1>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
          Something went wrong
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400">
          {error.message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-lg bg-red-500 text-white hover:shadow-xl hover:brightness-110 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
