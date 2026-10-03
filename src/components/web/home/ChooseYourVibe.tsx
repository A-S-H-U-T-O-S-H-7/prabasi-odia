"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";

const vibes = [
  { name: "Insta Spots", note: "Views worth sharing", image: "/tourism/konark-hero.webp", place: "Konark", href: "/odisha-tourism#places" },
  { name: "Adventure Mode", note: "Take the wilder way", image: "/tourism/similipal.webp", place: "Similipal", href: "/odisha-tourism#places" },
  { name: "Coastal Escape", note: "Slow days by the sea", image: "/tourism/puri.webp", place: "Puri", href: "/odisha-tourism#places" },
  { name: "Epic Road Trips", note: "Let the road decide", image: "/tourism/road-trip.webp", place: "The open road", href: "/odisha-tourism#road-trips" },
  { name: "Into the Wild", note: "Find your quiet", image: "/tourism/koraput-hills.webp", place: "Koraput", href: "/odisha-tourism#places" },
  { name: "Culture & Celebrations", note: "Feel Odisha come alive", image: "/tourism/odissi.webp", place: "Odissi", href: "/odisha-tourism#culture" },
  { name: "Offbeat Finds", note: "Take the lesser-known turn", image: "/tourism/raghurajpur.webp", place: "Raghurajpur", href: "/odisha-tourism#trails" },
];

export default function ChooseYourVibe() {
  const [active, setActive] = useState(0);
  const selected = vibes[active];

  return (
    <section className="relative isolate overflow-hidden bg-[#FFF9F2] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute -right-32 -top-36 -z-10 h-96 w-96 rounded-full bg-[#F4D9C4]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -left-36 -z-10 h-96 w-96 rounded-full bg-[#E8D4E3]/55 blur-3xl" />

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6B1E5B]/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#6B1E5B] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Pick what you feel like right now
            </span>
            <h2 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-tight text-[#2A1636] sm:text-5xl">
              Choose your <span className="italic text-[#8E496D]">vibe.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#6B5E5A] sm:text-lg">
              For every mood, there&apos;s an Odisha waiting for you.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end" aria-label="Choose a travel mood">
            {vibes.map((vibe, index) => (
              <button
                key={vibe.name}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] ${active === index ? "border-[#6B1E5B] bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20" : "border-[#6B1E5B]/15 bg-white/80 text-[#554250] hover:border-[#6B1E5B]/40 hover:bg-white"}`}
              >
                {vibe.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-[1.25fr_0.75fr]">
          <Link href={selected.href} className="group relative isolate min-h-[340px] overflow-hidden rounded-[2rem] bg-[#422A3A] shadow-[0_20px_60px_rgba(64,34,55,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1E5B] sm:min-h-[440px]">
            <Image key={selected.image} src={selected.image} alt={`${selected.place}, Odisha`} fill priority={false} sizes="(max-width: 1023px) 100vw, 60vw" className="-z-10 object-cover transition duration-700 group-hover:scale-[1.04]" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1F1420]/90 via-[#1F1420]/15 to-transparent" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md sm:left-7 sm:top-7">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" />{selected.name}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-white sm:p-8">
              <div>
                <p className="text-sm font-medium text-white/75">{selected.note}</p>
                <h3 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">{selected.place}</h3>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#6B1E5B] transition group-hover:translate-x-1 group-hover:bg-[#F6D7B8]">
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {vibes.filter((_, index) => index !== active).slice(0, 4).map((vibe) => (
              <button key={vibe.name} type="button" onClick={() => setActive(vibes.indexOf(vibe))} className="group relative isolate min-h-40 overflow-hidden rounded-3xl bg-[#59434F] text-left shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] sm:min-h-52" aria-label={`Choose ${vibe.name}: ${vibe.place}`}>
                <Image src={vibe.image} alt="" fill sizes="(max-width: 639px) 45vw, (max-width: 1023px) 22vw, 18vw" className="-z-10 object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-white/75"><MapPin className="h-3 w-3" aria-hidden="true" />{vibe.place}</span>
                  <span className="mt-1 block text-sm font-bold leading-snug sm:text-base">{vibe.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#6B1E5B]/10 bg-white/65 px-5 py-4 text-center sm:flex-row sm:text-left">
          <p className="font-serif text-xl italic text-[#8E496D] sm:text-2xl">Find your next favourite place.</p>
          <Link href="/odisha-tourism" className="inline-flex items-center gap-2 text-sm font-bold text-[#6B1E5B] transition hover:gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1E5B]">
            Explore Odisha <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
