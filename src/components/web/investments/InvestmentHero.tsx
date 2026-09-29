import { Compass, HandCoins, ShieldCheck, Wallet } from 'lucide-react';

export default function InvestmentHero({ posts, sectors, loading }: { posts: number; sectors: number; loading: boolean }) {
  return <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#244B78] px-6 py-8 text-white shadow-xl shadow-[#244B78]/15 sm:px-10 md:py-10">
    <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#6CB6D9]/30 blur-3xl" />
    <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#91C2EF]/20 blur-3xl" />
    <div className="relative grid gap-9 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#D7EDFF]"><HandCoins className="h-4 w-4" /> Investment network</span>
        <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Good ideas grow with <span className="text-[#D7EDFF]">the right support.</span></h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">Share your investment plans and discover opportunities from verified Prabasi Odia members. Responses stay private with the admin team.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><Wallet className="mb-5 h-5 w-5 text-[#D7EDFF]" /><strong className="block text-2xl">{loading ? '—' : posts}</strong><span className="text-xs text-white/70">Approved posts</span></div>
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"><Compass className="mb-5 h-5 w-5 text-[#D7EDFF]" /><strong className="block text-2xl">{loading ? '—' : sectors}</strong><span className="text-xs text-white/70">Sectors</span></div>
        <p className="col-span-2 flex items-center gap-2 px-1 text-xs text-white/70"><ShieldCheck className="h-4 w-4 shrink-0 text-[#D7EDFF]" /> Every post is reviewed before it appears here.</p>
      </div>
    </div>
  </section>;
}
