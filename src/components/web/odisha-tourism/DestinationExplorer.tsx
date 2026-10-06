'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Leaf,
  MapPin,
  Mountain,
  Palette,
  Sparkles,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';
import { explorerTabs, placeHref, type ExplorerItem } from './explorerData';

const tabIcons = {
  sacred: Sparkles,
  nature: Leaf,
  beaches: Waves,
  landscapes: Mountain,
  heritage: Palette,
  cuisine: UtensilsCrossed,
};

const categoryNotes: Record<string, string> = {
  sacred: 'Stories of faith written into Odisha’s temples and towns.',
  nature: 'Wild places, quiet trails and life among the trees.',
  beaches: 'Follow the coast from lively shores to slower escapes.',
  landscapes: 'Water, hills and wide-open views worth the journey.',
  heritage: 'Meet the craft, colour and history made here.',
  cuisine: 'Flavours that make every journey feel closer to home.',
};

function PlaceCard({ item, index, featured }: { item: ExplorerItem; index: number; featured?: boolean }) {
  return (
    <Link
      href={placeHref(item.name)}
      aria-label={`Explore ${item.name}`}
      className={`group relative isolate flex flex-col justify-between overflow-hidden rounded-[1.25rem] bg-[#23352C] text-white shadow-[0_18px_42px_rgba(31,48,38,0.15)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(31,48,38,0.22)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D77736] sm:rounded-[1.6rem] ${featured ? 'min-h-[320px] min-[360px]:col-span-2 sm:min-h-[380px] lg:col-span-1 lg:row-span-2 lg:min-h-[560px]' : 'min-h-[190px] sm:min-h-[230px] lg:min-h-[270px]'}`}
    >
      <Image
        src={item.image}
        alt=""
        fill
        sizes={featured ? '(max-width: 1023px) 100vw, 35vw' : '(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 22vw'}
        className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101C18]/95 via-[#15271F]/20 to-[#13241D]/25" aria-hidden="true" />
      <div className={`flex items-start justify-between gap-2 ${featured ? 'p-4 sm:p-6' : 'p-3 sm:p-4'}`}>
        <span className="rounded-full border border-white/35 bg-black/20 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] backdrop-blur-sm sm:px-3 sm:text-[11px]">
          {String(index + 1).padStart(2, '0')} / 05
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/50 bg-white/15 backdrop-blur-sm transition group-hover:bg-[#F4C58B] group-hover:text-[#263B34] sm:h-9 sm:w-9" aria-hidden="true">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className={featured ? 'p-4 pt-8 sm:p-6 sm:pt-12' : 'p-3 pt-6 sm:p-4 sm:pt-8'}>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#FFD9A8] sm:gap-1.5 sm:text-[11px]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />{item.location}
        </span>
        <h3 className={`mt-1.5 font-serif font-bold leading-tight sm:mt-2 ${featured ? 'text-[clamp(1.85rem,7vw,2.5rem)] lg:text-[clamp(2rem,3vw,3.2rem)]' : 'text-base sm:text-xl xl:text-2xl'}`}>{item.name}</h3>
        <p className={`mt-1.5 max-w-md leading-5 text-white/85 sm:mt-2 sm:leading-6 ${featured ? 'text-xs sm:text-sm' : 'hidden text-xs sm:line-clamp-2 lg:text-sm'}`}>{item.description}</p>
      </div>
    </Link>
  );
}

export default function DestinationExplorer() {
  const [activeId, setActiveId] = useState(explorerTabs[0].id);
  const activeIndex = explorerTabs.findIndex((tab) => tab.id === activeId);
  const activeTab = explorerTabs[activeIndex] ?? explorerTabs[0];

  return (
    <section id="places" className="relative isolate scroll-mt-20 overflow-hidden bg-[#F8F3EA] px-3 py-10 sm:px-3 sm:py-10 lg:px-4 lg:py-12">
      <div className="absolute -right-32 -top-40 -z-10 h-[460px] w-[460px] rounded-full bg-[#EACDA8]/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-48 -left-32 -z-10 h-[480px] w-[480px] rounded-full bg-[#C8D9C6]/35 blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-[94rem]">
        <div className="mb-6 flex flex-col gap-2.5 sm:mb-8 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#A65A2A] sm:text-xs sm:tracking-[0.24em]">01 / Culture, nature and heritage</p>
            <h2 className="mt-2 font-serif text-[clamp(2rem,9vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.045em] text-[#263B34] sm:mt-3">
              Uniquely <span className="font-normal italic text-[#B46234]">Odisha.</span>
            </h2>
          </div>
          <div className="relative isolate max-w-lg self-start px-4 py-3 sm:px-6 sm:py-4 lg:max-w-[380px] lg:self-end xl:max-w-lg">
            <svg viewBox="0 0 600 170" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true" focusable="false">
              <path d="M14 28 C112 10 206 23 302 14 C412 4 528 17 581 22 L572 36 L596 47 L580 57 L596 70 L582 82 L591 96 L573 110 L585 124 L560 140 C427 139 302 147 164 155 L20 158 L29 143 L5 132 L20 117 L4 104 L19 89 L3 75 L18 59 L4 44 Z" fill="#E9C99F" opacity="0.78" />
              <path d="M34 146 C170 134 353 143 554 131" fill="none" stroke="#B9763D" strokeWidth="6" strokeLinecap="round" opacity="0.18" />
            </svg>
            <p className="font-serif text-base italic leading-[1.6] tracking-[-0.025em] text-[#2D4A3F] sm:text-lg lg:text-[1.125rem]">
              From sacred cities to wild forests and familiar flavours, discover a different side of home with every stop.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)]">
          <div className="relative isolate flex flex-col overflow-hidden rounded-[1.3rem] bg-gradient-to-br from-[#573733] via-[#674137] to-[#79503C] p-4 text-white sm:rounded-[1.8rem] sm:p-6 lg:min-h-[560px]">
            <div className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[42px] border-white/[0.05]" aria-hidden="true" />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F2C894] sm:text-[11px]">Choose your journey</p>
            <h3 className="mt-1.5 font-serif text-xl font-bold leading-tight sm:mt-2 sm:text-2xl">Find your side of Odisha</h3>
            <p className="mt-2 text-xs leading-5 text-white/80 sm:mt-3 sm:leading-6">Pick a theme to see five places and experiences to explore.</p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3 lg:grid-cols-1" role="group" aria-label="Explore Odisha by interest">
              {explorerTabs.map((tab, index) => {
                const Icon = tabIcons[tab.id as keyof typeof tabIcons] ?? Sparkles;
                const selected = tab.id === activeId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveId(tab.id)}
                    className={`group flex min-h-[58px] cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4C58B] sm:min-h-[60px] sm:px-3 lg:min-h-[54px] ${selected ? 'border-[#F4C58B] bg-[#F4C58B] text-[#3C2924] shadow-lg shadow-black/15' : 'border-white/15 bg-white/[0.06] text-white/85 hover:border-white/40 hover:bg-white/[0.12]'}`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                    <span className="flex-1 text-[11px] font-semibold leading-tight sm:text-xs">{tab.label}</span>
                    <span className={`hidden text-[10px] font-bold lg:block ${selected ? 'text-[#705044]' : 'text-white/40'}`}>{String(index + 1).padStart(2, '0')}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-white/20 pt-4 sm:mt-5 lg:mt-auto">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F2C894]">Now exploring</p>
              <p className="mt-1 font-serif text-lg font-bold sm:text-xl">{activeTab.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/80">{categoryNotes[activeTab.id]}</p>
            </div>
          </div>

          <div key={activeTab.id} className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-[1.25fr_1fr_1fr] lg:grid-rows-2" aria-label={`${activeTab.label} places`}>
            {activeTab.items.map((item, index) => <PlaceCard key={item.name} item={item} index={index} featured={index === 0} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
