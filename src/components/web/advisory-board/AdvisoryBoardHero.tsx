import { Users } from 'lucide-react';

interface AdvisoryBoardHeroProps {
  totalMembers: number;
  featuredCount: number;
  loading?: boolean;
}

export default function AdvisoryBoardHero({
  totalMembers,
  featuredCount,
  loading = false,
}: AdvisoryBoardHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#2A1636] px-4 py-4 text-white shadow-xl shadow-[#6B1E5B]/10 sm:px-10 md:py-15">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/advisory-mob.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/advisory-desktop.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#2A1636]/90 via-[#2A1636]/55 to-[#2A1636]/15"
        aria-hidden="true"
      />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#F4C875]">
          <Users className="h-4 w-4" />
          Community guidance
        </span>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
          Patrons, Mentors &amp; <span className="text-[#F4C875]">Advisors</span>
        </h1>
        <p className="mt-3 max-w-2xl text-xs leading-7 text-white/75 md:text-sm">
          Meet the leaders guiding Prabasi Odia with wisdom, experience, and cultural pride.
        </p>

        <div className="mt-4 flex gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
            <strong className="block text-2xl">{loading ? '-' : totalMembers}</strong>
            <span className="text-xs text-white/70">Members</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
            <strong className="block text-2xl">{loading ? '-' : featuredCount}</strong>
            <span className="text-xs text-white/70">Featured</span>
          </div>
        </div>
      </div>
    </section>
  );
}
