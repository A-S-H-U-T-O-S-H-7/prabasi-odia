"use client";

import { BriefcaseBusiness, Sparkles, Users } from 'lucide-react';

export default function JobHero({ totalJobs, categories, loading = false }: { totalJobs: number; categories: number; loading?: boolean }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#24132f] px-6 py-8 text-white shadow-xl shadow-[#6B1E5B]/10 sm:px-10 md:mb-8 md:py-10 lg:px-10">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#D9772B]/20 blur-3xl" />
      <div className="absolute bottom-[-7rem] left-1/3 h-64 w-64 rounded-full bg-[#8A2E72]/30 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.18em] text-[#F4C875]"><BriefcaseBusiness className="h-4 w-4" /> Community opportunities</div>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">The next good thing can start <span className="text-[#F4C875]">here.</span></h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">Find thoughtful opportunities shared by Prabasi Odia members, from your next role to the co-founder your idea has been waiting for.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"><Users className="mb-5 h-5 w-5 text-[#F4C875]" /><strong className="block text-2xl">{loading ? '-' : totalJobs}</strong><span className="text-xs text-white/60">Open opportunities</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"><Sparkles className="mb-5 h-5 w-5 text-[#F4C875]" /><strong className="block text-2xl">{loading ? '-' : categories}</strong><span className="text-xs text-white/60">Ways to grow</span></div>
        </div>
      </div>
    </section>
  );
}
