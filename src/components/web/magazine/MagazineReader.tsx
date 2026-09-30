'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { magazineService, type MagazineIssue } from '@/lib/services/magazineService';

const pdfRoute = (id: string, pdfUrl: string) =>
  `/api/magazines/${encodeURIComponent(id)}/pdf?url=${encodeURIComponent(pdfUrl)}`;

function PdfPage({ pdf, number }: { pdf: PDFDocumentProxy; number: number }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const element = wrapper.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    setWidth(element.clientWidth);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!width || !canvas.current) return;
    let cancelled = false;
    let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null = null;
    setReady(false);
    setError(false);

    const render = async () => {
      try {
        const page = await pdf.getPage(number);
        if (cancelled || !canvas.current) return;
        const original = page.getViewport({ scale: 1 });
        const pixels = Math.min(width * Math.min(window.devicePixelRatio || 1, 2), 1400);
        const viewport = page.getViewport({ scale: pixels / original.width });
        const context = canvas.current.getContext('2d');
        if (!context) return;
        canvas.current.width = Math.ceil(viewport.width);
        canvas.current.height = Math.ceil(viewport.height);
        renderTask = page.render({ canvas: canvas.current, canvasContext: context, viewport });
        await renderTask.promise;
        if (!cancelled) setReady(true);
      } catch (error) {
        if (!cancelled) {
          console.error(`Could not render magazine page ${number}`, error);
          setError(true);
        }
      }
    };
    void render();
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, number, width]);

  return (
    <div ref={wrapper} className="relative h-full w-full overflow-hidden bg-[#FFFCF7]">
      {!ready && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-[#8C7667]" role="status">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="sr-only">Loading page {number}</span>
        </div>
      )}
      {error && <p role="alert" className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-red-700">Page {number} could not be displayed.</p>}
      <canvas ref={canvas} role="img" aria-label={`Page ${number}`} className={`h-full w-full object-contain ${ready ? '' : 'opacity-0'}`} />
    </div>
  );
}

export default function MagazineReader({ issueId }: { issueId: string }) {
  const [issue, setIssue] = useState<MagazineIssue | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWide, setIsWide] = useState(false);
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const initialHashApplied = useRef(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof import('pdfjs-dist')['getDocument']> | null = null;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const found = await magazineService.getIssue(issueId);
        if (!found) throw new Error('This magazine could not be found.');
        if (cancelled) return;
        setIssue(found);
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        task = pdfjs.getDocument({ url: pdfRoute(issueId, found.pdfUrl) });
        const document = await task.promise;
        if (!cancelled) setPdf(document);
      } catch (reason) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Could not open this magazine.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
      void task?.destroy();
    };
  }, [issueId]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 800px)');
    const update = () => {
      setIsWide(query.matches);
      setPage((current) => query.matches && current > 1 && current % 2 === 1 ? current - 1 : current);
    };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const count = pdf?.numPages || issue?.pageCount || 0;
  const stops = isWide
    ? [1, ...Array.from({ length: Math.ceil((count - 1) / 2) }, (_, index) => 2 + index * 2)]
    : Array.from({ length: count }, (_, index) => index + 1);
  const lastVisible = isWide && page > 1 ? Math.min(page + 1, count) : page;
  const canGoBack = page > 1;
  const canGoForward = lastVisible < count;

  const goBack = () => {
    if (!canGoBack) return;
    setDirection(-1);
    setPage((current) => isWide ? Math.max(1, current - 2) : current - 1);
  };
  const goForward = () => {
    if (!canGoForward) return;
    setDirection(1);
    setPage((current) => current === 1 ? 2 : current + (isWide ? 2 : 1));
  };
  const jumpTo = (target: number) => {
    if (!Number.isFinite(target) || target < 1 || target > count) return;
    const next = isWide && target > 1 && target % 2 === 1 ? target - 1 : target;
    setDirection(next >= page ? 1 : -1);
    setPage(next);
  };

  useEffect(() => {
    if (!pdf || initialHashApplied.current) return;
    initialHashApplied.current = true;
    const target = Number(new URLSearchParams(window.location.hash.slice(1)).get('p'));
    if (target >= 1 && target <= pdf.numPages) jumpTo(target);
    else window.history.replaceState(null, '', '#p=1');
  }, [pdf, isWide]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goForward();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    if (!initialHashApplied.current) return;
    window.history.replaceState(null, '', `#p=${page}`);
  }, [page]);

  return (
    <div className="min-h-screen bg-[#F5EEE5] px-3 py-5 text-[#2A1636] sm:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/magazine" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C3A21] hover:underline">
            <ArrowLeft className="h-4 w-4" /> All magazines
          </Link>
          {issue && (
            <a href={pdfRoute(issueId, issue.pdfUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C3A21] hover:underline">
              Original PDF <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {loading ? (
          <div role="status" className="flex min-h-96 items-center justify-center gap-3 text-sm text-[#6B5E5A]">
            <Loader2 className="h-6 w-6 animate-spin text-[#7C3A21]" /> Opening magazine...
          </div>
        ) : error || !issue || !pdf ? (
          <div role="alert" className="rounded-2xl border border-[#E7D7E8] bg-white p-10 text-center text-sm text-red-700">
            {error || 'This magazine is unavailable.'}
          </div>
        ) : (
          <>
            <header className="mb-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#9A5B20]">Prabasi Odia Magazine</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{issue.title}</h1>
              {issue.description && <p className="mx-auto mt-2 max-w-2xl text-sm text-[#6B5E5A]">{issue.description}</p>}
            </header>

            <div
              className="mx-auto max-w-6xl [perspective:1800px]"
              onTouchStart={(event) => {
                touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
              }}
              onTouchEnd={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start) return;
                const dx = event.changedTouches[0].clientX - start.x;
                const dy = event.changedTouches[0].clientY - start.y;
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                  if (dx < 0) goForward(); else goBack();
                }
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${isWide}-${page}`}
                  initial={reduceMotion ? false : { opacity: 0, rotateY: direction * -12, x: direction * 36 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, rotateY: direction * 12, x: direction * -36 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeInOut' }}
                  className="relative mx-auto flex w-full overflow-hidden rounded-md border border-[#D8C8B6] bg-[#FFFCF7] shadow-[0_18px_48px_rgba(70,45,29,0.25)]"
                  style={{ aspectRatio: isWide ? (issue.pageRatio || 0.707) * 2 : issue.pageRatio || 0.707 }}
                >
                  {isWide && (
                    <div className="relative h-full w-1/2 border-r border-[#D8C8B6] bg-[#FAF4EA]">
                      {page > 1 && <PdfPage pdf={pdf} number={page} />}
                    </div>
                  )}
                  <div className={`relative h-full ${isWide ? 'w-1/2' : 'w-full'} bg-[#FFFCF7]`}>
                    {(isWide ? (page === 1 ? 1 : page + 1) : page) <= count && (
                      <PdfPage pdf={pdf} number={isWide ? (page === 1 ? 1 : page + 1) : page} />
                    )}
                  </div>
                  {isWide && <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10" aria-hidden="true" />}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3 sm:justify-between">
              <button type="button" onClick={goBack} disabled={!canGoBack} className="inline-flex items-center gap-2 rounded-xl border border-[#D8C8B6] bg-white px-4 py-2.5 text-sm font-semibold text-[#7C3A21] disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <div className="flex items-center gap-2 text-sm text-[#6B5E5A]">
                <span>{page === lastVisible ? `Page ${page}` : `Pages ${page}–${lastVisible}`} of {count}</span>
                <label className="sr-only" htmlFor="magazine-page-jump">Jump to page</label>
                <select
                  id="magazine-page-jump"
                  value={page}
                  onChange={(event) => jumpTo(Number(event.target.value))}
                  className="rounded-lg border border-[#D8C8B6] bg-white px-2 py-1 text-xs text-[#2A1636]"
                >
                  {stops.map((stop) => (
                    <option key={stop} value={stop}>
                      {isWide && stop > 1 ? `Pages ${stop}–${Math.min(stop + 1, count)}` : `Page ${stop}`}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={goForward} disabled={!canGoForward} className="inline-flex items-center gap-2 rounded-xl bg-[#7C3A21] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-[#8C7667]">Swipe or use the arrow keys to turn pages.</p>
          </>
        )}
      </div>
    </div>
  );
}
