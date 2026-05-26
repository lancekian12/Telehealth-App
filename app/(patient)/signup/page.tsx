import Link from "next/link";
import { User, Stethoscope } from "lucide-react";
import { JSX } from "react";

export default function SignupPage(): JSX.Element {

  return (
    <div className="bg-background-light text-slate-900 flex flex-col min-h-screen">
      <Link
        href="/"
        className="
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
            inline-flex items-center
          "
      >
        Back
      </Link>

      <main className="flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex flex-col items-center gap-2">
            <div className="text-primary flex items-center justify-center">
              <span
                className="material-icons text-[#008081]"
                style={{ fontSize: "50px" }}
              >
                eco
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              APPOINT <span className="text-[#81B641]">CARE</span>
            </h1>
          </div>

          <div className="mt-6 sm:mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#008081] mb-2">
              Create an Account
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Please select your account type to get started
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          <div className="flex flex-col items-center p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-xl hover:border-[#008081]/20 hover:-translate-y-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full mb-4 sm:mb-6 bg-cyan-50 text-cyan-500">
              <User size={32} className="text-cyan-500" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center">
              Sign up as a Patient
            </h3>

            <p className="text-center text-slate-500 mb-6 sm:mb-8 text-sm leading-relaxed">
              Book appointments, manage your prescriptions, and consult with top
              healthcare professionals online.
            </p>
            <Link
              href="/patientsignup"
              className="text-center w-full bg-[#008081] text-white py-3 rounded-lg sm:py-3.5 font-bold text-base hover:brightness-110 transition-all shadow-sm"
            >
              Select
            </Link>
          </div>

          <div className="flex flex-col items-center p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl transition-all duration-300 hover:shadow-xl hover:border-[#008081]/20 hover:-translate-y-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full mb-4 sm:mb-6 bg-emerald-50 text-emerald-500">
              <Stethoscope size={32} className="text-emerald-500" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3 text-center">
              Sign up as a Doctor
            </h3>

            <p className="text-center text-slate-500 mb-6 sm:mb-8 text-sm leading-relaxed">
              Manage your clinic schedule, connect with patients via
              teleconsultation, and streamline your practice.
            </p>

            <Link
              href="/doctorsignup"
              className="text-center w-full bg-[#008081] text-white py-3 rounded-lg sm:py-3.5 font-bold text-base hover:brightness-110 transition-all shadow-sm"
            >
              Select
            </Link>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 text-center px-2">
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
