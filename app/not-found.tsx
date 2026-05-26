import { ShieldAlert, Home } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
      <div className="text-center max-w-xl space-y-6">
        <style>{`
          .blob-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
        `}</style>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide bg-[#008081]/10 text-[#008081]">
          <ShieldAlert className="w-4 h-4" />
          PAGE NOT FOUND
        </div>

        <h1 className="text-[#008081] text-6xl sm:text-7xl lg:text-8xl font-extrabold leading-none">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
          This page does not exist
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400">
          The page you&apos;re looking for might have been removed, renamed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-lg bg-[#008081] text-white hover:shadow-xl hover:brightness-110 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}