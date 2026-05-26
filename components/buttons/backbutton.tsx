"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallback?: string; // where to go if no history
  className?: string;
};

export default function BackButton({
  fallback = "/",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`
        relative sm:fixed
        sm:top-6 sm:left-6
        mx-4 mt-4 sm:mt-0
        z-50
        rounded-lg border border-slate-200
        bg-white px-4 py-2
        text-sm font-semibold text-slate-600
        shadow-sm
        hover:border-[#008081]/40 hover:text-[#008081]
        transition-all
        ${className}
      `}
    >
      Back
    </button>
  );
}