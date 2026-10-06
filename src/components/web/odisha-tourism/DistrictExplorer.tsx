'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, Compass, MapPin, Search, Sparkles, UtensilsCrossed } from 'lucide-react';
import { districts } from './districtData';
import styles from './district-marquee.module.css';

const sortedDistricts = [...districts].sort((a, b) => a.name.localeCompare(b.name));

export default function DistrictExplorer() {
  const [selected, setSelected] = useState('Puri');
  const [query, setQuery] = useState('');
  const district = districts.find((item) => item.name === selected) ?? districts[0];
  const visibleDistricts = sortedDistricts.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedNumber = String(sortedDistricts.findIndex((item) => item.name === selected) + 1).padStart(2, '0');

  return (
    <section id="district-guide" className="relative isolate scroll-mt-16 overflow-hidden bg-[#173B32] px-3 py-8 text-[#FFF9EF] sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[550px] w-[550px] rounded-full border-[76px] border-white/[0.025]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-60 -left-40 -z-10 h-[600px] w-[600px] rounded-full border-[85px] border-[#C5935F]/[0.055]" aria-hidden="true" />
      <div className="mx-auto max-w-[94rem]">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,430px)] lg:items-end lg:gap-12">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.19em] text-[#E9C38E] sm:text-xs sm:tracking-[0.24em]"><Sparkles className="h-4 w-4" aria-hidden="true" /> 02 / Explore by district</p>
            <h2 className="mt-3 max-w-3xl font-serif text-[clamp(2rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.055em]">
              Navigate <span className="font-normal italic text-[#EFC995]">Odisha.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">Thirty districts. Many ways to feel at home. Choose a district and find a story, a sight and a local flavour to start with.</p>
          </div>
          <div className="hidden items-center gap-4 rounded-[1.35rem] border border-white/15 bg-white/[0.055] p-4 backdrop-blur-sm sm:flex lg:mb-1">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#EFC995] text-[#23473C]"><Compass className="h-6 w-6" aria-hidden="true" /></span>
            <p className="text-sm leading-6 text-white/80"><strong className="block font-serif text-lg text-white">A journey starts here</strong> Browse the district index and follow the places that interest you.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:mt-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-5">
          <div className="relative isolate flex flex-col overflow-hidden rounded-[1.5rem] border border-[#E5D9C6] bg-[#F5EBDD] p-4 text-[#29473B] shadow-[0_28px_70px_rgba(3,20,13,0.2)] sm:rounded-[2rem] sm:p-6 lg:h-[620px] lg:p-7">
            <span className="pointer-events-none absolute -right-5 -top-14 -z-10 font-serif text-[11rem] font-bold leading-none text-[#274D3D]/[0.055] sm:text-[15rem]" aria-hidden="true">30</span>
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#A26039] sm:text-xs">The district index</p><h3 className="mt-1 font-serif text-2xl font-bold sm:text-3xl">Where to next?</h3></div>
              <span className="rounded-full border border-[#D6C7B1] bg-white/60 px-3 py-1.5 text-[10px] font-bold text-[#52695C] sm:text-xs">30 places to begin</span>
            </div>
            <p className="relative mt-3 max-w-sm text-xs leading-6 text-[#657368] sm:text-sm"><span className="sm:hidden">Tap a moving district name, or use the picker to jump straight to one.</span><span className="hidden sm:inline">Search by name, then choose a district to reveal its highlight and local flavour.</span></p>

            <div className={`${styles.viewport} relative mt-5 sm:hidden`} role="group" aria-label="Scrolling Odisha districts">
              <div className={styles.track}>
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex shrink-0 gap-2 pr-2" aria-hidden={copy === 1}>
                    {sortedDistricts.map((item) => (
                      <button
                        key={`${copy}-${item.name}`}
                        type="button"
                        tabIndex={copy === 1 ? -1 : 0}
                        aria-pressed={copy === 0 ? selected === item.name : undefined}
                        onClick={() => setSelected(item.name)}
                        className={`min-h-11 shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26039] ${selected === item.name ? 'border-[#315F4D] bg-[#315F4D] text-white' : 'border-[#D7C9B7] bg-white text-[#315044] hover:border-[#A26039] hover:bg-[#FFF9EF]'}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-5 sm:hidden">
              <label htmlFor="mobile-district-picker" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-[#8F6043]">Jump to a district</label>
              <select id="mobile-district-picker" value={selected} onChange={(event) => setSelected(event.target.value)} className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-[#D7C9B7] bg-white px-4 pr-10 text-sm font-semibold text-[#29473B] outline-none focus-visible:border-[#A26039]">
                {sortedDistricts.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 bottom-4 h-4 w-4 text-[#A26039]" aria-hidden="true" />
            </div>

            <div className="relative mt-5 hidden sm:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718274]" aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a district" aria-label="Search districts" className="h-12 w-full rounded-xl border border-[#D7C9B7] bg-white pl-11 pr-4 text-sm text-[#29473B] outline-none placeholder:text-[#829083] focus-visible:border-[#A26039] focus-visible:ring-2 focus-visible:ring-[#A26039]/20" />
            </div>

            <div className="mt-5 hidden min-h-0 flex-1 grid-cols-3 content-start gap-2 overflow-y-auto pr-1 sm:grid sm:max-h-[320px] lg:max-h-none lg:grid-cols-2 xl:grid-cols-3" role="group" aria-label="Odisha districts">
              {visibleDistricts.map((item) => {
                const active = selected === item.name;
                return (
                  <button key={item.name} type="button" aria-pressed={active} onClick={() => setSelected(item.name)} className={`group flex min-h-14 cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A26039] xl:text-sm ${active ? 'border-[#315F4D] bg-[#315F4D] text-white shadow-[0_8px_16px_rgba(30,64,46,0.2)]' : 'border-[#E2D6C5] bg-white/80 text-[#345246] hover:border-[#A8B69F] hover:bg-white'}`}>
                    <span className="min-w-0 break-words">{item.name}</span>
                    <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'bg-[#EFC995]' : 'bg-[#B7C8B2] group-hover:bg-[#648F74]'}`} />
                  </button>
                );
              })}
            </div>
            {visibleDistricts.length === 0 && <p className="mt-5 hidden text-sm text-[#68766C] sm:block">No district matches &quot;{query}&quot;. Try another name.</p>}
            <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-[#D9CDBA] pt-4 text-xs text-[#647468] sm:text-sm">
              <span>{visibleDistricts.length} of {districts.length} districts</span>
              <span className="inline-flex items-center gap-2 font-semibold text-[#315F4D]"><span className="h-2 w-2 rounded-full bg-[#C8834B]" /> {district.name} selected</span>
            </div>
          </div>

          <article className="flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] bg-[#FFF9EF] text-[#264238] shadow-[0_28px_70px_rgba(3,20,13,0.2)] sm:rounded-[2rem] lg:h-[620px]">
            <div className="relative isolate min-h-[255px] flex-1 overflow-hidden bg-[#325447] sm:min-h-[340px] lg:min-h-[370px]">
              <Image key={district.image} src={district.image} alt="" fill sizes="(max-width: 1023px) 100vw, 52vw" className="-z-20 object-cover" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#142A22]/90 via-[#142A22]/20 to-[#142A22]/15" />
              <div className="flex h-full min-h-[255px] flex-col justify-between p-5 text-white sm:min-h-[340px] sm:p-7 lg:min-h-[370px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-white/40 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">District {selectedNumber} / 30</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/20 backdrop-blur-sm"><MapPin className="h-4 w-4" aria-hidden="true" /></span>
                </div>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F0CC99]">Now exploring</p><h3 aria-live="polite" className="mt-2 break-words font-serif text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.05] tracking-[-0.05em]">{district.name}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/90 sm:text-base">{district.summary}</p></div>
              </div>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
              <div className="flex min-w-0 items-center gap-3 rounded-[1.2rem] bg-[#EDF0E5] p-3.5 sm:p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#D6E3D2] text-[#315E4D]"><Compass className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#8F6043]">A place to see</p><p className="mt-1 font-serif text-base font-bold leading-tight sm:text-lg">{district.place}</p></div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-[1.2rem] bg-[#F5EBDD] p-3.5 sm:p-4">
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#E0B87F]"><Image src={district.foodImage} alt="" fill sizes="44px" className="object-cover" /></span>
                <div className="min-w-0"><p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.13em] text-[#8F6043]"><UtensilsCrossed className="h-3 w-3" aria-hidden="true" /> Local flavour</p><p className="mt-1 font-serif text-base font-bold leading-tight sm:text-lg">{district.food}</p></div>
              </div>
            </div>
          </article>
        </div>

      </div>
    </section>
  );
}
