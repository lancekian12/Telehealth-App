"use client";

import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";

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
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#008081]/10 text-[#008081]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Log In</h2>
          <p className="mt-2 text-sm text-slate-500">
            Please complete the following details to proceed
          </p>
        </div>

        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/sign-up"
          appearance={clerkAppearance}
        />

        <div className="mt-8 space-y-3 text-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-[#008081] hover:underline"
            >
              Sign Up
            </Link>
          </p>

          <Link
            href="/forgot-password"
            className="text-xs text-slate-400 hover:text-[#008081]"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </section>
  );
}