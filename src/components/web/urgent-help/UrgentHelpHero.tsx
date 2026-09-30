'use client';

import { HeartHandshake, ShieldCheck } from 'lucide-react';

export default function UrgentHelpHero({ count }: { count: number }) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#4A1F2B] px-4 py-4 md:py-10 text-white shadow-xl shadow-[#4A1F2B]/15 sm:px-10">
      {/* Mobile background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/urgenthelpmob2.png')" }}
        aria-hidden="true"
      />
      {/* Desktop background image */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/urgenthelp2.png')" }}
        aria-hidden="true"
      />
      {/* Light overlay - stronger on left for text readability, lighter on right */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#4A1F2B]/75 via-[#4A1F2B]/40 to-[#4A1F2B]/10"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#FFD6A5]">
            <HeartHandshake className="h-4 w-4" />
            Community support
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
            When help is needed, <span className="text-[#FFD6A5]">we show up.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-xs md:text-sm leading-7 text-white/75">
            Share an urgent need with the Prabasi Odia community. Each request is reviewed
            before it becomes public.
          </p>

          {/* Stat boxes below subtext, left-aligned */}
          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 md:px-5 py-2 md:py-3 backdrop-blur-sm">
              <strong className="block text-2xl">{count}</strong>
              <span className="text-xs text-white/70">Open requests</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 md:px-5 py-2 md:py-3 backdrop-blur-sm">
              <ShieldCheck className="mb-2 h-5 w-5 text-[#FFD6A5]" />
              <span className="text-xs text-white/70">Admin reviewed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}