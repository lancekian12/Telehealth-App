import {
  ShieldCheck,
  Calendar,
  BriefcaseMedical,
  Stethoscope,
  Users,
  ChevronRight,
  ChevronDown,
  Search,
  CalendarCheck,
  Video,
  ArrowRight,
  Lock,
  Clock,
  HeartPulse,
} from "lucide-react";
import Image from "next/image";
import girlDoctor from "@/public/images/girl_doctor.png";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const specialties = [
  {
    icon: Stethoscope,
    title: "Primary Care",
    body: "Comprehensive health assessments and routine checkups for adults of all ages.",
    tone: "primary",
  },
  {
    icon: Users,
    title: "Pediatrics",
    body: "Specialized medical care for infants, children, and adolescents in a friendly environment.",
    tone: "secondary",
  },
  {
    icon: BriefcaseMedical,
    title: "Dental Care",
    body: "Advanced dental treatments ranging from preventive cleanings to aesthetic restorations.",
    tone: "primary",
  },
] as const;

const steps = [
  {
    icon: Search,
    title: "Find your doctor",
    body: "Browse verified specialists and filter by specialty, rating, and availability.",
  },
  {
    icon: CalendarCheck,
    title: "Pick a time",
    body: "Choose an open slot that fits your day and confirm in a few taps.",
  },
  {
    icon: Video,
    title: "Consult anywhere",
    body: "Meet in the clinic or join a secure video consultation from home.",
  },
] as const;

const faqs = [
  {
    q: "How do I book an appointment?",
    a: 'Booking an appointment is easy! Click the "Find Doctor" button, select your preferred specialist, choose a time slot, and confirm.',
  },
  {
    q: "What specialties do you offer?",
    a: "We offer Primary Care, Pediatrics, Dental Care, Cardiology, Dermatology, and more. Our network includes 500+ verified specialists.",
  },
  {
    q: "Are online consultations available?",
    a: "Yes — secure tele-health consultations are available so you can speak with a specialist from home.",
  },
  {
    q: "What insurance plans do you accept?",
    a: "We accept most major insurance plans. Verify during booking or contact our support team for details.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background-light text-slate-900 transition-colors duration-300 dark:bg-background-dark dark:text-slate-100">
      <style>{`
        .blob-shape { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary .expand-icon { transform: rotate(180deg); }
      `}</style>

      <main>
        {/* Hero */}
        <section className="relative isolate">
          <div
            aria-hidden="true"
            className="bg-dot-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-32 top-10 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float-slow"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-secondary/15 blur-3xl animate-float"
          />

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-12">
              <div className="stagger space-y-6 text-center sm:space-y-8 lg:text-left">
                <div className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3.5 py-1.5 text-xs font-bold tracking-wide text-primary shadow-sm backdrop-blur sm:text-sm lg:mx-0 dark:bg-slate-800/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <ShieldCheck className="h-4 w-4" />
                  TRUSTED HEALTHCARE PARTNER
                </div>

                <h1 className="text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
                  Your Health,
                  <br />
                  Our <span className="text-gradient-brand">Priority</span>
                </h1>

                <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0 lg:text-xl dark:text-slate-400">
                  Experience world-class healthcare with personalized treatment
                  plans. Book appointments with top specialists in minutes.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
                  <Link
                    href="/finddoctor"
                    className="btn-shine group flex min-h-13 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-[#0a9a8f] px-7 py-3.5 text-base font-bold text-white shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(0,128,129,0.7)] sm:w-auto sm:text-lg"
                    aria-label="Book appointment"
                  >
                    <Calendar className="h-5 w-5" />
                    Book Appointment
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="flex min-h-13 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white/80 px-7 py-3.5 text-base font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary sm:w-auto sm:text-lg dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
                  >
                    How it works
                  </a>
                </div>

                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 lg:justify-start dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
                    Private &amp; secure
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                    Book in minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-primary" aria-hidden="true" />
                    Verified doctors
                  </li>
                </ul>
              </div>

              <div className="relative flex animate-fade-in justify-center px-2 [animation-delay:200ms] sm:px-0 lg:justify-end">
                <div className="blob-shape animate-blob absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 -rotate-12 bg-gradient-to-tr from-secondary/60 to-primary/60 blur-2xl sm:h-[115%] sm:w-[115%]" />
                <div className="blob-shape animate-blob absolute left-1/2 top-1/2 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 rotate-6 bg-gradient-to-br from-primary/10 to-secondary/10 [animation-delay:-5s] sm:h-full sm:w-full" />

                <div className="relative w-full max-w-[340px] sm:max-w-[480px]">
                  <div className="relative aspect-[4/5] w-full animate-float-slow">
                    <div className="blob-shape animate-blob absolute inset-0 translate-x-2 translate-y-2 bg-gradient-to-br from-primary to-secondary opacity-20 sm:translate-x-4 sm:translate-y-4" />

                    <div className="blob-shape animate-blob relative h-full w-full overflow-hidden border-[8px] border-white bg-white shadow-2xl sm:border-[12px] dark:border-slate-800 dark:bg-slate-800">
                      <Image
                        alt="Healthcare professional smiling"
                        src={girlDoctor}
                        className="h-full w-full object-cover object-center"
                        sizes="(min-width: 640px) 480px, 340px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent" />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-2 flex max-w-[85%] animate-float items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 shadow-[var(--shadow-lifted)] backdrop-blur-md [animation-delay:-2s] sm:-bottom-6 sm:-left-6 sm:max-w-none sm:gap-4 sm:p-5 dark:border-slate-700 dark:bg-slate-800/90">
                    <div className="flex h-10 w-10 shrink-0 animate-pulse-ring items-center justify-center rounded-full bg-secondary text-white sm:h-14 sm:w-14">
                      <BriefcaseMedical className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 sm:text-xs dark:text-slate-400">
                        Available
                      </p>
                      <p className="text-sm font-extrabold text-slate-800 sm:text-xl dark:text-white">
                        24/7 Care
                      </p>
                    </div>
                  </div>

                  <div className="absolute -right-1 top-8 hidden animate-float items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[var(--shadow-lifted)] backdrop-blur-md [animation-delay:-4s] sm:flex dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200">
                    <Video className="h-4 w-4 text-primary" aria-hidden="true" />
                    Online consults
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties */}
        <section className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
                Our Specialties
              </h2>
              <h3 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                High-Quality Services for You
              </h3>
              <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
                We provide a wide range of medical services designed to support
                your health at every stage of life.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
              {specialties.map(({ icon: Icon, title, body, tone }, index) => (
                <Reveal key={title} delay={index * 100}>
                  <article className="card-lift group relative h-full overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8 dark:border-slate-700 dark:bg-slate-800">
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${
                        tone === "primary" ? "bg-primary/15" : "bg-secondary/20"
                      }`}
                    />
                    <div
                      className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 sm:mb-6 sm:h-16 sm:w-16 ${
                        tone === "primary"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/15 text-secondary"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                      {title}
                    </h4>
                    <p className="mb-5 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                      {body}
                    </p>
                    <Link
                      className={`inline-flex items-center gap-1 text-sm font-bold transition-all hover:gap-2 sm:text-base ${
                        tone === "primary" ? "text-primary" : "text-secondary"
                      }`}
                      href="/finddoctor"
                    >
                      Find a doctor <ChevronRight className="h-4 w-4" />
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-background-light py-16 sm:py-24 dark:bg-background-dark"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
                How It Works
              </h2>
              <h3 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                Care in three simple steps
              </h3>
            </Reveal>

            <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 md:block"
            />
            <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, body }, index) => (
                <Reveal as="li" key={title} delay={index * 120} className="relative text-center">
                  <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#0a9a8f] text-white shadow-[var(--shadow-glow)]">
                    <Icon className="h-7 w-7" />
                    <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-primary shadow ring-1 ring-primary/15 dark:bg-slate-800">
                      {index + 1}
                    </span>
                  </div>
                  <h4 className="mb-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                    {title}
                  </h4>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                    {body}
                  </p>
                </Reveal>
              ))}
            </ol>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 py-16 sm:py-24 dark:bg-slate-900/50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-8 text-center sm:mb-14">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary sm:text-sm">
                Support Center
              </h2>
              <h3 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl dark:text-white">
                Frequently Asked Questions
              </h3>
              <p className="text-base text-slate-600 sm:text-lg dark:text-slate-400">
                Find answers to common queries about our services and booking
                process.
              </p>
            </Reveal>

            <div className="space-y-3 sm:space-y-4">
              {faqs.map(({ q, a }, index) => (
                <Reveal key={q} delay={index * 70}>
                  <details className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-[box-shadow,border-color] duration-300 open:border-primary/25 open:shadow-[var(--shadow-soft)] dark:border-slate-700 dark:bg-slate-800/60">
                    <summary className="flex min-h-14 list-none items-center justify-between gap-4 p-4 sm:p-6">
                      <h4 className="text-base font-bold text-slate-800 sm:text-lg dark:text-white">
                        {q}
                      </h4>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-open:bg-primary group-open:text-white">
                        <ChevronDown className="expand-icon h-4 w-4 transition-transform duration-300" />
                      </span>
                    </summary>
                    <div className="px-4 pb-5 pt-0 sm:px-6 sm:pb-6">
                      <p className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                        {a}
                      </p>
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-background-light px-4 py-16 sm:px-6 sm:py-24 lg:px-8 dark:bg-background-dark">
          <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#0a8f8a] to-[#4f9a3a] px-6 py-12 text-center text-white shadow-[0_30px_60px_-24px_rgba(0,128,129,0.6)] sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl animate-float-slow"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-2xl animate-float"
            />
            <h3 className="relative mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">
              Ready to feel better?
            </h3>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
              Find a specialist and book your visit today — in the clinic or
              online.
            </p>
            <Link
              href="/finddoctor"
              className="btn-shine group relative mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:text-lg"
            >
              Find a Doctor
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
