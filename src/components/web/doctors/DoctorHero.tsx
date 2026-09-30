import Link from 'next/link';
import { ArrowRight, CalendarDays, HeartPulse } from 'lucide-react';

export default function DoctorHero() {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#103e56] px-4 py-4 text-white shadow-xl shadow-[#103e56]/15 sm:px-10 md:py-10">
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/doctor-mob.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/doctor-desktop.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#103e56]/90 via-[#103e56]/50 to-[#103e56]/10 md:from-[#103e56]/80 md:via-[#103e56]/35 md:to-transparent"
        aria-hidden="true"
      />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#D7F4EF]">
          <HeartPulse className="h-4 w-4" />
          Community health
        </span>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
          Care starts with the right conversation.
        </h1>
        <p className="mt-3 max-w-2xl text-xs leading-7 text-white/75 md:text-sm">
          Explore doctors in our community and request a chat, phone, or video consultation.
          Our team will confirm the time and share the connection details.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="#find-a-doctor"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#125c68] transition hover:bg-[#e7f6f4] md:px-5 md:py-3 md:text-sm"
          >
            Find a doctor
            <ArrowRight size={16} />
          </a>
          <Link
            href="/doctors/my-consultations"
            className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10 md:px-5 md:py-3 md:text-sm"
          >
            My consultations
            <CalendarDays size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
