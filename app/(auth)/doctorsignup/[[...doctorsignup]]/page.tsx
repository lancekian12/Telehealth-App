import BackButton from "@/components/buttons/backbutton";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

const clerkAppearance = {
  variables: {
    colorPrimary: "#008081",
    colorDanger: "#ef4444",
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <BackButton fallback="/" />

      <div className="mx-auto flex flex-col gap-10 min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-primary flex items-center justify-center">
              <span
                className="material-icons text-[#008081]"
                style={{ fontSize: "50px" }}
              >
                eco
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">
              APPOINT <span className="text-[#81B641]">CARE</span>
            </h1>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-[#008081] mb-2">
              Doctor Registration
            </h2>

            <p className="text-slate-500">
              Join our community for better healthcare access
            </p>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            <div className="h-1.5 w-12 rounded-full bg-[#008081]"></div>

            <div className="h-1.5 w-12 rounded-full bg-[#008081]/15"></div>
          </div>
        </div>

        {/* Clerk Sign Up */}
        <div className="w-full flex justify-center">
          <SignUp
            routing="path"
            path="/doctorsignup"
            signInUrl="/login"
            forceRedirectUrl="/post-login"
            appearance={clerkAppearance}
          />
        </div>
      </div>
    </div>
  );
}
