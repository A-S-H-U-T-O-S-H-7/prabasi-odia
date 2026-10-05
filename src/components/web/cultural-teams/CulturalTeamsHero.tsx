'use client';

import { ArrowRight, Music2, Plus } from 'lucide-react';

interface CulturalTeamsHeroProps {
  onRegister: () => void;
}

export default function CulturalTeamsHero({ onRegister }: CulturalTeamsHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#713d55] px-4 py-5 text-white shadow-xl shadow-[#713d55]/15 sm:px-10 md:py-10">
      {/* Mobile background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/cultural-mob.png')" }}
        aria-hidden="true"
      />
      {/* Desktop background image */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/cultural-desktop.png')" }}
        aria-hidden="true"
      />
      {/* Light overlay - stronger on left for readability, lighter on right */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#713d55]/75 via-[#713d55]/40 to-[#713d55]/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-[#a85b54]/35 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#f4d4c8]">
          <Music2 className="h-4 w-4" />
          Culture in motion
        </span>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
          Cultural teams, ready to make moments memorable.
        </h1>
        <p className="mt-3 max-w-2xl text-xs leading-7 text-white/80 md:text-sm">
          Discover performing teams for your next program. Explore their work, send an enquiry,
          and our team will coordinate the introduction.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="#explore-teams"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#713d55] transition hover:bg-[#fff4ef]"
          >
            Explore teams <ArrowRight className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onRegister}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <Plus className="h-4 w-4" /> Register your team
          </button>
        </div>
      </div>
    </section>
  );
}
