'use client';

import { HeartHandshake, ShieldCheck } from 'lucide-react';

export default function UrgentHelpHero({ count }: { count: number }) {
  return <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#4A1F2B] px-6 py-9 text-white shadow-xl shadow-[#4A1F2B]/15 sm:px-10">
    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D9772B]/25 blur-3xl" />
    <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
      <div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#FFD6A5]"><HeartHandshake className="h-4 w-4" /> Community support</span><h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">When help is needed, <span className="text-[#FFD6A5]">we show up.</span></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">Share an urgent need with the Prabasi Odia community. Each request is reviewed before it becomes public.</p></div>
      <div className="flex gap-3"><div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm"><strong className="block text-2xl">{count}</strong><span className="text-xs text-white/70">Open requests</span></div><div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-sm"><ShieldCheck className="mb-2 h-5 w-5 text-[#FFD6A5]" /><span className="text-xs text-white/70">Admin reviewed</span></div></div>
    </div>
  </section>;
}
