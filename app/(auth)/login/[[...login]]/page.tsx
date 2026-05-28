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
    rounded-lg border border-slate-200
    bg-white px-4 py-2
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-indigo-50 p-4 rounded-2xl mb-3">
              <Calendar className="text-indigo-500" size={32} />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Book</h3>
            <p className="text-xs text-slate-500">
              Easily connect with your doctors
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-red-50 p-4 rounded-2xl mb-3">
              <MessageSquare
                className="text-red-400"
                fill="currentColor"
                size={32}
              />
            </div>
            <h3 className="font-bold text-slate-800 mb-1">Consult</h3>
            <p className="text-xs text-slate-500">
              Visit your doctor or consult online
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-cyan-50 p-4 rounded-2xl mb-3">
              <Pill className="text-cyan-400" size={32} />
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
