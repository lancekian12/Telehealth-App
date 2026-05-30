"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type BackButtonProps = {
  fallback?: string;
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
    <div className="px-4 pt-4 sm:px-0 sm:pt-0 sm:fixed sm:top-6 sm:left-6 sm:z-50">
      <button
        type="button"
        onClick={handleBack}
        className={`
          inline-flex items-center gap-2
          rounded-full border border-slate-200
          bg-white px-3.5 py-2
          text-sm font-semibold text-slate-700
          shadow-sm
          transition-all
          hover:border-[#008081]/40 hover:text-[#008081]
          active:scale-[0.98]
          ${className}
        `}
      >
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>
    </div>
  );
}