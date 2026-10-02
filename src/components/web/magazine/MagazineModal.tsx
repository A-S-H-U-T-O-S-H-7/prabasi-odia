'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { MagazineIssue } from '@/lib/services/magazineService';
import MagazineReader from './MagazineReader';
import styles from './magazineModal.module.css';

export default function MagazineModal({ issue, onClose }: { issue: MagazineIssue; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.backdrop} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panel} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="magazine-modal-title">
        <div className={styles.modalHeader}>
          <h2 id="magazine-modal-title">{issue.title}</h2>
          <button ref={closeButton} type="button" onClick={onClose} className={styles.closeButton} aria-label="Close magazine">
            <X size={22} />
          </button>
        </div>
        <MagazineReader issueId={issue.id} initialIssue={issue} embedded />
      </div>
    </div>,
    document.body
  );
}
