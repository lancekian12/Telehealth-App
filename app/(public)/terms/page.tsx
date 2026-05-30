import React from "react";
import {
  History,
  CheckCircle,
  Gavel,
} from "lucide-react";

const TermsOfService: React.FC = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
            Terms of Service
          </h1>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <History className="w-5 h-5" />
            <p>Last Updated: October 24, 2024</p>
          </div>
        </div>

        {/* Content */}
        <article className="space-y-12">
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Welcome to AppointCare. By accessing or using our platform, you agree
            to comply with and be bound by the following terms and conditions.
            Please review these terms carefully before using our services.
          </p>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              1. Acceptance of Terms
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              By creating an account or accessing our appointment booking
              services, you acknowledge that you have read, understood, and
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, you must not use our services.
            </p>
            <ul className="space-y-4">
              {[
                "Agreement applies to all visitors, users, and others who access the service.",
                "Your access is conditioned on your acceptance of and compliance with these Terms.",
                "We reserve the right to update these terms at any time with notice to users.",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              2. Description of Services
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              AppointCare provides a digital platform that connects patients
              with healthcare providers for aesthetic and medical
              consultations. Our services include:
            </p>
            <ul className="space-y-4">
              {[
                "Online appointment scheduling and management.",
                "Digital communication tools between patients and providers.",
                "Secure hosting of medical history for consultation purposes.",
                "Payment processing for medical services and consultation fees.",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              3. User Responsibilities
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              As a user of AppointCare, you are responsible for maintaining the
              confidentiality of your account and for all activities that
              occur under your login credentials. You agree to:
            </p>
            <ul className="space-y-4">
              {[
                "Provide accurate, current, and complete information during registration.",
                "Notify us immediately of any unauthorized use of your account.",
                "Use the platform only for lawful purposes in accordance with these Terms.",
                "Refrain from any activity that disrupts or interferes with the service's performance.",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              4. Limitation of Liability
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              AppointCare facilitates connections but is not a medical provider
              itself. To the maximum extent permitted by law, AppointCare shall
              not be liable for:
            </p>
            <ul className="space-y-4">
              {[
                "Any medical advice or treatment provided by third-party healthcare practitioners.",
                "Indirect, incidental, or consequential damages arising from the use of our platform.",
                "Service interruptions or data loss due to technical failures beyond our control.",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Contact Box */}
          <div className="mt-16 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Gavel className="w-6 h-6 text-lime-500" />
              Contact Our Legal Team
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              If you have any questions or concerns regarding these Terms of
              Service or any legal inquiries about our operations, please
              reach out to our legal department.
            </p>
            <a
              href="mailto:legal@appointcare.com"
              className="inline-block mt-4 font-bold text-teal-600 hover:underline"
            >
              legal@appointcare.com
            </a>
          </div>
        </article>
      </div>
    </main>
  );
};

export default TermsOfService;
