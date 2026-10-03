"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, Sparkles } from "lucide-react";

const vibes = [
  {
    name: "Insta Spots",
    note: "Views worth sharing",
    image: "/tourism/konark-hero.webp",
    place: "Konark",
    href: "/odisha-tourism#places",
  },
  {
    name: "Adventure Mode",
    note: "Take the wilder way",
    image: "/tourism/similipal.webp",
    place: "Similipal",
    href: "/odisha-tourism#places",
  },
  {
    name: "Coastal Escape",
    note: "Slow days by the sea",
    image: "/tourism/puri.webp",
    place: "Puri",
    href: "/odisha-tourism#places",
  },
  {
    name: "Epic Road Trips",
    note: "Let the road decide",
    image: "/tourism/road-trip.webp",
    place: "The open road",
    href: "/odisha-tourism#road-trips",
  },
  {
    name: "Into the Wild",
    note: "Find your quiet",
    image: "/tourism/koraput-hills.webp",
    place: "Koraput",
    href: "/odisha-tourism#places",
  },
  {
    name: "Culture & Celebrations",
    note: "Feel Odisha come alive",
    image: "/tourism/odissi.webp",
    place: "Odissi",
    href: "/odisha-tourism#culture",
  },
  {
    name: "Offbeat Finds",
    note: "Take the lesser-known turn",
    image: "/tourism/raghurajpur.webp",
    place: "Raghurajpur",
    href: "/odisha-tourism#trails",
  },
];

export default function ChooseYourVibe() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: "previous" | "next") => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const card = carousel.querySelector<HTMLElement>("[data-vibe-card]");
    const distance = card ? card.offsetWidth + 20 : 320;
    carousel.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#FFF9F2] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[32rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5E8E6]/70 blur-3xl" />
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#8E496D] sm:text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> Pick a place for your next escape
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" aria-label="Previous places" onClick={() => scrollCarousel("previous")} className="grid h-9 w-9 place-items-center rounded-full border border-[#6B1E5B]/15 bg-white text-[#6B1E5B] transition hover:bg-[#6B1E5B] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next places" onClick={() => scrollCarousel("next")} className="grid h-9 w-9 place-items-center rounded-full border border-[#6B1E5B]/15 bg-white text-[#6B1E5B] transition hover:bg-[#6B1E5B] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="vibe-carousel -mx-4 overflow-hidden sm:-mx-6 lg:mx-0" onMouseEnter={(event) => event.currentTarget.classList.add("is-paused")} onMouseLeave={(event) => event.currentTarget.classList.remove("is-paused")}>
          <div ref={carouselRef} className="vibe-carousel-track flex w-max items-center gap-4 px-[8vw] pb-5 sm:gap-5 sm:px-[7vw] lg:gap-6 lg:px-0" role="group" aria-label="Odisha places carousel" tabIndex={0}>
          {[...vibes, ...vibes, ...vibes].map((vibe, index) => (
              <Link
                key={`${vibe.name}-${index}`}
                data-vibe-card
                href={vibe.href}
                className={`group relative isolate h-[270px] w-[62vw] max-w-[230px] shrink-0 overflow-hidden rounded-[1.35rem] bg-[#59434F] text-left shadow-[0_18px_45px_rgba(55,30,46,0.18)] transition-transform duration-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1E5B] sm:h-[340px] sm:w-[220px] lg:h-[390px] lg:w-[240px] ${index % 2 === 0 ? "lg:-translate-y-6" : "lg:translate-y-6"}`}
              >
                <Image
                  src={vibe.image}
                  alt={`${vibe.place}, Odisha`}
                  fill
                  sizes="(max-width: 639px) 62vw, 240px"
                  className="-z-10 object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md sm:left-4 sm:top-4 sm:text-xs">
                  <Compass className="h-3 w-3" aria-hidden="true" /> {vibe.name}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                  <span className="block font-serif text-xl font-bold leading-snug sm:text-2xl">{vibe.place}</span>
                  <span className="mt-1 block text-xs font-medium text-white/80">{vibe.note}</span>
                  <ArrowUpRight className="absolute bottom-5 right-5 h-5 w-5 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" aria-hidden="true" />
                </div>
              </Link>
          ))}
          </div>
        </div>

        <div className="mt-1 flex flex-col items-center gap-2 text-center sm:mt-3">
          <p className="font-serif text-2xl italic text-[#8E496D] sm:text-3xl">Find your next favourite place.</p>
          <Link href="/odisha-tourism" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6B1E5B] transition hover:gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1E5B]">
            Explore Odisha <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <style jsx>{`
        .vibe-carousel-track {
          animation: vibe-marquee 48s linear infinite;
        }
        .vibe-carousel.is-paused .vibe-carousel-track,
        .vibe-carousel:focus-within .vibe-carousel-track {
          animation-play-state: paused;
        }
        @keyframes vibe-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-33.333333% - 8px)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vibe-carousel-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
