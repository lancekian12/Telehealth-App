import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100">
      <div className="text-center max-w-xl space-y-6">
        <style>{`
          .blob-shape {
            border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
            animation: blob 6s infinite ease-in-out;
          }

          @keyframes blob {
            0%, 100% {
              border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
            }
            50% {
              border-radius: 58% 42% 30% 70% / 55% 55% 45% 45%;
            }
          }
        `}</style>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold tracking-wide bg-[#008081]/10 text-[#008081]">
          <Loader2 className="w-4 h-4 animate-spin" />
          LOADING
        </div>


        <h1 className="text-[#008081] text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-none">
          Please wait...
        </h1>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold">
          Loading your content
        </h2>

        <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400">
          We&apos;re preparing everything for you. This will only take a moment.
        </p>
      </div>
    </div>
  );
}