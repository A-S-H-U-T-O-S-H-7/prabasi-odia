'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Music2, Palette } from 'lucide-react';
import { placeHref } from './explorerData';
import { craftHighlights, performanceStories } from './cultureData';

export default function CultureSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = performanceStories[activeIndex];

  function move(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + performanceStories.length) % performanceStories.length);
  }

  return (
    <section id="culture" className="relative isolate scroll-mt-20 overflow-hidden bg-[#F2E9DC] px-3 py-10 text-[#322A29] sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute -right-32 -top-52 -z-10 h-[500px] w-[500px] rounded-full border-[70px] border-[#CBAE91]/15" aria-hidden="true" />
      <div className="mx-auto max-w-[94rem]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A45D39] sm:text-xs"><Music2 className="h-4 w-4" aria-hidden="true" />06 / Living culture</p>
            <h2 className="mt-2 max-w-4xl font-serif text-[clamp(2.1rem,5vw,4.2rem)] font-semibold leading-[1.08] tracking-[-0.045em]">
              Our traditions <span className="font-normal italic text-[#AD673F]">move with us.</span>
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-7 text-[#6B5D54] sm:text-base">From a dance floor to an open-air stage, Odisha’s traditions live through the artists and communities who continue to share them.</p>
        </div>

        <div className="mt-7 overflow-hidden rounded-[1.5rem] border border-[#D7BEA9] bg-[#4D2D37] shadow-[0_24px_55px_rgba(65,39,41,0.13)] sm:mt-9 sm:rounded-[2rem] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="relative isolate min-h-[300px] overflow-hidden bg-[#683A3F] sm:min-h-[400px] lg:min-h-[470px]">
            {active.image ? (
              <Image key={active.id} src={active.image} alt="" fill sizes="(max-width: 1023px) 100vw, 55vw" className="-z-20 object-cover" />
            ) : (
              <span
                className="absolute inset-0 -z-20"
                style={{ background: `radial-gradient(circle at 25% 22%, ${active.glow} 0, transparent 35%), linear-gradient(135deg, ${active.background}, #2D2634)` }}
                aria-hidden="true"
              />
            )}
            <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#211720]/85 via-[#211720]/15 to-[#211720]/20" aria-hidden="true" />
            {!active.image && <span className="pointer-events-none absolute -right-14 top-1/2 h-[310px] w-[310px] -translate-y-1/2 rounded-full border-[34px] border-white/10 sm:h-[440px] sm:w-[440px]" aria-hidden="true" />}
            <div className="relative flex min-h-[300px] flex-col justify-between p-5 text-white sm:min-h-[400px] sm:p-7 lg:min-h-[470px] lg:p-9">
              <span className="self-start rounded-full border border-white/45 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">The living stage</span>
              <div>
                {!active.image && <span className="block max-w-full overflow-hidden font-serif text-[clamp(4rem,10vw,8rem)] font-bold leading-none tracking-[-0.08em] text-white/25" aria-hidden="true">{active.visualWord}</span>}
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F4D2AA]"><span className="h-px w-8 bg-[#F4D2AA]" />{active.form}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-5 text-white sm:p-8 lg:p-9 xl:p-11" aria-live="polite">
            <div>
              <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E7B989]">A closer look</span><span className="font-serif text-xl italic text-[#E7B989]">{String(activeIndex + 1).padStart(2, '0')} / {String(performanceStories.length).padStart(2, '0')}</span></div>
              <h3 className="mt-7 max-w-xl font-serif text-[clamp(2rem,3.6vw,3.4rem)] font-normal leading-[1.1] tracking-[-0.045em]">{active.title}</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/90 sm:text-base sm:leading-8">{active.description}</p>
              <p className="mt-3 max-w-lg text-xs leading-6 text-white/65 sm:text-sm sm:leading-7">{active.detail}</p>
              <p className="mt-6 inline-flex items-center gap-2 border-t border-white/20 pt-4 text-xs font-semibold text-[#F1C79B]"><MapPin className="h-4 w-4" aria-hidden="true" />{active.region}</p>
            </div>
            <div className="mt-7 flex items-center justify-between border-t border-white/20 pt-5">
              <span className="text-xs text-white/60">Explore another tradition</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => move(-1)} aria-label="Previous tradition" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-white/35 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /></button>
                <button type="button" onClick={() => move(1)} aria-label="Next tradition" className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-[#EDC392] text-[#3E2930] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6" role="group" aria-label="Choose a performance tradition">
          {performanceStories.map((story, index) => (
            <button key={story.id} type="button" aria-pressed={activeIndex === index} onClick={() => setActiveIndex(index)} className={`min-h-[74px] cursor-pointer rounded-xl border px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3E46] sm:px-4 ${activeIndex === index ? 'border-[#7A3E46] bg-[#7A3E46] text-white shadow-lg shadow-[#7A3E46]/15' : 'border-[#D8C8B6] bg-[#FFF9F1] text-[#483B38] hover:border-[#A45D39] hover:bg-white'}`}>
              <span className={`block text-[10px] font-bold tracking-[0.15em] ${activeIndex === index ? 'text-[#EFC79D]' : 'text-[#AA7456]'}`}>{String(index + 1).padStart(2, '0')}</span>
              <span className="mt-1 block text-xs font-semibold leading-5 sm:text-sm">{story.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-4 border-t border-[#D9C8B7] pt-7 lg:grid-cols-[minmax(190px,0.55fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-5">
          <div className="max-w-md lg:pr-5"><p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A45D39]"><Palette className="h-4 w-4" aria-hidden="true" />Made by hand</p><h3 className="mt-2 font-serif text-2xl font-semibold leading-tight sm:text-3xl">Colour that carries a story.</h3><p className="mt-2 text-xs leading-6 text-[#75665B] sm:text-sm">Alongside the stage, Odisha’s makers keep traditions visible in paint and fabric.</p></div>
          {craftHighlights.map((craft) => (
            <Link key={craft.title} href={placeHref(craft.place)} className="group grid min-h-[165px] grid-cols-[105px_minmax(0,1fr)] overflow-hidden rounded-[1.25rem] border border-[#DDCBB9] bg-[#FFF9F1] shadow-[0_12px_28px_rgba(75,53,43,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(75,53,43,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3E46] sm:grid-cols-[155px_minmax(0,1fr)]">
              <span className="relative min-h-full overflow-hidden"><Image src={craft.image} alt="" fill sizes="(max-width: 639px) 105px, 155px" className="object-cover transition-transform duration-500 group-hover:scale-105" /></span>
              <span className="flex flex-col justify-center p-4 sm:p-5"><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#A45D39]">{craft.place}</span><span className="mt-1 font-serif text-xl font-semibold leading-tight text-[#352D2B] sm:text-2xl">{craft.title}</span><span className="mt-2 text-xs leading-5 text-[#6B6059] sm:text-sm sm:leading-6">{craft.description}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#7A3E46]">Explore the place <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span></span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#D9C8B7] pt-6"><p className="text-sm text-[#6B6059]">Meet the performers who keep Odisha’s traditions moving.</p><Link href="/cultural-teams" className="inline-flex items-center gap-2 rounded-full bg-[#7A3E46] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5D2D37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3E46]">Explore cultural teams <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
    </section>
  );
}
