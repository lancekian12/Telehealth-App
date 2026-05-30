import React from "react";
import {
  History,
  CheckCircle,
  Cookie,
} from "lucide-react";

const CookiesPolicy: React.FC = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6">
            Cookies Policy
          </h1>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <History className="w-5 h-5" />
            <p>Last Updated: January 4, 2026</p>
          </div>
        </div>

        {/* Content */}
        <article className="space-y-12">
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            This Cookies Policy explains how AppointCare uses cookies and similar
            technologies to recognize you when you visit our website. It
            explains what these technologies are and why we use them, as well
            as your rights to control our use of them.
          </p>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              1. What Are Cookies
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Cookies are small data files that are placed on your computer or
              mobile device when you visit a website. Cookies are widely used
              by website owners in order to make their websites work, or to
              work more efficiently, as well as to provide reporting
              information.
            </p>
            <ul className="space-y-4">
              {[
                "First-party cookies are set by the website owner (AppointCare).",
                "Third-party cookies are set by parties other than the website owner.",
                "Session cookies expire when you close your browser.",
                "Persistent cookies remain on your device for a set period.",
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
              2. How We Use Cookies
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We use first-party and third-party cookies for several reasons.
              Some cookies are required for technical reasons in order for our
              Website to operate, and we refer to these as "essential" or
              "strictly necessary" cookies. Other cookies enable us to track
              and target the interests of our users to enhance the experience
              on our Website.
            </p>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              3. Types of Cookies We Use
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              The specific types of first and third-party cookies served
              through our Website and the purposes they perform are described
              below:
            </p>
            <ul className="space-y-4">
              {[
                {
                  title: "Essential Cookies",
                  text:
                    "These are strictly necessary to provide you with services available through our Website.",
                },
                {
                  title: "Performance and Functionality",
                  text:
                    "Used to enhance the performance and functionality of our Website but are non-essential.",
                },
                {
                  title: "Analytics and Customization",
                  text:
                    "These collect information that is used either in aggregate form to help us understand how our Website is being used.",
                },
                {
                  title: "Advertising Cookies",
                  text:
                    "These are used to make advertising messages more relevant to you and your interests.",
                },
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-lg text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
                  <span>
                    <strong>{item.title}:</strong> {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section */}
          <section>
            <h2 className="text-2xl font-bold text-teal-600 mt-12 mb-6">
              4. Managing Your Cookie Preferences
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              You have the right to decide whether to accept or reject cookies.
              You can exercise your cookie rights by setting your preferences
              in the Cookie Consent Manager. You can also set or amend your web
              browser controls to accept or refuse cookies.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              If you choose to reject cookies, you may still use our website
              though your access to some functionality and areas of our website
              may be restricted. Most advertising networks offer you a way to
              opt out of targeted advertising.
            </p>
          </section>

          {/* Contact Box */}
          <div className="mt-16 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-lime-500" />
              Contact Our Cookie Compliance Team
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              If you have any questions about our use of cookies or other
              technologies, please email us at the address below. We are
              committed to transparency regarding your data and privacy.
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

export default CookiesPolicy;
