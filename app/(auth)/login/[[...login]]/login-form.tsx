"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "#008081",
    colorDanger: "#ef4444",
    colorText: "#0f172a",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0f172a",
    colorTextSecondary: "#64748b",
    borderRadius: "14px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    card: "w-full border-0 bg-transparent p-0 shadow-none",

    headerTitle: "hidden",
    headerSubtitle: "hidden",

    socialButtonsBlockButton:
      "w-full rounded-lg border border-slate-200 bg-white text-slate-700 transition-all hover:bg-slate-50",
    socialButtonsBlockButtonText: "text-sm font-semibold",
    socialButtonsProviderIcon: "text-slate-700",

    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-medium text-slate-400",

    formFieldLabel: "text-sm font-semibold text-slate-700",
    formFieldInput:
      "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#008081] focus:ring-1 focus:ring-[#008081]",

    formButtonPrimary:
      "w-full rounded-lg bg-[#008081] py-3.5 text-base font-bold text-white shadow-sm transition-all hover:brightness-110",

    formFieldInputShowPasswordButton: "text-slate-500 hover:text-[#008081]",

    footer: "hidden",
    footerAction: "hidden",
    footerActionText: "hidden",

    identityPreviewText: "text-slate-600",
    identityPreviewEditButton: "text-[#008081] hover:text-[#006b6d]",
  },
  options: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
    showOptionalFields: false,
    elevation: "flush",
  },
} as const;

export default function LoginForm() {
  return (
    <section className="mx-auto w-full max-w-[92vw] sm:max-w-md px-0 sm:px-0">
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mb-6 sm:mb-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Log In
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 px-2 sm:px-0">
            Please complete the following details to proceed
          </p>
        </div>

        <div className="w-full overflow-hidden">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            withSignUp={true}
            forceRedirectUrl="/post-login"
            signUpForceRedirectUrl="/post-login"
            appearance={clerkAppearance}
          />
        </div>

        <div className="mt-5 sm:mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#008081] hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </section>
  );
}