import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, MapPin, Sparkles } from 'lucide-react';
import TourismHero from './TourismHero';
import DestinationExplorer from './DestinationExplorer';
import DistrictExplorer from './DistrictExplorer';
import TripsSection from './TripsSection';
import CuisineSection from './CuisineSection';
import AdivasiSection from './AdivasiSection';
import CultureSection from './CultureSection';

export default function OdishaTourism() {
  return (
    <div className="overflow-x-hidden bg-[#FFF9F2]">
      <TourismHero />
      <DestinationExplorer />
      <DistrictExplorer />
      <TripsSection />
      <CuisineSection />
      <AdivasiSection />
      <CultureSection />

      <section className="relative isolate overflow-hidden bg-[#DDEAF0] px-4 py-12 text-[#293A42] sm:px-6 sm:py-16 lg:px-8 lg:py-18">
        <div className="pointer-events-none absolute -left-32 -top-40 -z-10 h-[480px] w-[480px] rounded-full border-[70px] border-white/25" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-56 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#C4DFE6]/60 blur-3xl" aria-hidden="true" />
        <div className="mx-auto grid max-w-[94rem] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A65F3C] sm:text-xs"><Sparkles className="h-4 w-4" aria-hidden="true" />07 / Your story belongs here</p>
            <h2 className="mt-3 font-serif text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.05em]">
              What does <span className="relative inline-block font-normal italic text-[#A65F3C]">home<svg viewBox="0 0 180 16" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-3 w-full" aria-hidden="true"><path d="M3 10 C50 1 117 2 177 8" fill="none" stroke="#C98F65" strokeWidth="6" strokeLinecap="round" opacity="0.55" /></svg></span> look like to you?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[#5C6D72] sm:text-base sm:leading-8">
              A lane in your hometown. A festival you never miss. A place you would take a friend first. Join Prabasi Odia and help us shape a guide made of real connections.
            </p>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Stories we share">
              {['A favourite place', 'A family tradition', 'A memory of home'].map((idea) => <span key={idea} className="rounded-full border border-[#ADC7CF] bg-white/50 px-3 py-1.5 text-[11px] font-medium text-[#4D666B] sm:text-xs">{idea}</span>)}
            </div>
            <Link href="/join-community" className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#814750] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(102,50,58,0.16)] transition hover:-translate-y-0.5 hover:bg-[#63363F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#814750]">
              <Heart className="h-4 w-4" aria-hidden="true" /> Join the community <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-[530px] px-2 py-3 sm:px-5 sm:py-5">
            <div className="absolute inset-5 rotate-[-5deg] rounded-[1.1rem] bg-[#E9BE96] shadow-[0_18px_40px_rgba(44,68,74,0.1)]" aria-hidden="true" />
            <div className="relative rotate-[2deg] rounded-[1.1rem] bg-[#FFFDF8] p-2.5 shadow-[0_24px_55px_rgba(44,68,74,0.2)] sm:p-3.5 sm:rotate-[3deg]">
              <div className="relative aspect-[1.65] overflow-hidden rounded-[0.7rem] bg-[#DAB891]">
                <Image src="/tourism/puri.webp" alt="Sunrise over Puri beach" fill sizes="(max-width: 1023px) 100vw, 45vw" className="object-cover" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-[#263B42]/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Puri, Odisha</span>
              </div>
              <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-4 sm:px-3 sm:pt-5">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#AA7253]">A postcard from home</p><p className="mt-1 font-serif text-lg italic leading-snug text-[#4F4140] sm:text-xl">Every memory begins somewhere.</p></div>
                <span className="grid h-13 w-13 shrink-0 place-items-center rounded-full border-2 border-dashed border-[#BD8D75] text-center text-[9px] font-bold uppercase leading-tight tracking-[0.08em] text-[#A87359] sm:h-16 sm:w-16">Odisha<br />07</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
