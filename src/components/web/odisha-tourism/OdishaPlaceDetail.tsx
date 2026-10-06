import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, CarFront, Compass, ExternalLink,
  MapPin, Plane, Sparkles, TrainFront,
} from 'lucide-react';
import { detailedPlaces, type DetailedPlace } from './placeDetails';
import { placeHref } from './explorerData';

export default function OdishaPlaceDetail({ place }: { place: DetailedPlace }) {
  const related = detailedPlaces.filter((entry) => entry.category === place.category && entry.slug !== place.slug).slice(0, 3);
  const isFood = place.category === 'cuisine';
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(place.mapQuery)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapQuery)}`;

  return (
    <div className="overflow-hidden bg-[#F8F4EC] text-[#263B34]">
      <header className="relative isolate flex min-h-[430px] items-end overflow-hidden bg-[#18392F] sm:min-h-[520px] lg:min-h-[590px]">
        <Image src={place.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#102820] via-[#102820]/55 to-[#102820]/15" />
        <div className="mx-auto w-full max-w-[88rem] px-4 pb-10 pt-24 text-white sm:px-6 sm:pb-14 lg:px-8 lg:pb-18">
          <Link href="/odisha-tourism#places" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Explore Odisha
          </Link>
          <div className="mt-14 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] sm:mt-20 sm:text-xs">
            <span className="rounded-full bg-[#EEC996] px-3 py-1.5 text-[#263B34]">{place.categoryLabel}</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-black/20 px-3 py-1.5 backdrop-blur-md"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{place.location}</span>
          </div>
          <h1 className="mt-4 max-w-4xl font-serif text-[clamp(2.65rem,10vw,6.5rem)] font-bold leading-[1.04] tracking-[-0.055em]">{place.name}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-lg sm:leading-8">{place.description}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[88rem] px-4 pb-16 pt-9 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#61776C] sm:mb-11">
          <Link href="/odisha-tourism" className="hover:text-[#AE6234] hover:underline">Explore Odisha</Link><span aria-hidden="true">/</span>
          <Link href="/odisha-tourism#places" className="hover:text-[#AE6234] hover:underline">Uniquely Odisha</Link><span aria-hidden="true">/</span>
          <span className="font-semibold text-[#263B34]">{place.name}</span>
        </nav>

        <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_365px]">
          <div className="min-w-0">
            <section aria-labelledby="story-heading">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B46A3C]">01 / The story</p>
              <h2 id="story-heading" className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">A closer look at <em className="font-normal text-[#A75C35]">{place.name}</em></h2>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[#4F6258] sm:text-lg sm:leading-9">{place.story}</p>
            </section>

            <section aria-labelledby="things-heading" className="mt-11 sm:mt-16">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B46A3C]">02 / Make it yours</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <h2 id="things-heading" className="font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Things to do</h2>
                <span className="text-sm text-[#718078]">Three ways to explore</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {place.activities.map((activity, index) => (
                  <div key={activity} className="relative min-h-44 overflow-hidden rounded-[1.4rem] border border-[#E7DED0] bg-white p-5 shadow-[0_12px_30px_rgba(36,55,44,0.04)] sm:p-6">
                    <span className="font-serif text-3xl italic text-[#C78A57]">0{index + 1}</span>
                    <p className="mt-7 max-w-[18rem] font-serif text-lg font-bold leading-snug text-[#263B34] sm:text-xl">{activity}</p>
                    <span aria-hidden="true" className="absolute -bottom-9 -right-8 h-28 w-28 rounded-full border-[18px] border-[#EACDA8]/30" />
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="core-heading" className="relative isolate mt-9 overflow-hidden rounded-[1.65rem] bg-[#214B3F] p-6 text-white sm:mt-12 sm:p-9">
              <span aria-hidden="true" className="absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full border-[36px] border-white/[0.06]" />
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EEC996] text-[#264437]"><Sparkles className="h-5 w-5" aria-hidden="true" /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#EEC996]">The core experience</p>
                  <h2 id="core-heading" className="mt-2 font-serif text-2xl font-bold tracking-[-0.03em] sm:text-3xl">What stays with you</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">{place.core}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-[1.6rem] border border-[#E5D9C9] bg-[#FFFDF8] p-5 shadow-[0_20px_45px_rgba(52,69,52,0.07)] sm:p-7 lg:sticky lg:top-24" aria-label="Key information">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E9F0E5] text-[#326856]"><Compass className="h-5 w-5" aria-hidden="true" /></span>
              <h2 className="font-serif text-2xl font-bold">Good to know</h2>
            </div>
            <dl className="mt-6 divide-y divide-[#EAE3D7] text-sm">
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#68796F]">Experience</dt><dd className="max-w-[60%] text-right font-semibold">{place.categoryLabel}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#68796F]">Region</dt><dd className="max-w-[60%] text-right font-semibold">{place.location}</dd></div>
              <div className="flex justify-between gap-3 py-3"><dt className="text-[#68796F]">Starting point</dt><dd className="max-w-[60%] text-right font-semibold">{place.destination}</dd></div>
            </dl>
            <p className="mt-5 rounded-xl bg-[#F7F0E3] p-4 text-xs leading-6 text-[#5C6C5F]">{place.travelNote}</p>
            <a href={place.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#A65A2A] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A65A2A]">
              Official Odisha Tourism guide <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </aside>
        </div>

        <section aria-labelledby="attractions-heading" className="mt-16 sm:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B46A3C]">03 / Keep exploring</p><h2 id="attractions-heading" className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Top attractions <span className="font-normal italic text-[#A75C35]">& experiences</span></h2></div>
            <Link href="/odisha-tourism#places" className="inline-flex items-center gap-2 text-sm font-bold text-[#A65A2A] hover:underline">View all places <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={placeHref(item.name)} className="group overflow-hidden rounded-[1.4rem] bg-white shadow-[0_14px_35px_rgba(34,52,39,0.08)] transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(34,52,39,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A65A2A]">
                <div className="relative aspect-[1.45] overflow-hidden bg-[#D5DFD4]"><Image src={item.image} alt="" fill sizes="(max-width: 639px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="flex items-start justify-between gap-3 p-4 sm:p-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A65A2A]">{item.location}</p><h3 className="mt-1 font-serif text-xl font-bold leading-tight">{item.name}</h3></div><ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#A65A2A]" aria-hidden="true" /></div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="journey-heading" className="mt-16 sm:mt-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B46A3C]">04 / Plan the journey</p>
          <h2 id="journey-heading" className="mt-2 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Map & how to reach</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#607368] sm:text-base">{isFood ? 'Explore the suggested starting area, then find a local place to enjoy this food.' : 'Use the map to orient your trip, then choose the route that works for you.'}</p>
          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[1.5rem] border border-[#E5D9C9] bg-[#E3E8DD] shadow-[0_14px_35px_rgba(34,52,39,0.07)]">
              <iframe title={`Map of ${place.destination}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[300px] w-full border-0 sm:h-[400px] lg:h-full lg:min-h-[425px]" />
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3 sm:px-5"><span className="inline-flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-[#A65A2A]" aria-hidden="true" />{place.destination}</span><a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#A65A2A] hover:underline">Open map <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a></div>
            </div>
            <div className="grid gap-3">
              {([
                { label: 'By road', text: place.reach.road, Icon: CarFront },
                { label: 'By air', text: place.reach.air, Icon: Plane },
                { label: 'By rail', text: place.reach.rail, Icon: TrainFront },
              ]).map(({ label, text, Icon }) => (
                <div key={label} className="flex gap-4 rounded-[1.25rem] border border-[#E8DED1] bg-white p-4 sm:p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E9F0E5] text-[#326856]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <div><h3 className="font-serif text-lg font-bold">{label}</h3><p className="mt-1 text-sm leading-6 text-[#607368]">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
