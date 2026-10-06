import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock3, MapPin, Route } from 'lucide-react';
import { homeTrips, planningNote, tripHref } from './tripData';

export default function TripsSection() {
  return (
    <section id="trips" className="relative isolate scroll-mt-20 overflow-hidden bg-[#F1E7D8] px-3 py-10 text-[#2D4237] sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute -right-28 -top-40 -z-10 h-[430px] w-[430px] rounded-full border-[62px] border-[#D8B58A]/20" aria-hidden="true" />
      <div className="mx-auto max-w-[94rem]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#AA6138] sm:text-xs sm:tracking-[0.23em]">03 / Journeys through Odisha</p>
            <h2 className="mt-2 max-w-4xl font-serif text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-0.045em]">
              A journey for <span className="font-normal italic text-[#AF653B]">every kind of traveller.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#657065] sm:text-base">Sacred towns, wild forests, quiet beaches and mountain roads. Pick a route that speaks to you, then make it your own.</p>
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-[1.3rem] border border-[#DBCBB7] bg-[#FFF9F0] p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E9D4B8] text-[#8F5534]"><Route className="h-4 w-4" aria-hidden="true" /></span>
          <p className="text-xs leading-6 text-[#5E685E] sm:text-sm sm:leading-7"><strong className="font-semibold text-[#304C3C]">Plan around your arrival.</strong> {planningNote}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {homeTrips.map((trip) => (
            <Link key={trip.id} href={tripHref(trip)} className="group flex min-w-0 flex-col overflow-hidden rounded-[1.45rem] border border-[#E2D5C3] bg-[#FFFCF7] shadow-[0_15px_38px_rgba(66,52,34,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(66,52,34,0.13)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A76641] sm:rounded-[1.7rem]">
              <div className="relative aspect-[1.65] overflow-hidden bg-[#D8DCCE]">
                <Image src={trip.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#14291F]/45 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#FFFCF7]/95 px-3 py-1.5 text-[11px] font-bold text-[#315947] shadow-sm"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{trip.days} days / {trip.nights} nights</span>
                <span className="absolute bottom-3 right-4 font-serif text-5xl italic text-white/80" aria-hidden="true">{String(trip.id).padStart(2, '0')}</span>
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF653B]">{trip.group}</p>
                <h3 className="mt-1.5 font-serif text-xl font-bold leading-tight tracking-[-0.025em] text-[#294339] sm:text-2xl">{trip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#697469]">{trip.teaser}</p>
                <div className="mt-auto pt-5">
                  <p className="flex items-start gap-2 border-t border-[#E8DED0] pt-4 text-xs leading-5 text-[#536658]"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#AB6944]" aria-hidden="true" /><span>{trip.route.slice(0, 3).join(' → ')}{trip.route.length > 3 ? ` + ${trip.route.length - 3} more stops` : ''}</span></p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#A55C37]">See the itinerary <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#697469]">Six ways to start. Thirty journeys to explore.</p>
          <Link href="/odisha-tourism/trips" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#275442] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#193F32] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#275442]">Explore all 30 itineraries <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
