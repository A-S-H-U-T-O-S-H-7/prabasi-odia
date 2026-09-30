import { Images } from 'lucide-react';

interface MediaHeroProps {
  totalItems: number;
  loading?: boolean;
}

export default function MediaHero({ totalItems, loading = false }: MediaHeroProps) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-lg bg-[#064E3B] px-4 py-4 text-white shadow-xl shadow-[#064E3B]/15 sm:px-10 md:py-10">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden"
        style={{ backgroundImage: "url('/media-mob.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
        style={{ backgroundImage: "url('/media-desktop.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#064E3B]/95 via-[#065F46]/50 to-[#047857]/15"
        aria-hidden="true"
      />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-[#A7F3D0]">
          <Images className="h-4 w-4" />
          Community media
        </span>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-4xl">
          Stories and connections, <span className="text-[#A7F3D0]">all in one place.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-xs leading-7 text-white/75 md:text-sm">
          Explore community images, videos and links as they are shared, and find more ways
          to connect with people who share your roots.
        </p>
        <div className="mt-4 flex gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
            <strong className="block text-2xl">{loading ? '-' : totalItems}</strong>
            <span className="text-xs text-white/70">Shared items</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur-sm md:px-5 md:py-3">
            <strong className="block text-2xl">3</strong>
            <span className="text-xs text-white/70">Ways to explore</span>
          </div>
        </div>
      </div>
    </section>
  );
}
