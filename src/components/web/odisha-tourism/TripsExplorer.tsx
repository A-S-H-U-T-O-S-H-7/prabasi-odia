'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, Compass, MapPin, Moon, RotateCcw, Sparkles } from 'lucide-react';
import { featuredTrips, planningNote, tripDistricts, trips, tripThemes, type Trip, type TripTheme } from './tripData';

type Duration = 'All lengths' | '2–3 days' | '4–5 days' | '6+ days';
const durations: Duration[] = ['All lengths', '2–3 days', '4–5 days', '6+ days'];
const districtLabel = (name: string) => name === 'Kendujhar' ? 'Keonjhar (Kendujhar)' : name === 'Debagarh' ? 'Deogarh (Debagarh)' : name;

function matchesDuration(trip: Trip, duration: Duration) {
  if (duration === '2–3 days') return trip.days <= 3;
  if (duration === '4–5 days') return trip.days >= 4 && trip.days <= 5;
  if (duration === '6+ days') return trip.days >= 6;
  return true;
}

export default function TripsExplorer() {
  const [theme, setTheme] = useState<TripTheme | 'All journeys'>('All journeys');
  const [duration, setDuration] = useState<Duration>('All lengths');
  const [district, setDistrict] = useState('All districts');
  const filteredTrips = useMemo(() => trips
    .filter((trip) => (theme === 'All journeys' || trip.themes.includes(theme)) && matchesDuration(trip, duration) && (district === 'All districts' || trip.districts.includes(district)))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.id - b.id), [theme, duration, district]);
  const hasFilters = theme !== 'All journeys' || duration !== 'All lengths' || district !== 'All districts';

  useEffect(() => {
    const anchor = window.location.hash.slice(1);
    if (!/^trip-\d+$/.test(anchor)) return;
    const frame = window.requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function clearFilters() {
    setTheme('All journeys');
    setDuration('All lengths');
    setDistrict('All districts');
  }

  return (
    <div className="min-h-screen bg-[#F7F2E9] text-[#2B4136]">
      <header className="relative isolate flex min-h-[440px] items-end overflow-hidden bg-[#183C32] text-white sm:min-h-[520px]">
        <div className="absolute inset-0 -z-20 grid grid-cols-3" aria-hidden="true">
          <div className="relative"><Image src="/tourism/puri.webp" alt="" fill priority sizes="33vw" className="object-cover" /></div>
          <div className="relative"><Image src="/tourism/koraput-hills.webp" alt="" fill priority sizes="33vw" className="object-cover" /></div>
          <div className="relative"><Image src="/tourism/similipal.webp" alt="" fill priority sizes="33vw" className="object-cover" /></div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102D25]/95 via-[#102D25]/85 to-[#102D25]/65" />
        <div className="mx-auto w-full max-w-[94rem] px-4 pb-11 pt-24 sm:px-6 sm:pb-14 lg:px-8">
          <Link href="/odisha-tourism#trips" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Explore Odisha</Link>
          <div className="mt-10 max-w-3xl sm:mt-14">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#F3C992]"><Sparkles className="h-4 w-4" aria-hidden="true" /> The journey collection</p>
            <h1 className="mt-3 font-serif text-[clamp(2.7rem,8vw,6rem)] font-bold leading-[1.04] tracking-[-0.055em]">Find a journey <span className="font-normal italic text-[#F2C895]">worth taking.</span></h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-lg sm:leading-8">From pilgrimage and craft towns to quiet coasts and forest stays, choose the Odisha trip that feels like yours.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-semibold sm:mt-10 sm:text-xs">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-2 backdrop-blur-sm">30 suggested journeys</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-2 backdrop-blur-sm">9 ways to explore</span>
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-2 backdrop-blur-sm">2 to 7 days</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[94rem] px-3 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8">
        <div className="grid gap-4 rounded-[1.4rem] border border-[#DFCDB7] bg-[#FFFDF8] p-5 shadow-[0_12px_35px_rgba(64,49,33,0.05)] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-5 sm:p-7">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#E9D1AD] text-[#8E5A35]"><Compass className="h-5 w-5" aria-hidden="true" /></span>
          <div><h2 className="font-serif text-xl font-bold sm:text-2xl">A thoughtful starting point</h2><p className="mt-2 text-sm leading-7 text-[#667266]">{planningNote}</p></div>
        </div>

        <section aria-labelledby="trips-heading" className="mt-11 sm:mt-15">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A75F39]">Browse the collection</p><h2 id="trips-heading" className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Choose your <em className="font-normal text-[#B26D43]">next chapter.</em></h2></div>
            <span className="rounded-full bg-[#E5EAD9] px-3 py-1.5 text-xs font-bold text-[#43604B]">{featuredTrips.length} featured routes</span>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#E4D8C9] bg-white p-4 shadow-[0_16px_32px_rgba(64,49,33,0.05)] sm:p-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84694F]">Explore by interest</p>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter trips by interest">
                {(['All journeys', ...tripThemes] as const).map((option) => (
                  <button key={option} type="button" aria-pressed={theme === option} onClick={() => setTheme(option)} className={`min-h-9 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A75F39] sm:px-4 sm:text-sm ${theme === option ? 'border-[#295B47] bg-[#295B47] text-white' : 'border-[#DED8CA] bg-[#FBF9F3] text-[#556658] hover:border-[#91AC96] hover:bg-[#EFF3E9]'}`}>{option}</button>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-5 border-t border-[#EEE6DA] pt-5 lg:grid-cols-[minmax(0,1fr)_280px_auto] lg:items-end">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#84694F]">How long?</p><div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter trips by duration">{durations.map((option) => <button key={option} type="button" aria-pressed={duration === option} onClick={() => setDuration(option)} className={`min-h-9 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A75F39] sm:px-4 sm:text-sm ${duration === option ? 'border-[#B87747] bg-[#B87747] text-white' : 'border-[#DED8CA] bg-[#FBF9F3] text-[#556658] hover:border-[#C3946A] hover:bg-[#FCF0E2]'}`}>{option}</button>)}</div></div>
              <div><label htmlFor="trip-district" className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#84694F]">District</label><select id="trip-district" value={district} onChange={(event) => setDistrict(event.target.value)} className="mt-3 h-10 w-full cursor-pointer rounded-xl border border-[#DED8CA] bg-[#FBF9F3] px-3 text-sm font-medium text-[#334C3E] outline-none focus-visible:border-[#A75F39]"><option>All districts</option>{tripDistricts.map((name) => <option key={name} value={name}>{districtLabel(name)}</option>)}</select></div>
              {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex min-h-10 cursor-pointer items-center gap-2 self-end text-sm font-semibold text-[#A75F39] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A75F39]"><RotateCcw className="h-4 w-4" aria-hidden="true" /> Clear filters</button>}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm font-medium text-[#657365]">Showing <strong className="text-[#294D3D]">{filteredTrips.length}</strong> of {trips.length} itineraries</p><p className="text-xs text-[#758276]">Featured journeys appear first</p></div>
          {filteredTrips.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          ) : (
            <div className="mt-4 rounded-[1.5rem] border border-dashed border-[#CFC2AE] bg-[#FFFDF8] px-5 py-12 text-center"><h3 className="font-serif text-xl font-bold">No journeys match those filters</h3><p className="mt-2 text-sm text-[#6D796D]">Try another interest, duration or district.</p><button type="button" onClick={clearFilters} className="mt-5 cursor-pointer rounded-full bg-[#295B47] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4435]">Show all journeys</button></div>
          )}
        </section>

        <aside className="mt-14 rounded-[1.6rem] bg-[#244D3E] p-5 text-white sm:p-8">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E7C28D]">Before you set out</p><h2 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">Let the place set the pace.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">For forest and wildlife stays, choose your booked camp and approved entrance before fixing the route. Check current access, local transport and accommodation for every journey.</p></div>
        </aside>
      </main>
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <article id={`trip-${trip.id}`} className="scroll-mt-24 overflow-hidden rounded-[1.45rem] border border-[#E3D8C8] bg-[#FFFCF7] shadow-[0_15px_35px_rgba(51,58,42,0.06)] sm:rounded-[1.7rem]">
      <div className="relative aspect-[1.85] overflow-hidden bg-[#D8E0D1]"><Image src={trip.image} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover" /><span className="absolute inset-0 bg-gradient-to-t from-[#1E382B]/50 via-transparent to-transparent" aria-hidden="true" /><span className="absolute left-4 top-4 rounded-full bg-[#FFFCF7]/95 px-3 py-1.5 text-[11px] font-bold text-[#315947]"><Clock3 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />{trip.days} days / {trip.nights} nights</span>{trip.featured && <span className="absolute bottom-4 left-4 rounded-full bg-[#EFC995] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#304839]">Featured journey</span>}<span className="absolute bottom-2 right-4 font-serif text-5xl italic text-white/85" aria-hidden="true">{String(trip.id).padStart(2, '0')}</span></div>
      <div className="p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#A75F39]">{trip.group}</p>
        <h3 className="mt-2 font-serif text-xl font-bold leading-tight tracking-[-0.025em] sm:text-2xl">{trip.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[#677569]">{trip.teaser}</p>
        <div className="mt-5 border-t border-[#EAE1D5] pt-4">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#A75F39]"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Suggested route</p>
          <p className="mt-2 text-sm leading-6 text-[#3F5849]">{trip.route.map((stop, index) => <span key={`${trip.id}-${index}`}>{index > 0 && <ArrowRight className="mx-1 inline h-3 w-3 text-[#BD865C]" aria-hidden="true" />}{stop}</span>)}</p>
        </div>
        <div className="mt-4 rounded-xl bg-[#EFF1E9] p-3.5"><p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#536E59]"><Moon className="h-3.5 w-3.5" aria-hidden="true" /> Suggested overnight stays</p><p className="mt-1.5 text-sm font-semibold leading-6 text-[#355243]">{trip.stays}</p></div>
        {trip.note && <p className="mt-3 rounded-xl bg-[#FCF0DF] p-3 text-xs leading-5 text-[#84603F]">{trip.note}</p>}
        <p className="mt-4 text-xs text-[#798577]">{trip.districts.map(districtLabel).join(' · ')}</p>
      </div>
    </article>
  );
}
