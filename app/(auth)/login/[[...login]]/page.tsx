import React from "react";
import { Calendar, MessageSquare, Pill } from "lucide-react";
import BackButton from "@/components/buttons/backbutton";
import LoginForm from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter">
      {/* Back button */}
      <Link
        href="/"
        className={`
    relative sm:fixed
    sm:top-6 sm:left-6
    mx-4 mt-4 sm:mt-0
    z-50
    inline-flex rounded-full border border-slate-200
    bg-white/90 px-5 py-2.5 backdrop-blur
    text-sm font-semibold text-slate-600
    shadow-sm
    hover:border-[#008081]/40 hover:text-[#008081]
    transition-all
  `}
      >
        Back
      </Link>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Intro / Brand */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4 text-slate-600">
            WELCOME TO
          </p>

          <div className="flex flex-col items-center gap-2">
            <span
              className="material-icons text-[#008081]"
              style={{ fontSize: "44px" }}
            >
              eco
            </span>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              APPOINT <span className="text-[#81B641]">CARE</span>
            </h1>
          </div>
        </div>

        {/* Feature icons */}
        <div className="stagger mb-10 grid grid-cols-3 gap-3 sm:mb-12 sm:gap-8">
          <div className="flex flex-col items-center p-2 text-center sm:p-4">
            <div className="mb-3 rounded-2xl bg-[#008081]/10 p-3.5 sm:p-4">
              <Calendar className="text-[#008081]" size={28} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Book</h3>
            <p className="text-xs text-slate-500">
              Easily connect with your doctors
            </p>
          </div>

          <div className="flex flex-col items-center p-2 text-center sm:p-4">
            <div className="mb-3 rounded-2xl bg-[#81B641]/15 p-3.5 sm:p-4">
              <MessageSquare
                className="text-[#5f8f2d]"
                size={28}
              />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Consult</h3>
            <p className="text-xs text-slate-500">
              Visit your doctor or consult online
            </p>
          </div>

          <div className="flex flex-col items-center p-2 text-center sm:p-4">
            <div className="mb-3 rounded-2xl bg-[#008081]/10 p-3.5 sm:p-4">
              <Pill className="text-[#008081]" size={28} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Prescription</h3>
            <p className="text-xs text-slate-500">
              You can take your medicine or prescription
            </p>
          </div>
        </div>

        <hr className="border-slate-100 mb-10 sm:mb-12" />

        {/* Login card */}
        <LoginForm />
      </main>
    </div>
  );
}
