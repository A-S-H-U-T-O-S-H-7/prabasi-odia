import { BookOpen } from 'lucide-react';

interface MagazineHeroProps {
  issueCount: number;
  loading: boolean;
}

export default function MagazineHero({ issueCount, loading }: MagazineHeroProps) {
  const hasIssues = issueCount > 0;
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#7C3A21] px-4 py-4 text-white shadow-xl shadow-[#7C3A21]/15 sm:px-10 md:py-20">
      {/* Mobile background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/magazine-mob.png')" }}
        aria-hidden="true"
      />
      {/* Desktop background image */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/magazine-desktop2.png')" }}
        aria-hidden="true"
      />
      {/* Light overlay - stronger on left for readability, lighter on right */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#7C3A21]/75 via-[#7C3A21]/40 to-[#7C3A21]/10"
        aria-hidden="true"
      />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#FFE0B2]">
          <BookOpen className="h-4 w-4" />
          Prabasi Odia magazine
        </span>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
          Stories from our community, <span className="text-[#FFE0B2]">one page at a time.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-xs leading-7 text-white/75 md:text-sm">
          A new place to celebrate Odia voices, culture, and the people connecting our community.
        </p>
        <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
          <strong className="block text-2xl">{loading ? '-' : issueCount}</strong>
          <span className="ml-3 self-center text-xs text-white/70">
            {hasIssues ? (issueCount === 1 ? 'Issue to explore' : 'Issues to explore') : 'Issues coming soon'}
          </span>
        </div>
      </div>
    </section>
  );
}
