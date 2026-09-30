import { HandCoins } from 'lucide-react';

interface InvestmentHeroProps {
  posts: number;
  sectors: number;
  loading: boolean;
}

export default function InvestmentHero({ posts, sectors, loading }: InvestmentHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#244B78] px-4 py-4 text-white shadow-xl shadow-[#244B78]/15 sm:px-10 md:py-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/investment-mob.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/investment-desktop.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#244B78]/95 via-[#244B78]/50 to-[#244B78]/20"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#D7EDFF]">
            <HandCoins className="h-4 w-4" />
            Investment network
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
            Good ideas grow with <span className="text-[#D7EDFF]">the right support.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-xs leading-7 text-white/75 md:text-sm">
            Share your investment plans and discover opportunities from verified Prabasi Odia
            members. Responses stay private with the admin team.
          </p>

          <div className="mt-4 flex gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
              <strong className="block text-2xl">{loading ? '-' : posts}</strong>
              <span className="text-xs text-white/70">Approved posts</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
              <strong className="block text-2xl">{loading ? '-' : sectors}</strong>
              <span className="text-xs text-white/70">Sectors</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
