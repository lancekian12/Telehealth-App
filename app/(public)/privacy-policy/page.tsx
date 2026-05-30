import React from "react";
import {
  History,
  CheckCircle,
  Headset,
} from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <History className="w-5 h-5" />
            <p>Last Updated: January 4, 2026</p>
          </div>
        </div>

        {/* Content */}
        <article className="space-y-12">
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            At AppointCare, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your
            information when you visit our website or use our medical
            appointment booking services. Please read this policy carefully.
          </p>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              1. Information We Collect
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              We collect information that you provide directly to us when you
              register for an account, book an appointment, or contact our
              support team. This may include:
            </p>
            <ul className="space-y-4">
              {[
                "Personal identification information (Name, email address, phone number).",
                "Medical history and health-related data provided during consultation bookings.",
                "Payment information for premium services or consultation fees.",
                "Communication preferences and records of your interactions with us.",
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
              2. How We Use Your Information
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              We use the information we collect to provide, maintain, and
              improve our services, including:
            </p>
            <ul className="space-y-4">
              {[
                "Facilitating appointment bookings with healthcare providers.",
                "Sending appointment reminders and health-related notifications.",
                "Processing payments and preventing fraudulent transactions.",
                "Improving our website performance and user experience through analytics.",
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
              3. Data Security
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We implement industry-standard security measures to protect your
              personal data. Your sensitive medical information is encrypted
              using SSL (Secure Socket Layer) technology and stored in
              HIPAA-compliant servers. However, no method of transmission over
              the internet is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              4. Sharing Your Information
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We do not sell or rent your personal data to third parties. We
              only share information with healthcare providers you have
              specifically booked with, or with trusted service providers who
              assist us in operating our platform, subject to strict
              confidentiality agreements.
            </p>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              5. Your Privacy Rights
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Depending on your location, you may have certain rights regarding
              your personal data, including the right to access, correct, or
              delete the information we hold about you. To exercise these
              rights, please contact our privacy officer at
              privacy@appointcare.com.
            </p>
          </section>

          {/* Contact Box */}
          <div className="mt-16 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Headset className="w-6 h-6 text-lime-500" />
              Contact Our Privacy Team
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              If you have any questions or concerns about this Privacy Policy,
              please reach out to our dedicated support team. We aim to respond
              to all inquiries within 48 business hours.
            </p>
            <a
              href="mailto:privacy@appointcare.com"
              className="inline-block mt-4 font-bold text-teal-600 hover:underline"
            >
              privacy@appointcare.com
            </a>
          </div>
        </article>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
