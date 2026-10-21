import Link from "next/link";
import { User, Stethoscope } from "lucide-react";
import { JSX } from "react";
import BackButton from "@/components/buttons/backbutton";

export default function SignupPage(): JSX.Element {
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-background-light text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-24 -z-10 h-72 w-72 rounded-full bg-[#008081]/10 blur-3xl animate-float-slow" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-80 w-80 rounded-full bg-[#81B641]/15 blur-3xl animate-float" />
      <BackButton fallback="/" />

      <main className="flex flex-col items-center justify-start sm:justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="flex flex-col items-center gap-2">
            <div className="text-primary flex items-center justify-center">
              <span
                className="material-icons text-[#008081] text-[40px] sm:text-[50px]"
              >
                eco
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-800">
              APPOINT <span className="text-[#81B641]">CARE</span>
            </h1>
          </div>

          <div className="mt-5 sm:mt-6 md:mt-8">
            <h2 className="mb-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Create an Account
            </h2>
            <p className="text-slate-500 text-sm sm:text-base px-2 sm:px-0">
              Please select your account type to get started
            </p>
          </div>
        </div>

        <div className="stagger grid w-full max-w-4xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
          <div className="card-lift group flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-soft)] hover:border-[#008081]/20 sm:p-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#008081]/10 text-[#008081] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:mb-6 md:h-20 md:w-20">
              <User size={32} />
            </div>

            <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center">
              Sign up as a Patient
            </h3>

            <p className="text-center text-slate-500 mb-5 sm:mb-6 md:mb-8 text-sm leading-relaxed">
              Book appointments, manage your prescriptions, and consult with top
              healthcare professionals online.
            </p>

            <Link
              href="/patientsignup"
              className="btn-shine flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#008081] to-[#0a9a8f] py-3 text-center text-base font-bold text-white shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-0.5 sm:py-3.5"
            >
              Select
            </Link>
          </div>

          <div className="card-lift group flex flex-col items-center rounded-3xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-soft)] hover:border-[#008081]/20 sm:p-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#81B641]/15 text-[#5f8f2d] transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 sm:mb-6 md:h-20 md:w-20">
              <Stethoscope size={32} />
            </div>

            <h3 className="text-base sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center">
              Sign up as a Doctor
            </h3>

            <p className="text-center text-slate-500 mb-5 sm:mb-6 md:mb-8 text-sm leading-relaxed">
              Manage your clinic schedule, connect with patients via
              teleconsultation, and streamline your practice.
            </p>

            <Link
              href="/doctorsignup"
              className="btn-shine flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-[#008081] to-[#0a9a8f] py-3 text-center text-base font-bold text-white shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-0.5 sm:py-3.5"
            >
              Select
            </Link>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 text-center px-2">
          <p className="text-sm text-slate-500">
            Already have an account?
            <Link
              href="/login"
              className="text-[#008081] font-bold hover:underline ml-1"
            >
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}