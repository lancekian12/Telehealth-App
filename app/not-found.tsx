import { ShieldAlert, Home } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="relative isolate min-h-screen flex items-center justify-center overflow-hidden px-4 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
      <div aria-hidden="true" className="bg-dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#008081]/15 blur-3xl animate-float-slow" />
      <div className="stagger text-center max-w-xl space-y-6">
        <style>{`
          .blob-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
        `}</style>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide bg-[#008081]/10 text-[#008081]">
          <ShieldAlert className="w-4 h-4" />
          PAGE NOT FOUND
        </div>

        <h1 className="text-gradient-brand text-7xl sm:text-8xl lg:text-9xl font-extrabold leading-none">
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
            className="btn-shine flex min-h-13 items-center justify-center gap-2 px-7 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-[#008081] to-[#0a9a8f] text-white shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}