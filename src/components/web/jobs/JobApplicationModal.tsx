'use client';

import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { ArrowRight, FileText, ShieldCheck, X } from 'lucide-react';
import { type Job } from '@/lib/services/jobsService';

export default function JobApplicationModal({ job, onClose, onSubmit, submitting, error, name = '', email = '' }: {
  job: Job; onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean; error: string; name?: string; email?: string;
}) {
  const [fileError, setFileError] = useState('');
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !submitting) onClose(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [onClose, submitting]);
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="job-application-title" className="flex max-h-[calc(100dvh-32px)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#E7D7E8] bg-[#FFF9F2] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E7D7E8] p-5 sm:px-7">
          <div><p className="text-xs font-semibold text-[#8A2E72]">Your next opportunity</p><h2 id="job-application-title" className="mt-1 text-xl font-bold text-[#2A1636] sm:text-2xl">Express your interest</h2><p className="mt-2 text-xs leading-5 text-[#6B5E5A]">{job.title} / {job.company} / {job.location}</p></div>
          <button type="button" autoFocus disabled={submitting} onClick={onClose} aria-label="Close dialog" className="shrink-0 rounded-lg p-2 text-[#6B5E5A] hover:bg-[#E7D7E8]/50 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7">
          {(error || fileError) && <p role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{fileError || error}</p>}
          <form id="job-application-form" onSubmit={onSubmit} className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-[#F4E8F1] p-4 text-xs leading-6 text-[#6B5E5A]"><ShieldCheck className="mt-1 shrink-0" size={19} /><p>Your contact details and resume are shared with the poster and authorized admins.</p></div>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Your name *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="name" required minLength={2} maxLength={100} defaultValue={name} autoComplete="name" /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Email *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="email" required type="email" maxLength={200} defaultValue={email} autoComplete="email" /></label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Phone *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="phone" required minLength={7} maxLength={25} type="tel" autoComplete="tel" placeholder="Include country code" /></label>
            </div>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">A note to the poster<textarea className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="note" maxLength={3000} rows={4} placeholder="Introduce yourself, your experience and availability." /></label>
            <label className="flex flex-col gap-3 rounded-xl border border-dashed border-[#D4C8C0] bg-white p-4 text-sm font-semibold text-[#2A1636]"><span className="inline-flex items-center gap-2"><FileText size={18} /> Resume (optional)</span><input name="resume" type="file" accept="application/pdf,.doc,.docx" onChange={event => {
              setFileError(''); const file = event.target.files?.[0];
              if (file && (file.size > 5 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(file.name))) setFileError('Choose a PDF, DOC or DOCX file up to 5 MB.');
            }} /><small className="font-normal text-xs leading-5 text-[#6B5E5A]">PDF, DOC or DOCX, up to 5 MB.</small></label>
            <label className="flex items-start gap-3 text-xs leading-6 text-[#6B5E5A]"><input name="consent" type="checkbox" required className="mt-1 shrink-0 accent-[#6B1E5B]" /><span>I agree to share my details and resume for this opportunity.</span></label>
          </form>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7">
          <button type="button" disabled={submitting} onClick={onClose} className="rounded-xl border border-[#E7D7E8] px-5 py-2.5 text-sm font-semibold text-[#6B5E5A] hover:bg-[#FFF9F2] disabled:opacity-50">Cancel</button>
          <button type="submit" form="job-application-form" disabled={submitting || !!fileError} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B1E5B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#531547] disabled:opacity-50">{submitting ? 'Sending...' : 'Send my interest'}<ArrowRight size={16} /></button>
        </div>
      </div>
    </div>, document.body,
  );
}
