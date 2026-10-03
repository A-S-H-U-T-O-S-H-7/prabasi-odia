'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  MapPin,
  Mountain,
  Palette,
  Sparkles,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';
import { explorerTabs } from './explorerData';
import styles from './destination-ribbon.module.css';

const SECONDS_PER_PLACE = 4.5;

function positionCards(nodes: Array<HTMLElement | null>, width: number, phase: number, count: number) {
  if (!width || !count) return;
  const slots = width < 640 ? 4 : width < 1024 ? 6 : 8;
  const spacing = width / slots;
  const perspective = Math.min(160, Math.max(70, spacing * 0.71)) * 8;

  nodes.forEach((node, index) => {
    if (!node) return;
    const slot = ((index - phase + count) % count) - 2;
    const position = (slot + 0.35) * spacing;
    const distance = (position - width / 2) / (width / 2);
    if (Math.abs(distance) > 1.45) {
      node.style.visibility = 'hidden';
      return;
    }
    const depth = distance * distance;
    const x = width / 2 + (width / 2) * (0.86 * distance + 0.14 * distance ** 3);
    node.style.visibility = 'visible';
    node.style.transform = `translate3d(${x}px, 0, 0) translate(-50%, -50%) perspective(${perspective}px) rotateY(${-distance * 46}deg) scale(${1 + 0.65 * depth}, ${1 + 1.35 * depth})`;
  });
}

const tabIcons = {
  sacred: Sparkles,
  nature: Leaf,
  beaches: Waves,
  landscapes: Mountain,
  heritage: Palette,
  cuisine: UtensilsCrossed,
};

export default function DestinationExplorer() {
  const [activeId, setActiveId] = useState(explorerTabs[0].id);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const ribbonCards = useRef<Array<HTMLElement | null>>([]);
  const ribbonWidth = useRef(0);
  const ribbonPhase = useRef(0);
  const reduceMotion = useReducedMotion();
  const ribbonInView = useInView(ribbonRef, { amount: 0.05 });
  const activeTab = explorerTabs.find((tab) => tab.id === activeId) ?? explorerTabs[0];
  const ribbonItems = activeTab.items;
  const ribbonFrames = [...ribbonItems, ...ribbonItems];

  useEffect(() => {
    ribbonPhase.current = 0;
    const stage = ribbonRef.current;
    if (!stage) return;
    const resize = () => {
      ribbonWidth.current = stage.clientWidth;
      positionCards(ribbonCards.current, ribbonWidth.current, ribbonPhase.current, ribbonFrames.length);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [activeId, ribbonFrames.length]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !ribbonInView || ribbonRef.current?.dataset.paused === 'true') return;
    ribbonPhase.current = (ribbonPhase.current + Math.min(delta, 50) / (SECONDS_PER_PLACE * 1000)) % ribbonFrames.length;
    positionCards(ribbonCards.current, ribbonWidth.current, ribbonPhase.current, ribbonFrames.length);
  });

  const updateArrows = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setCanGoBack(scroller.scrollLeft > 2);
    setCanGoForward(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollTo({ left: 0, behavior: 'auto' });
    updateArrows();

    const observer = new ResizeObserver(updateArrows);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [activeId, updateArrows]);

  function moveCards(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    const firstCard = scroller?.firstElementChild as HTMLElement | null;
    if (!scroller || !firstCard) return;

    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
    scroller.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' });
  }

  return (
    <section id="places" className="relative isolate scroll-mt-20 overflow-hidden bg-[#F7F8F6] py-12 sm:py-14 lg:py-16">
      <Image
        src="/tourism/koraput-hills.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover opacity-20"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-[#F9FAF8]/90 to-[#F4F7F4]/95" aria-hidden="true" />

      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:mx-10 lg:px-0 2xl:mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E97908] sm:text-xs">
              Culture, nature and heritage
            </p>
            <h2 className="mt-2 text-[clamp(2.3rem,4.4vw,4rem)] font-light leading-[1.1] tracking-[-0.045em] text-[#333D45]">
              Uniquely Odisha
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-[#F58A0A]" aria-hidden="true" />
            <p className="mt-3 text-sm text-[#697580] sm:text-base">
              Every journey tells a different story
            </p>
          </div>

          <a
            href={activeTab.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-[#38434D] px-5 text-sm font-semibold text-[#38434D] transition hover:border-[#F58A0A] hover:bg-[#F58A0A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F58A0A] sm:self-end"
            aria-label={`View more ${activeTab.label} on Odisha Tourism (opens in a new tab)`}
          >
            View all places <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div
          className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-7"
          role="group"
          aria-label="Explore Odisha by interest"
        >
          {explorerTabs.map((tab) => {
            const Icon = tabIcons[tab.id as keyof typeof tabIcons] ?? Sparkles;
            const selected = tab.id === activeId;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(tab.id)}
                className={`inline-flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F58A0A] sm:text-sm ${
                  selected
                    ? 'border-[#F58A0A] bg-[#F58A0A] text-white'
                    : 'border-[#E3E8EC] bg-white text-[#536073] hover:border-[#F58A0A] hover:text-[#D66E00]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          ref={ribbonRef}
          className={`${styles.stage} mt-4 sm:mt-5`}
          role="group"
          aria-label={`Moving photo ribbon of ${activeTab.label} destinations`}
          onMouseEnter={(event) => { event.currentTarget.dataset.paused = 'true'; }}
          onMouseLeave={(event) => { event.currentTarget.dataset.paused = 'false'; }}
          onFocusCapture={(event) => { event.currentTarget.dataset.paused = 'true'; }}
          onBlurCapture={(event) => { event.currentTarget.dataset.paused = 'false'; }}
        >
          {ribbonFrames.map((item, index) => (
            <a
              key={`${item.name}-${index}`}
              ref={(node) => { ribbonCards.current[index] = node; }}
              href={item.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={index < ribbonItems.length ? 0 : -1}
              aria-hidden={index >= ribbonItems.length || undefined}
              aria-label={`${item.name}, ${item.location}. Read about it on Odisha Tourism (opens in a new tab)`}
              className={`${styles.card} group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F58A0A]`}
            >
              <Image src={item.image} alt="" fill sizes="(max-width: 639px) 18vw, 12vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" aria-hidden="true" />
              <span className="absolute inset-x-3 bottom-3 text-white sm:inset-x-4 sm:bottom-4">
                <span className="block text-[10px] font-medium text-white/80 sm:text-xs">{item.location}</span>
                <span className="mt-1 block font-serif text-sm font-bold leading-tight sm:text-lg">{item.name}</span>
              </span>
            </a>
          ))}
        </div>

        <div className="relative mt-4 sm:mt-5">
          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4"
            aria-label={`${activeTab.label} places`}
          >
            {activeTab.items.map((item) => (
              <a
                key={item.name}
                href={item.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read about ${item.name} on Odisha Tourism (opens in a new tab)`}
                className="group relative isolate flex h-[310px] w-[78vw] max-w-[360px] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[1.35rem] bg-[#23352C] p-5 text-white shadow-[0_14px_32px_rgba(28,42,42,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F58A0A] sm:h-[340px] sm:w-[40vw] lg:h-[370px] lg:w-[31.5%] lg:max-w-none"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 639px) 78vw, (max-width: 1023px) 40vw, 32vw"
                  className="-z-20 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/15 to-transparent" aria-hidden="true" />
                <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/50 bg-black/20 backdrop-blur-sm transition group-hover:bg-white group-hover:text-[#26362C]" aria-hidden="true">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/85">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />{item.location}
                </span>
                <span className="mt-1.5 block font-serif text-xl font-bold leading-tight sm:text-2xl">{item.name}</span>
                <span className="mt-1.5 block max-w-sm text-xs leading-5 text-white/85 sm:text-sm">{item.description}</span>
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => moveCards(-1)}
            disabled={!canGoBack}
            aria-label="Previous place"
            className="absolute left-2 top-[45%] grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/70 bg-white/90 text-[#35404A] shadow-lg backdrop-blur transition hover:bg-[#F58A0A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F58A0A] disabled:cursor-default disabled:opacity-0 sm:-left-5 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => moveCards(1)}
            disabled={!canGoForward}
            aria-label="Next place"
            className="absolute right-2 top-[45%] grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/70 bg-white/90 text-[#35404A] shadow-lg backdrop-blur transition hover:bg-[#F58A0A] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F58A0A] disabled:cursor-default disabled:opacity-0 sm:-right-5 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4 text-[11px] text-[#7C8790]">
          <p>Pause the ribbon by hovering or focusing a destination.</p>
          <p className="shrink-0 font-semibold">05 / 05 places</p>
        </div>
      </div>
    </section>
  );
}
