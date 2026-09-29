"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, Download, ExternalLink } from "lucide-react";
import styles from "./BiographyBook.module.css";

const PAGE_COUNT = 7;
const PDF_URL = "/mmbio.pdf";
const pageImage = (number: number) => `/mmbio-pages/page-${number}.webp`;

function PageFace({ index, isWide }: { index: number; isWide: boolean }) {
  if (index < 0) return <div className={styles.endpaper}>The story begins here.</div>;
  if (index === PAGE_COUNT && isWide) {
    return <div className={styles.finalCompanion}>
      <span className={styles.finalEyebrow}>FCA(Dr) Manoranjan Mohanty</span>
      <div className={styles.finalCompanionCenter}>
        <span className={styles.finalRule} aria-hidden="true" />
        <p>Purpose leaves a legacy.</p>
        <span className={styles.finalRule} aria-hidden="true" />
      </div>
      <span className={styles.finalFolio}>07 / 07</span>
    </div>;
  }
  if (index >= PAGE_COUNT) {
    return <div className={styles.finalPage}>
      <span className={styles.finalEyebrow}>Prabasi Odia &middot; A story of vision</span>
      <div className={styles.finalCenter}>
        <span className={styles.finalOrnament} aria-hidden="true">✦</span>
        <span className={styles.finalRule} aria-hidden="true" />
        <p className={styles.finalTitle}>The End</p>
        <p className={styles.finalMessage}>The story continues in the communities we build together.</p>
        <span className={styles.finalRule} aria-hidden="true" />
      </div>
      <span className={styles.finalFolio}>Thank you for reading</span>
    </div>;
  }
  return <Image src={pageImage(index + 1)} alt={`Page ${index + 1} of FCA(Dr) Manoranjan Mohanty's profile`} width={1520} height={1899} unoptimized loading={index === 0 ? "eager" : "lazy"} className={styles.paperImage} />;
}

export default function BiographyReader() {
  const [opened, setOpened] = useState(false);
  const [coverTurning, setCoverTurning] = useState(false);
  const [position, setPosition] = useState(0);
  const [turn, setTurn] = useState<{ direction: number; target: number } | null>(null);
  const [isWide, setIsWide] = useState(false);
  const busy = useRef(false);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const update = () => {
      setIsWide(query.matches);
      setPosition(0);
      setTurn(null);
      busy.current = false;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    for (let number = 1; number <= PAGE_COUNT; number++) {
      const image = new window.Image();
      image.src = pageImage(number);
    }
  }, []);

  const step = isWide ? 2 : 1;
  const lastPosition = isWide ? PAGE_COUNT + 1 : PAGE_COUNT;
  const canGoBack = opened && !turn && !coverTurning;
  const canGoForward = (!opened || position < lastPosition) && !turn && !coverTurning;
  const stops = isWide ? [0, 2, 4, 6, lastPosition] : Array.from({ length: PAGE_COUNT + 1 }, (_, index) => index);
  const leftIndex = turn?.direction === -1 ? turn.target - 1 : position - 1;
  const rightIndex = turn ? turn.direction > 0 || !isWide ? turn.target : position : position;

  const navigate = (direction: number) => {
    if (busy.current || coverTurning) return;
    if (!opened) {
      if (direction > 0) { setCoverTurning(true); setOpened(true); }
      return;
    }
    const target = position + direction * step;
    if (target < 0) { setCoverTurning(true); setOpened(false); setPosition(0); return; }
    if (target > lastPosition) return;
    if (reduceMotion) { setPosition(target); return; }
    busy.current = true;
    setTurn({ direction, target });
  };

  const finishTurn = () => {
    if (!turn) return;
    setPosition(turn.target);
    setTurn(null);
    busy.current = false;
  };

  const jumpTo = (target: number) => {
    if (busy.current || coverTurning || (opened && target === position)) return;
    setPosition(target);
    if (!opened) { setCoverTurning(true); setOpened(true); }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F1E8] px-4 pb-20 pt-8 text-[#2A1636] sm:px-6 sm:pt-12">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#E7D7E8]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-72 h-[30rem] w-[30rem] rounded-full bg-[#F4D3BE]/55 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#6B1E5B]/15 bg-white/75 px-4 py-2 text-sm font-medium text-[#6B1E5B] shadow-sm transition hover:border-[#6B1E5B]/40 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B]">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B1E5B] underline-offset-4 transition hover:underline">
            View original PDF <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="mx-auto max-w-3xl py-9 text-center sm:py-12">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#D9772B]/20 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#9A5C2D]">
            <BookOpen className="h-4 w-4" /> A seven-page profile
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-[#2A1636] sm:text-5xl">Meet FCA(Dr) Manoranjan Mohanty</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6B5E5A] sm:text-base">Turn the pages to explore the profile of the person behind the Prabasi Odia project.</p>
        </motion.header>

        <section aria-label="Biography magazine reader" className="rounded-[2rem] border border-white/80 bg-white/55 p-3 shadow-[0_24px_80px_rgba(63,30,52,0.12)] backdrop-blur-sm sm:p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between gap-3 px-1 sm:mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B36D3A]">The profile</p>
              <p className="mt-1 font-serif text-lg font-semibold sm:text-xl">A story in pages</p>
            </div>
            <span aria-live="polite" className="rounded-full border border-[#E7D7E8] bg-[#FFF9F2] px-3 py-1.5 text-xs font-semibold text-[#6B1E5B] sm:text-sm">
              {!opened ? "Cover" : position === lastPosition ? "The End" : isWide && position > 0 ? `Pages ${position}–${Math.min(position + 1, PAGE_COUNT)} / ${PAGE_COUNT}` : `Page ${position + 1} / ${PAGE_COUNT}`}
            </span>
          </div>

          <div className={`${styles.stage} mx-auto max-w-[440px] min-[900px]:max-w-[1040px]`} data-open={opened}>
            <div
              className={styles.book}
              role="group"
              tabIndex={0}
              aria-label="Biography book. Use the left and right arrow keys to turn pages."
              onPointerDown={(event) => { gesture.current = { x: event.clientX, y: event.clientY }; suppressClick.current = false; }}
              onPointerUp={(event) => {
                if (!gesture.current) return;
                const dx = event.clientX - gesture.current.x;
                const dy = event.clientY - gesture.current.y;
                gesture.current = null;
                suppressClick.current = Math.abs(dx) > 8 || Math.abs(dy) > 8;
                if (event.pointerType === "touch" && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) navigate(dx < 0 ? 1 : -1);
              }}
              onPointerCancel={() => { gesture.current = null; suppressClick.current = true; }}
            >
              <div className={styles.stack} aria-hidden="true" />
              <div className={styles.pages} aria-hidden={!opened}>
                {isWide && <button type="button" tabIndex={opened ? 0 : -1} className={styles.leftPage} onClick={() => { if (!suppressClick.current) navigate(-1); }} aria-label="Turn to previous pages"><PageFace index={leftIndex} isWide={isWide} /></button>}
                <button type="button" tabIndex={opened ? 0 : -1} className={styles.rightPage} onClick={() => { if (!suppressClick.current) navigate(1); }} aria-label="Turn to next pages"><PageFace index={rightIndex} isWide={isWide} /></button>
                <div className={styles.spine} aria-hidden="true" />
                {turn && (
                  <motion.div
                    className={styles.turningLeaf}
                    data-direction={turn.direction}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: turn.direction > 0 ? -180 : 180 }}
                    transition={{ duration: 0.85, ease: [0.45, 0.05, 0.25, 1] }}
                    onAnimationComplete={finishTurn}
                    aria-hidden="true"
                  >
                    <div className={styles.leafFront}><PageFace index={isWide ? turn.direction > 0 ? position : position - 1 : position} isWide={isWide} /></div>
                    <div className={styles.leafBack}><PageFace index={isWide ? turn.direction > 0 ? turn.target - 1 : turn.target : turn.target} isWide={isWide} /></div>
                  </motion.div>
                )}
              </div>
              <motion.div
                className={styles.cover}
                initial={false}
                animate={{ rotateY: opened ? -180 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 1, ease: [0.4, 0, 0.2, 1] }}
                onAnimationComplete={() => setCoverTurning(false)}
                style={{ zIndex: !opened || coverTurning ? 6 : 0, pointerEvents: opened ? "none" : "auto" }}
              >
                <button type="button" className={`${styles.coverFront} flex w-full flex-col items-center justify-between p-[8%] text-center text-[#F8E7CF]`} tabIndex={opened ? -1 : 0} aria-label="Open the biography book" onClick={() => { if (!suppressClick.current) navigate(1); }}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-xs">Prabasi Odia · The profile</span>
                  <div className="flex flex-col items-center gap-3 sm:gap-5">
                    <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-[#E6C897] shadow-xl sm:h-32 sm:w-32"><Image src="/avatar5.jpeg" alt="FCA(Dr) Manoranjan Mohanty" fill className="object-cover" /></div>
                    <div className="border-y border-[#E6C897]/60 py-4 sm:py-7"><p className="text-[10px] uppercase tracking-[0.24em] text-[#E6C897] sm:text-xs">A story of vision</p><h2 className="mt-3 font-serif text-xl font-bold leading-snug sm:text-3xl">FCA(Dr) Manoranjan Mohanty</h2></div>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] sm:text-xs">Open the book <ChevronRight className="h-4 w-4" /></span>
                </button>
                <div className={styles.coverBack} aria-hidden="true" />
              </motion.div>
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-3xl sm:mt-9">
            <div className="mb-5 h-1 overflow-hidden rounded-full bg-[#E7D7E8]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#15365b] to-[#5b9bc3]" animate={{ width: `${opened ? ((position + 1) / (lastPosition + 1)) * 100 : 0}%` }} transition={{ duration: 0.45 }} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => navigate(-1)} disabled={!canGoBack} className="inline-flex items-center gap-1.5 rounded-full border border-[#D4C8C0] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B1E5B] shadow-sm transition hover:border-[#6B1E5B] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-5 sm:text-sm">
                <ChevronLeft className="h-4 w-4" /> {position === 0 ? "Close cover" : "Previous"}
              </button>
              <span className="hidden text-xs text-[#6B5E5A] sm:block">Click a page, swipe, or use the arrow keys to turn</span>
              <button type="button" onClick={() => navigate(1)} disabled={!canGoForward} className="inline-flex items-center gap-1.5 rounded-full bg-[#6B1E5B] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#531547] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-5 sm:text-sm">
                {opened && position < lastPosition && position + step === lastPosition ? "The End" : opened ? "Next" : "Open book"} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Jump to a page">
              {stops.map((stop) => {
                const selected = opened && position === stop;
                return <button key={stop} type="button" onClick={() => jumpTo(stop)} aria-current={selected ? "page" : undefined} aria-label={stop === lastPosition ? "The End" : isWide && stop > 0 ? `Pages ${stop} and ${stop + 1}` : `Page ${stop + 1}`} className={`h-2.5 rounded-full transition-all duration-300 ${selected ? "w-8 bg-[#6B1E5B]" : "w-2.5 bg-[#D4C8C0] hover:bg-[#D9772B]"}`} />;
              })}
            </div>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-center text-sm text-[#6B5E5A]">
          <span>Prefer the original document?</span>
          <a href={PDF_URL} download="Manoranjan-Mohanty-Profile.pdf" className="inline-flex items-center gap-2 font-semibold text-[#6B1E5B] underline underline-offset-4 hover:text-[#D9772B]"><Download className="h-4 w-4" /> Download PDF</a>
          <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#6B1E5B] underline underline-offset-4 hover:text-[#D9772B]"><ArrowRight className="h-4 w-4" /> Open full size</a>
        </div>
      </div>
    </div>
  );
}
