import Image from 'next/image';
import { ArrowUpRight, Route } from 'lucide-react';
import { roadTrips } from './experienceData';

export default function RoadTripsSection() {
  return (
    <section id="road-trips" className="scroll-mt-20 bg-[#F1E6D7] px-4 py-14 sm:px-6 lg:px-0 lg:py-18">
      <div className="mx-auto max-w-[90rem] lg:mx-10 2xl:mx-auto">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A45D39]">02 / Odisha by road</p>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold leading-tight text-[#2E2A22] sm:text-4xl lg:text-5xl">
              Take the road <span className="italic font-normal text-[#AD673F]">that stays with you.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#6B645B]">A few ways to connect the places you love. These are route ideas to inspire your own journey, not fixed tours.</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roadTrips.map((trip, index) => (
            <article key={trip.name} className="overflow-hidden rounded-[1.6rem] border border-[#E0D1BE] bg-[#FFF9F2] shadow-lg shadow-[#6D4B35]/5">
              <div className="relative h-48 overflow-hidden sm:h-56">
                <Image src={trip.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover" />
                <span className="absolute left-5 top-5 rounded-full bg-[#FFF9F2]/90 px-3 py-1.5 text-[11px] font-bold text-[#624532] backdrop-blur-sm">{trip.duration}</span>
                <span className="absolute bottom-4 right-5 font-serif text-6xl italic text-white/80" aria-hidden="true">0{index + 1}</span>
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A45D39]">{trip.theme}</p>
                <h3 className="mt-2 font-serif text-xl font-bold text-[#2E2A22]">{trip.name}</h3>
                <p className="mt-2 min-h-10 text-sm leading-6 text-[#6B645B]">{trip.description}</p>
                <div className="mt-4 border-t border-[#E4D8C9] pt-4">
                  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6B1E5B]"><Route className="h-4 w-4" />Route idea</p>
                  <p className="mt-3 text-sm leading-6 text-[#4B4038]">{trip.stops.join('  →  ')}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <a href="https://odishatourism.gov.in/content/tourism/en/plan/trip-organizer/find-a-roadtrip.html" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#6B1E5B] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]">
          Explore official road trip ideas <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
