'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, UtensilsCrossed } from 'lucide-react';
import { dishes, dishPalette } from './cuisineData';
import styles from './cuisine-carousel.module.css';

const SECONDS_PER_DISH = 3.7;

function positionCards(nodes: Array<HTMLButtonElement | null>, width: number, phase: number) {
  if (!width) return;
  const visibleRadius = width < 640 ? 2.2 : width < 1024 ? 3 : 4;
  const spacing = width / (visibleRadius * 2 + 0.3);

  nodes.forEach((node, index) => {
    if (!node) return;
    const distance = ((index - phase + dishes.length * 1.5) % dishes.length) - dishes.length / 2;
    const depth = Math.abs(distance) / visibleRadius;
    if (Math.abs(distance) > visibleRadius + 0.8) {
      node.style.visibility = 'hidden';
      return;
    }
    node.style.visibility = 'visible';
    node.style.zIndex = String(Math.round((visibleRadius + 1 - Math.abs(distance)) * 10));
    node.style.opacity = String(Math.max(0.45, 1 - depth * 0.45));
    node.style.transform = `translate3d(${width / 2 + distance * spacing}px, -50%, 0) translateX(-50%) perspective(950px) rotateY(${-distance * 12}deg) scale(${1.2 - depth * 0.27})`;
  });
}

export default function CuisineSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stageWidth = useRef(0);
  const phase = useRef(0);
  const holdUntil = useRef(0);
  const selectedRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const inView = useInView(stageRef, { amount: 0.05 });
  const selectedDish = dishes[selectedIndex];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resize = () => {
      stageWidth.current = stage.clientWidth;
      positionCards(cardRefs.current, stageWidth.current, phase.current);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reducedMotion || !inView || stageRef.current?.dataset.paused === 'true' || performance.now() < holdUntil.current) return;
    phase.current = (phase.current + Math.min(delta, 50) / (SECONDS_PER_DISH * 1000)) % dishes.length;
    positionCards(cardRefs.current, stageWidth.current, phase.current);
    const index = Math.round(phase.current) % dishes.length;
    if (index !== selectedRef.current) {
      selectedRef.current = index;
      setSelectedIndex(index);
    }
  });

  function chooseDish(index: number) {
    phase.current = (index + dishes.length) % dishes.length;
    selectedRef.current = phase.current;
    setSelectedIndex(phase.current);
    holdUntil.current = performance.now() + 5000;
    positionCards(cardRefs.current, stageWidth.current, phase.current);
  }

  return (
    <section id="cuisine" className="relative isolate scroll-mt-20 overflow-hidden bg-[#FFF8EF] px-3 py-10 text-[#2E332B] sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute -right-24 -top-36 -z-10 h-[440px] w-[440px] rounded-full border-[65px] border-[#F0D7BA]/30" aria-hidden="true" />
      <div className="mx-auto max-w-[94rem]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(270px,410px)] lg:items-end lg:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A45D39] sm:text-xs"><UtensilsCrossed className="h-4 w-4" aria-hidden="true" /> 04 / Taste of Odisha</p>
            <h2 className="mt-2 max-w-3xl font-serif text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-0.045em]">
              Flavours that <span className="font-normal italic text-[#AD673F]">feel like home.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#6B645B] sm:text-base">From a bowl of pakhala to festival pitha and treasured sweets, Odisha’s kitchens have many stories to share.</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#E7D5BF] bg-[#F0E4D4] sm:mt-8 sm:rounded-[2rem]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E0CCB2] px-4 py-4 sm:px-6">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#A45D39]">The Odisha table</p><h3 className="mt-1 font-serif text-lg font-bold sm:text-xl">24 flavours to discover</h3></div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-[#795C46]">{String(selectedIndex + 1).padStart(2, '0')} / {dishes.length}</span>
              <button type="button" aria-label="Previous dish" onClick={() => chooseDish(Math.round(phase.current) - 1)} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[#D4B99D] bg-[#FFF9F0] text-[#6D4C36] transition hover:border-[#A45D39] hover:bg-[#A45D39] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A45D39]"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
              <button type="button" aria-label="Next dish" onClick={() => chooseDish(Math.round(phase.current) + 1)} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-[#D4B99D] bg-[#FFF9F0] text-[#6D4C36] transition hover:border-[#A45D39] hover:bg-[#A45D39] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A45D39]"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            </div>
          </div>

          <div
            ref={stageRef}
            className={styles.stage}
            role="group"
            aria-label="Moving carousel of Odisha dishes"
            onMouseEnter={(event) => { event.currentTarget.dataset.paused = 'true'; }}
            onMouseLeave={(event) => { event.currentTarget.dataset.paused = event.currentTarget.contains(document.activeElement) ? 'true' : 'false'; }}
            onFocusCapture={(event) => { event.currentTarget.dataset.paused = 'true'; }}
            onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.dataset.paused = 'false'; }}
            onPointerDown={(event) => { event.currentTarget.dataset.paused = 'true'; }}
            onPointerUp={(event) => { if (event.pointerType !== 'mouse') event.currentTarget.dataset.paused = 'false'; }}
          >
            <span className="pointer-events-none absolute inset-x-0 top-1/2 h-48 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,252,246,0.75),rgba(255,252,246,0)_70%)]" aria-hidden="true" />
            {dishes.map((dish, index) => {
              const palette = dishPalette[dish.category];
              return (
                <button
                  key={dish.name}
                  ref={(node) => { cardRefs.current[index] = node; }}
                  type="button"
                  aria-label={`Discover ${dish.name}`}
                  aria-pressed={selectedIndex === index}
                  onClick={() => chooseDish(index)}
                  className={`${styles.card} group border-2 text-left shadow-[0_20px_35px_rgba(73,43,24,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A45D39] ${selectedIndex === index ? 'border-[#A45D39]' : 'border-white/70 hover:border-[#A45D39]'}`}
                  style={{ backgroundColor: palette.background, color: dish.image ? '#fff' : palette.ink }}
                >
                  {dish.image ? <Image src={dish.image} alt="" fill sizes="(max-width: 639px) 40vw, (max-width: 1023px) 24vw, 17vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <>
                    <span className="absolute -right-10 -top-8 h-36 w-36 rounded-full border-[22px] opacity-45" style={{ borderColor: palette.glow }} aria-hidden="true" />
                    <span className="absolute bottom-12 left-6 grid h-16 w-16 place-items-center rounded-full border-2 opacity-80" style={{ borderColor: palette.glow }} aria-hidden="true"><UtensilsCrossed className="h-7 w-7" /></span>
                  </>}
                  {dish.image && <span className="absolute inset-0 bg-gradient-to-t from-[#1B251B]/85 via-[#1B251B]/15 to-transparent" aria-hidden="true" />}
                  <span className="absolute left-3 top-3 rounded-full border border-current/25 bg-white/15 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] backdrop-blur-sm sm:left-4 sm:top-4 sm:px-2.5">{dish.category}</span>
                  <span className="absolute bottom-4 left-3 right-3 sm:bottom-5 sm:left-4 sm:right-4">
                    <span className="block text-[10px] font-bold opacity-75 sm:text-xs">{String(index + 1).padStart(2, '0')} / 24</span>
                    <span className="mt-1 block font-serif text-lg font-bold leading-tight tracking-[-0.03em] sm:text-xl lg:text-2xl">{dish.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 border-t border-[#E0CCB2] bg-[#FFF9F1] p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center lg:gap-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E7C89E] text-[#7D4C32]"><Sparkles className="h-4 w-4" aria-hidden="true" /></span>
              <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A45D39]">{selectedDish.category}</p><h4 className="mt-0.5 font-serif text-xl font-bold sm:text-2xl">{selectedDish.name}</h4><p className="mt-1 text-sm leading-6 text-[#6C695F]">{selectedDish.description}</p></div>
            </div>
            <div><label htmlFor="dish-jump" className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#8E6A4E]">Jump to a dish</label><select id="dish-jump" value={selectedIndex} onChange={(event) => chooseDish(Number(event.target.value))} className="mt-1.5 h-10 w-full cursor-pointer rounded-xl border border-[#D9C5AD] bg-white px-3 text-sm font-medium text-[#443F36] outline-none focus-visible:border-[#A45D39]">{dishes.map((dish, index) => <option key={dish.name} value={index}>{dish.name}</option>)}</select></div>
          </div>
        </div>
      </div>
    </section>
  );
}
