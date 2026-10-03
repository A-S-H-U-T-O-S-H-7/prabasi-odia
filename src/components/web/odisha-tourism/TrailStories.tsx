'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Clock3, MapPinned } from 'lucide-react';
import { trails } from './tourismData';

export default function TrailStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTrail = trails[activeIndex];

  const move = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + trails.length) % trails.length);
  };

  return (
    <section id="trails" className="scroll-mt-20 overflow-hidden bg-[#29372E] px-4 py-14 text-white sm:px-6 lg:px-0 lg:py-18">
      <div className="mx-auto max-w-[90rem] lg:mx-10 2xl:mx-auto">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#EAC097]">06 / Themed trails</p>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Follow a story <span className="italic font-normal text-[#EAC097]">of your own.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/70">Three journeys to imagine your next visit. Choose a trail and follow the places along the way.</p>
        </div>

        <div className="mt-7 overflow-hidden rounded-[1.5rem] border border-white/15 bg-[#F7F0E5] text-[#2D2A22] shadow-2xl shadow-black/20 lg:grid lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-[270px] sm:min-h-[340px] lg:min-h-[410px]">
            <Image
              key={activeTrail.image}
              src={activeTrail.image}
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 60vw"
              className="object-cover"
            />
            <span className="absolute bottom-5 left-5 rounded-full border border-white/45 bg-black/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm sm:bottom-7 sm:left-7">
              {String(activeIndex + 1).padStart(2, '0')} / {String(trails.length).padStart(2, '0')}
            </span>
          </div>

          <div className="flex flex-col justify-between p-5 sm:p-7 lg:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A45D39]">{activeTrail.theme}</p>
              <h3 className="mt-3 font-serif text-2xl font-bold leading-tight sm:text-3xl">{activeTrail.name}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#6B645B]">{activeTrail.introduction}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#7F5640]"><Clock3 className="h-4 w-4" />{activeTrail.duration}</p>
              <div className="mt-5 border-t border-[#DED1C2] pt-4">
                <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7F5640]"><MapPinned className="h-4 w-4" />Along the way</p>
                <div className="flex flex-wrap gap-2">
                  {activeTrail.stops.map((stop, index) => (
                    <span key={stop} className="rounded-full border border-[#D9CABC] bg-white/75 px-3 py-1.5 text-xs font-medium text-[#443C33]">
                      <span className="mr-1.5 text-[#B8764E]">{String(index + 1).padStart(2, '0')}</span>{stop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-9 flex items-center justify-between border-t border-[#DED1C2] pt-5">
              <span className="text-xs text-[#8A7E70]">Choose another journey</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => move(-1)} aria-label="Previous trail" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[#CAB7A2] transition hover:bg-[#E6D6C1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"><ArrowLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(1)} aria-label="Next trail" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-[#6B1E5B] text-white transition hover:bg-[#531547] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]"><ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4" role="group" aria-label="Choose a trail">
          {trails.map((trail, index) => (
            <button
              key={trail.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={activeIndex === index}
              className={`group flex cursor-pointer items-center gap-3 rounded-2xl border p-2 text-left transition-colors sm:p-3 ${activeIndex === index ? 'border-[#EAC097] bg-white/15' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}
            >
              <span className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl sm:block lg:h-16 lg:w-20"><Image src={trail.image} alt="" fill sizes="80px" className="object-cover" /></span>
              <span className="min-w-0">
                <span className="block text-[10px] uppercase tracking-widest text-[#EAC097]">Trail 0{index + 1}</span>
                <span className="mt-1 block text-xs font-semibold leading-tight text-white sm:text-sm">{trail.name}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-white/55">These are editorial route ideas, not bookable tours.</p>
      </div>
    </section>
  );
}
