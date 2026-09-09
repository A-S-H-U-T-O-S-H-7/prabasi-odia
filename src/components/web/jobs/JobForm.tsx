'use client';

import { createPortal } from 'react-dom';
import { useEffect } from 'react';

import { ArrowRight, ShieldCheck, X } from 'lucide-react';
import { JOB_CATEGORIES } from '@/lib/services/jobsService';

export default function JobForm({ onClose, onSubmit, submitting, error, name = '', email = '' }: {
  onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean; error: string; name?: string; email?: string;
}) {
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
      <div role="dialog" aria-modal="true" aria-labelledby="job-post-title" className="flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#E7D7E8] bg-[#FFF9F2] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E7D7E8] p-5 sm:px-7">
          <div><p className="text-xs font-semibold text-[#8A2E72]">Share with the community</p><h2 id="job-post-title" className="mt-1 text-xl font-bold text-[#2A1636] sm:text-2xl">Post an opportunity</h2><p className="mt-2 text-xs leading-5 text-[#6B5E5A]">Your opportunity will be reviewed before it appears publicly.</p></div>
          <button type="button" autoFocus disabled={submitting} onClick={onClose} aria-label="Close dialog" className="shrink-0 rounded-lg p-2 text-[#6B5E5A] hover:bg-[#E7D7E8]/50 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7">
          {error && <p role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <form id="job-post-form" onSubmit={onSubmit} className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl bg-[#F4E8F1] p-4 text-xs leading-6 text-[#6B5E5A]"><ShieldCheck className="mt-1 shrink-0" size={19} /><p>Every opportunity is reviewed before publication. Your submission will be checked by the admin team.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Role or opportunity title *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="title" required minLength={5} maxLength={120} placeholder="e.g. Frontend developer" /></label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Company or startup *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="company" required minLength={2} maxLength={120} placeholder="Your organization's name" /></label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Opportunity type *<select className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="category" required>{JOB_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Location *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="location" required minLength={2} maxLength={160} placeholder="City, country or Remote" /></label>
            </div>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Salary or compensation <input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="compensation" maxLength={120} placeholder="e.g. INR 8–12 LPA, stipend or equity" /><small className="font-normal text-xs leading-5 text-[#6B5E5A]">Be clear about paid, unpaid or equity-based opportunities.</small></label>
            <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">About the opportunity *<textarea className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="description" required minLength={30} maxLength={6000} rows={5} placeholder="Describe the role, responsibilities, skills, experience and what your team offers." /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Contact name *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="contactName" required minLength={2} maxLength={100} defaultValue={name} autoComplete="name" /></label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#2A1636]">Contact email *<input className="w-full rounded-xl border border-[#D4C8C0] bg-white px-4 py-3 text-sm font-normal text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/10" name="contactEmail" type="email" required maxLength={200} defaultValue={email} autoComplete="email" /><small className="font-normal text-xs leading-5 text-[#6B5E5A]">Use an email address where interested applicants can reach you.</small></label>
            </div>
            <label className="flex items-start gap-3 text-xs leading-6 text-[#6B5E5A]"><input name="consent" type="checkbox" required className="mt-1 shrink-0 accent-[#6B1E5B]" /><span>I confirm this opportunity is accurate and agree to use applicants' details only for this opportunity.</span></label>
          </form>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7">
          <button type="button" disabled={submitting} onClick={onClose} className="rounded-xl border border-[#E7D7E8] px-5 py-2.5 text-sm font-semibold text-[#6B5E5A] hover:bg-[#FFF9F2] disabled:opacity-50">Cancel</button>
          <button type="submit" form="job-post-form" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B1E5B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#531547] disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit for review'}<ArrowRight size={16} /></button>
        </div>
      </div>
    </div>, document.body,
  );
}
