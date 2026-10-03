import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Compass } from 'lucide-react';

export default function TourismHero() {
  return (
    <section className="relative isolate flex min-h-[640px] items-end overflow-hidden bg-[#21332A] text-white sm:min-h-[700px] lg:min-h-[760px]">
      <Image
        src="/tourism/konark-hero.webp"
        alt="Illustrative view of Konark Sun Temple at sunrise"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#121C1B]/90 via-[#17211D]/55 to-[#1C221B]/10" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#101A18]/75 via-transparent to-[#101A18]/10" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-10 pt-20 sm:px-8 sm:pb-14 lg:px-12 lg:pb-16">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FFD5A1] sm:text-xs">
            <span className="h-px w-10 bg-[#FFD5A1]" />
            Prabasi Odia presents
          </p>
          <h1 className="mt-6 font-serif text-[clamp(3.3rem,8vw,7.5rem)] font-bold leading-[1.02] tracking-[-0.055em]">
            Odisha,
            <span className="block italic font-normal text-[#FFD8AA]">felt deeply.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
            The places we grew up hearing about. The colours, coastlines and craft that stay with us wherever we go. Come a little closer to home.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#places"
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#F4C58B] px-6 text-sm font-bold text-[#352018] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore Odisha
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="#road-trips"
              className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/55 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore road trips
              <Compass className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex items-end justify-between gap-5 border-t border-white/25 pt-5 sm:mt-24">
          <p className="max-w-sm text-xs leading-5 text-white/75 sm:text-sm">
            <span className="mr-3 font-serif text-2xl italic text-[#FFD8AA]">ଓଡ଼ିଶା</span>
            A journey through the land we call home.
          </p>
          <Link href="#places" aria-label="Scroll to places" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/45 transition hover:bg-white/15">
            <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
