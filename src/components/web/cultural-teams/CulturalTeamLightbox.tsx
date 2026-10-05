'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { CulturalTeamImage } from '@/lib/culturalTeams/types';

interface CulturalTeamLightboxProps {
  images: CulturalTeamImage[];
  teamName: string;
  index: number;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function CulturalTeamLightbox({ images, teamName, index, onPrevious, onNext, onClose }: CulturalTeamLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => previousFocus?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') { event.preventDefault(); onPrevious(); }
      if (event.key === 'ArrowRight') { event.preventDefault(); onNext(); }
      if (event.key === 'Tab') {
        const controls = [closeRef.current, ...document.querySelectorAll<HTMLButtonElement>('[data-lightbox-navigation]')].filter((button): button is HTMLButtonElement => Boolean(button));
        const current = controls.indexOf(document.activeElement as HTMLButtonElement);
        if (event.shiftKey && current === 0) { event.preventDefault(); controls.at(-1)?.focus(); }
        if (!event.shiftKey && current === controls.length - 1) { event.preventDefault(); controls[0]?.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, onNext, onPrevious]);

  if (typeof document === 'undefined' || !images[index]) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${teamName} photo viewer`}
      className="fixed inset-0 z-[1100] flex flex-col bg-[#17101b]/95 px-3 py-4 text-white sm:px-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{teamName}</p>
          <p className="mt-0.5 text-xs text-white/65">Photo {index + 1} of {images.length}</p>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close photo viewer" className="cursor-pointer rounded-full border border-white/25 bg-white/10 p-2.5 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 items-center justify-center py-5 sm:px-16">
        <img src={images[index].url} alt={`${teamName} performance photo ${index + 1}`} className="max-h-full max-w-full object-contain shadow-2xl" />
        {images.length > 1 && (
          <>
            <button data-lightbox-navigation type="button" onClick={onPrevious} aria-label="Previous photo" className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-[#241b2b]/80 p-2.5 transition hover:bg-[#713d55] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-3">
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
            <button data-lightbox-navigation type="button" onClick={onNext} aria-label="Next photo" className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-[#241b2b]/80 p-2.5 transition hover:bg-[#713d55] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-3">
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <p className="text-center text-xs text-white/60">{images.length > 1 ? 'Use the arrow keys to browse photos' : 'Press Escape to close'}</p>
    </div>,
    document.body,
  );
}
