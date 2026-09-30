"use client";

import { BriefcaseBusiness, Sparkles, Users } from 'lucide-react';

interface JobHeroProps {
  totalJobs: number;
  categories: number;
  loading?: boolean;
}

export default function JobHero({ totalJobs, categories, loading = false }: JobHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#24132f] px-4 py-4 text-white shadow-xl shadow-[#6B1E5B]/10 sm:px-10 md:py-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/job-mob.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/job-desktop.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#24132f]/90 via-[#24132f]/50 to-[#24132f]/10"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#F4C875]">
            <BriefcaseBusiness className="h-4 w-4" />
            Community opportunities
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
            The next good thing can start <span className="text-[#F4C875]">here.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-7 text-white/75 md:text-sm">
            Find thoughtful opportunities shared by Prabasi Odia members, from your next role
            to the co-founder your idea has been waiting for.
          </p>

          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
              {/* <Users className="mb-2 h-5 w-5 text-[#F4C875]" /> */}
              <strong className="block text-2xl">{loading ? '-' : totalJobs}</strong>
              <span className="text-xs text-white/70">Open opportunities</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
              {/* <Sparkles className="mb-2 h-5 w-5 text-[#F4C875]" /> */}
              <strong className="block text-2xl">{loading ? '-' : categories}</strong>
              <span className="text-xs text-white/70">Ways to grow</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
