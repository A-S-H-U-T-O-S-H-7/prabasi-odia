'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HeartHandshake, Upload, X } from 'lucide-react';
import { URGENT_HELP_CATEGORIES } from '@/lib/services/urgentHelpService';
import { URGENT_HELP_MEDIA_ACCEPT, URGENT_HELP_MEDIA_HINT } from '@/lib/urgentHelpMedia';

type Props = {
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  error: string;
  name?: string;
  email?: string;
};

export default function UrgentHelpForm({ onClose, onSubmit, submitting, error, name = '', email = '' }: Props) {
  useEffect(() => {
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prior; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="urgent-help-form-title" className="flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E7D7E8] bg-[#FFF9F2] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E7D7E8] p-5 sm:px-7">
          <div>
            <p className="text-xs font-semibold text-[#B45337]">Request community support</p>
            <h2 id="urgent-help-form-title" className="mt-1 text-xl font-bold text-[#2A1636] sm:text-2xl">How can we help?</h2>
            <p className="mt-2 text-xs leading-5 text-[#6B5E5A]">An admin reviews every request before it is shared publicly.</p>
          </div>
          <button type="button" disabled={submitting} onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-[#6B5E5A] hover:bg-[#E7D7E8]/50 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7">
          {error && <p role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form id="urgent-help-form" onSubmit={onSubmit} className="space-y-5">
            <div className="flex gap-3 rounded-xl bg-[#FFF0EA] p-4 text-xs leading-6 text-[#704235]"><HeartHandshake className="mt-1 h-5 w-5 shrink-0 text-[#B45337]" /><p>For immediate danger or a medical emergency, contact local emergency services first. This page is reviewed by our team and is not a live emergency hotline.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Request title *<input name="title" required minLength={5} maxLength={120} className="rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal outline-none focus:border-[#B45337]" placeholder="e.g. Blood donors needed" /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Type of help *<select name="category" className="rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal outline-none focus:border-[#B45337]">{URGENT_HELP_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Location *<input name="location" required minLength={2} maxLength={160} className="rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal outline-none focus:border-[#B45337]" placeholder="City and area where help is needed" /></label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Tell the community what is needed *<textarea name="message" required minLength={30} maxLength={6000} rows={5} className="resize-y rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal outline-none focus:border-[#B45337]" placeholder="Explain the situation, what help is needed, and any important time-sensitive details." /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Contact name *<input name="contactName" required minLength={2} maxLength={100} defaultValue={name} className="rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal outline-none focus:border-[#B45337]" /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Contact phone *<input name="phone" type="tel" required minLength={7} maxLength={25} className="rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 font-normal outline-none focus:border-[#B45337]" placeholder="Include country code" /></label>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#2A1636]">Account email<input value={email} readOnly className="cursor-not-allowed rounded-xl border border-[#D4C8C0] bg-[#F7F2EE] px-4 py-3 font-normal text-[#6B5E5A] outline-none" placeholder="Your signed-in account has no email" /><small className="font-normal text-xs leading-5 text-[#6B5E5A]">Fetched from your signed-in account and shared with admins for follow-up.</small></label>
            <label className="flex flex-col gap-2 rounded-xl border border-dashed border-[#D4C8C0] bg-white p-4 text-sm font-semibold text-[#2A1636]"><span className="inline-flex items-center gap-2"><Upload className="h-4 w-4" /> Photos or videos (optional)</span><input name="media" type="file" multiple accept={URGENT_HELP_MEDIA_ACCEPT} className="text-xs font-normal" /><small className="font-normal text-xs leading-5 text-[#6B5E5A]">{URGENT_HELP_MEDIA_HINT}</small></label>
            <label className="flex items-start gap-3 text-xs leading-6 text-[#6B5E5A]"><input name="consent" type="checkbox" required className="mt-1 accent-[#B45337]" /><span>I have permission to share this information and media. I understand approved media and location will be visible publicly.</span></label>
          </form>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7"><button type="button" disabled={submitting} onClick={onClose} className="rounded-xl border border-[#E7D7E8] px-5 py-2.5 text-sm font-semibold text-[#6B5E5A]">Cancel</button><button type="submit" form="urgent-help-form" disabled={submitting} className="rounded-xl bg-[#B45337] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#923A22] disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit for review'}</button></div>
      </div>
    </div>,
    document.body,
  );
}
