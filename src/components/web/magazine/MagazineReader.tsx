'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowLeftRight, BookOpen, ChevronLeft, ChevronRight, ExternalLink, Hand, Loader2 } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { magazineService, type MagazineIssue } from '@/lib/services/magazineService';
import styles from './magazineReader.module.css';

const pdfRoute = (id: string, pdfUrl: string) =>
  `/api/magazines/${encodeURIComponent(id)}/pdf?url=${encodeURIComponent(pdfUrl)}`;
type FlipBook = import('page-flip').PageFlip;

function MagazineBook({ pdf, coverUrl, pageRatio, startPage, onPageChange, onReady, onEndAttempt }: {
  pdf: PDFDocumentProxy;
  coverUrl: string;
  pageRatio: number;
  startPage: number;
  onPageChange: (page: number) => void;
  onReady: (book: FlipBook | null) => void;
  onEndAttempt: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const changeRef = useRef(onPageChange);
  const readyRef = useRef(onReady);
  const endAttemptRef = useRef(onEndAttempt);
  changeRef.current = onPageChange;
  readyRef.current = onReady;
  endAttemptRef.current = onEndAttempt;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let book: FlipBook | null = null;
    const urls: string[] = [];
    const renders = new Map<number, Promise<void>>();
    const images: HTMLImageElement[] = [];
    const root = document.createElement('div');
    root.className = styles.flipRoot;
    host.appendChild(root);

    const renderPage = (number: number): Promise<void> => {
      if (number < 2 || number > pdf.numPages) return Promise.resolve();
      if (renders.has(number)) return renders.get(number)!;
      const task = (async () => {
        try {
          const page = await pdf.getPage(number);
          if (disposed) return;
          const original = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: 1200 / original.width });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas is unavailable');
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          if (disposed) return;
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
          if (!blob || disposed) return;
          const url = URL.createObjectURL(blob);
          urls.push(url);
          images[number - 1].src = url;
        } catch (reason) {
          if (!disposed) console.error(`Could not render magazine page ${number}`, reason);
        }
      })();
      renders.set(number, task);
      return task;
    };
    const prefetch = (index: number) => {
      for (let page = Math.max(2, index); page <= Math.min(pdf.numPages, index + 5); page++) void renderPage(page);
    };

    const mount = async () => {
      const { PageFlip } = await import('page-flip');
      if (disposed) return;
      const pages = Array.from({ length: pdf.numPages }, (_, index) => {
        const element = document.createElement('div');
        element.className = styles.flipPage;
        if (index === 0) element.dataset.density = 'hard';
        const image = document.createElement('img');
        image.alt = index === 0 ? 'Magazine cover' : `Magazine page ${index + 1}`;
        image.draggable = false;
        if (index === 0) image.src = coverUrl;
        images.push(image);
        element.appendChild(image);
        return element;
      });
      await Promise.all([2, 3, 4, startPage, startPage + 1].map(renderPage));
      if (disposed) return;
      const width = 440;
      book = new PageFlip(root, {
        width, height: Math.round(width / pageRatio), size: 'stretch',
        minWidth: 160, maxWidth: width, minHeight: Math.round(160 / pageRatio), maxHeight: Math.round(width / pageRatio),
        autoSize: true, usePortrait: true, showCover: true, drawShadow: true,
        flippingTime: 850, showPageCorners: false, disableFlipByClick: true,
        useMouseEvents: false, mobileScrollSupport: true, startPage: startPage - 1,
      });
      book.on('flip', (event) => { changeRef.current(event.data + 1); prefetch(event.data + 1); });
      book.loadFromHTML(pages);
      readyRef.current(book);
      prefetch(startPage);
    };
    void mount();

    let gesture: { id: number; x: number; y: number; active: boolean } | null = null;
    const position = (event: PointerEvent) => {
      const area = root.querySelector('.stf__block')?.getBoundingClientRect();
      return { x: event.clientX - (area?.left || 0), y: event.clientY - (area?.top || 0) };
    };
    const pointerDown = (event: PointerEvent) => {
      if (!book || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, active: false };
    };
    const pointerMove = (event: PointerEvent) => {
      if (!book || !gesture || event.pointerId !== gesture.id) return;
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (!gesture.active) {
        if (Math.abs(dx) < 12 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        const current = book.getCurrentPageIndex();
        const lastSpread = current === book.getPageCount() - 1 ||
          (book.getOrientation() === 'landscape' && current > 0 && current >= book.getPageCount() - 2);
        if (dx < 0 && lastSpread) {
          endAttemptRef.current();
          gesture = null;
          return;
        }
        if (dx > 0 && current === 0) return;
        const area = root.querySelector('.stf__block')?.getBoundingClientRect();
        if (!area) return;
        const middle = area.left + area.width / 2;
        if (book.getOrientation() === 'landscape' && ((dx < 0 && gesture.x < middle) || (dx > 0 && gesture.x > middle))) return;
        book.startUserTouch({ x: gesture.x - area.left, y: gesture.y - area.top });
        gesture.active = true;
        host.setPointerCapture(event.pointerId);
      }
      book.userMove(position(event), event.pointerType === 'touch');
      if (event.cancelable) event.preventDefault();
    };
    const pointerUp = (event: PointerEvent) => {
      if (!gesture || event.pointerId !== gesture.id) return;
      if (gesture.active && book) book.userStop(position(event));
      if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
      gesture = null;
    };
    host.addEventListener('pointerdown', pointerDown);
    host.addEventListener('pointermove', pointerMove);
    host.addEventListener('pointerup', pointerUp);
    host.addEventListener('pointercancel', pointerUp);
    return () => {
      disposed = true;
      readyRef.current(null);
      host.removeEventListener('pointerdown', pointerDown);
      host.removeEventListener('pointermove', pointerMove);
      host.removeEventListener('pointerup', pointerUp);
      host.removeEventListener('pointercancel', pointerUp);
      book?.destroy();
      root.remove();
      urls.forEach(URL.revokeObjectURL);
    };
  }, [pdf, coverUrl, pageRatio, startPage]);

  return <div ref={hostRef} className={styles.bookHost} aria-label="Drag a magazine page to turn it" />;
}

export default function MagazineReader({ issueId, initialIssue, embedded = false }: {
  issueId: string;
  initialIssue?: MagazineIssue;
  embedded?: boolean;
}) {
  const [issue, setIssue] = useState<MagazineIssue | null>(initialIssue || null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [initialPage, setInitialPage] = useState(1);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | null>(null);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const bookRef = useRef<FlipBook | null>(null);
  const endMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let task: ReturnType<typeof import('pdfjs-dist')['getDocument']> | null = null;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const found = initialIssue || await magazineService.getIssue(issueId);
        if (!found) throw new Error('This magazine could not be found.');
        if (cancelled) return;
        setIssue(found);
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        task = pdfjs.getDocument({ url: pdfRoute(issueId, found.pdfUrl) });
        const document = await task.promise;
        if (!cancelled) {
          const fromHash = embedded ? 1 : Number(new URLSearchParams(window.location.hash.slice(1)).get('p'));
          const first = Number.isInteger(fromHash) && fromHash >= 1 && fromHash <= document.numPages ? fromHash : 1;
          setInitialPage(first);
          setPage(first);
          setPdf(document);
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Could not open this magazine.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; void task?.destroy(); };
  }, [issueId, initialIssue, embedded]);

  useEffect(() => {
    if (!embedded && pdf) window.history.replaceState(null, '', `#p=${page}`);
  }, [page, embedded, pdf]);
  useEffect(() => () => {
    if (endMessageTimer.current) clearTimeout(endMessageTimer.current);
  }, []);
  const count = pdf?.numPages || 0;
  const visibleEnd = orientation === 'landscape' && page > 1 ? Math.min(page + 1, count) : page;
  const atEnd = count > 0 && visibleEnd >= count;
  const showEnd = () => {
    setShowEndMessage(true);
    if (endMessageTimer.current) clearTimeout(endMessageTimer.current);
    endMessageTimer.current = setTimeout(() => setShowEndMessage(false), 3500);
  };
  const nextPage = () => {
    if (atEnd) showEnd();
    else bookRef.current?.flipNext('bottom');
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)) return;
      if (event.key === 'ArrowRight') nextPage();
      if (event.key === 'ArrowLeft') bookRef.current?.flipPrev('bottom');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
  const onReady = (book: FlipBook | null) => {
    bookRef.current = book;
    if (book) {
      setOrientation(book.getOrientation());
      book.on('changeOrientation', (event) => setOrientation(event.data));
    } else setOrientation(null);
  };
  return (
    <main className={`${styles.reader} ${embedded ? styles.embedded : ''}`}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          {!embedded && <Link href="/magazine" className={styles.backLink}><ArrowLeft size={17} /> All magazines</Link>}
          {issue && <a href={pdfRoute(issueId, issue.pdfUrl)} target="_blank" rel="noopener noreferrer" className={styles.pdfLink}>Open original PDF <ExternalLink size={15} /></a>}
        </div>
        {loading ? <div className={styles.loading} role="status"><Loader2 className={styles.loadingIcon} /> Preparing the magazine...</div> : error || !issue || !pdf ? <div className={styles.error} role="alert">{error || 'This magazine is unavailable.'}</div> : (
          <>
            <header className={styles.heading}>
              <span className={styles.eyebrow}>Prabasi Odia · Digital magazine</span>
              <h1>{issue.title}</h1>
              <p>{new Date(`${issue.issueMonth}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} <span>·</span> {count} pages</p>
            </header>
            <section className={styles.bookStage} data-cover={page === 1} data-orientation={orientation} aria-label={`Read ${issue.title}`}>
              <button type="button" className={styles.sideTurn} disabled={!orientation || page <= 1} onClick={() => bookRef.current?.flipPrev('bottom')} aria-label="Turn to previous pages" title="Previous pages">
                <ChevronLeft size={27} aria-hidden="true" />
              </button>
              <MagazineBook pdf={pdf} coverUrl={issue.coverUrl} pageRatio={issue.pageRatio && issue.pageRatio > 0 ? issue.pageRatio : 0.707} startPage={initialPage} onPageChange={(number) => { setPage(number); setShowEndMessage(false); }} onReady={onReady} onEndAttempt={showEnd} />
              <button type="button" className={styles.sideTurn} data-ended={atEnd} disabled={!orientation} aria-disabled={atEnd} onClick={nextPage} aria-label={atEnd ? 'End of magazine' : 'Turn to next pages'} title={atEnd ? 'End of magazine' : 'Next pages'}>
                <ChevronRight size={27} aria-hidden="true" />
              </button>
            </section>
            <p className={`${styles.dragHint} ${showEndMessage ? styles.endMessage : ''}`} role="status" aria-live="polite">
              {showEndMessage ? <><BookOpen size={19} aria-hidden="true" /> You’ve reached the end of this magazine.</> : <><Hand size={19} aria-hidden="true" /><ArrowLeftRight size={20} aria-hidden="true" /> Drag a page to turn it</>}
            </p>
            <nav className={styles.controls} aria-label="Magazine pages">
              <button type="button" className={styles.previous} disabled={page <= 1} onClick={() => bookRef.current?.flipPrev('bottom')}><ChevronLeft size={18} /> Previous</button>
              <div className={styles.pagePosition} aria-live="polite">
                <span>{page === 1 ? `Cover · ${count} pages` : `Page ${page}${visibleEnd > page ? `-${visibleEnd}` : ''} of ${count}`}</span>
                <select aria-label="Jump to magazine page" value={page} onChange={(event) => { const target = Number(event.target.value); bookRef.current?.turnToPage(target - 1); setPage(target); }}>
                  {Array.from({ length: count }, (_, index) => <option key={index} value={index + 1}>{index === 0 ? 'Cover' : `Page ${index + 1}`}</option>)}
                </select>
              </div>
              <button type="button" className={styles.next} data-ended={atEnd} disabled={!orientation} aria-disabled={atEnd} onClick={nextPage}>{atEnd ? 'End' : 'Next'} <ChevronRight size={18} /></button>
            </nav>
            <p className={styles.hint}>Drag with your mouse or finger, or use the arrows beside the magazine.</p>
          </>
        )}
      </div>
    </main>
  );
}
