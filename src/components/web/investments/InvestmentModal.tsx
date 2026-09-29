'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, ShieldCheck, X } from 'lucide-react';
import { INVESTMENT_SECTORS, type Investment } from '@/lib/investments/types';

const field = 'block w-full min-w-0 rounded-xl border border-[#ded8d4] bg-white px-4 py-3 text-sm font-normal leading-5 text-[#241c32] outline-none transition focus:border-[#6b1e5b] focus:ring-2 focus:ring-[#6b1e5b]/10';
const control = `${field} h-12`;

export default function InvestmentModal({ mode, editor = 'member', post, name, email, location, busy, error, onClose, onSubmit }: {
  mode: 'post' | 'edit' | 'interest'; editor?: 'member' | 'admin'; post?: Investment; name: string; email: string; location: string; busy: boolean; error: string;
  onClose: () => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [busy, onClose]);

  return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#140e23]/65 p-3 backdrop-blur-sm sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div role="dialog" aria-modal="true" aria-labelledby="investment-modal-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] bg-[#fffaf6] shadow-[0_30px_100px_rgba(18,11,32,.35)] sm:max-h-[calc(100dvh-40px)]">
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eee5e1] px-5 py-5 sm:px-8 sm:py-6">
        <div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9a6839]">{mode === 'interest' ? 'Private response' : mode === 'edit' ? editor === 'admin' ? 'Admin update' : 'Pending post' : 'Share with verified members'}</p><h2 id="investment-modal-title" className="mt-1 font-serif text-2xl font-bold text-[#271736] sm:text-3xl">{mode === 'interest' ? 'I am interested' : mode === 'edit' ? 'Edit investment post' : 'Post an investment intent'}</h2><p className="mt-2 max-w-lg text-xs leading-5 text-[#756b72]">{mode === 'interest' ? `Your details for ${post?.name}'s investment will be visible to admins only.` : mode === 'edit' ? editor === 'admin' ? 'Updates to this approved post will appear to verified members immediately.' : 'You can update this post until an admin approves it.' : 'Your post will appear to verified members after admin approval.'}</p></div>
        <button type="button" autoFocus disabled={busy} onClick={onClose} aria-label="Close dialog" className="rounded-full border border-[#e9dfdb] bg-white p-2 text-[#756b72] transition hover:bg-[#f5ece8] disabled:opacity-50"><X size={18} /></button>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
        {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form id="investment-form" onSubmit={onSubmit} className="space-y-5">
          <div className="flex gap-3 rounded-2xl bg-[#edf5f5] p-4 text-xs leading-6 text-[#345761]"><ShieldCheck size={19} className="mt-0.5 shrink-0" /><p>{mode === 'interest' ? 'Your response is saved under this investment for the admin team to review. It will not appear on the member page.' : mode === 'edit' ? editor === 'admin' ? 'Review these changes carefully. The approved post updates as soon as you save.' : 'Your edits will remain pending until the admin team approves the post.' : 'Share your investment plans clearly. The admin team reviews every post before members can see it.'}</p></div>
          {mode !== 'interest' ? <>
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Your name *<input name="name" required minLength={2} maxLength={100} defaultValue={post?.name || name} autoComplete="name" className={`${control} mt-2`} /></label>
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Sector *<select name="sector" required defaultValue={post?.sector || INVESTMENT_SECTORS[0]} className={`${control} mt-2`}>{INVESTMENT_SECTORS.map(item => <option key={item}>{item}</option>)}</select></label>
              <div className="min-w-0"><label htmlFor="investment-amount" className="block text-sm font-semibold text-[#30263a]">Investment amount *</label><div className="mt-2 grid min-w-0 grid-cols-[96px_minmax(0,1fr)] gap-2"><label htmlFor="investment-currency" className="sr-only">Currency</label><select id="investment-currency" name="currency" defaultValue={post?.currency || 'INR'} className={control}><option>INR</option><option>USD</option></select><input id="investment-amount" name="amount" type="number" inputMode="decimal" required min="1" max="1000000000000" step="any" defaultValue={post?.amount} placeholder="e.g. 500000" className={control} /></div></div>
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Your place *<input name="place" required minLength={2} maxLength={160} defaultValue={post?.place || location} placeholder="City, state or country" className={`${control} mt-2`} /></label>
            </div>
            <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Preferred investment location<input name="preferredLocation" maxLength={160} defaultValue={post?.preferredLocation || ''} placeholder="e.g. Bhubaneswar, Odisha or flexible" className={`${control} mt-2`} /></label>
            <label className="block text-sm font-semibold text-[#30263a]">Investment details *<textarea name="details" required minLength={30} maxLength={6000} rows={5} defaultValue={post?.details || ''} placeholder="Describe the kind of business, partnership or project you are looking to invest in." className={`${field} mt-2 resize-y`} /></label>
            {mode === 'post' && <label className="flex items-start gap-3 text-xs leading-5 text-[#756b72]"><input type="checkbox" required className="mt-1 accent-[#6b1e5b]" /><span>I confirm these details are accurate and understand that this post will be reviewed before publication.</span></label>}
          </> : <>
            <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2">
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Your name *<input name="name" required minLength={2} maxLength={100} defaultValue={name} autoComplete="name" className={`${control} mt-2`} /></label>
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Email *<input name="email" type="email" required maxLength={200} defaultValue={email} autoComplete="email" className={`${control} mt-2`} /></label>
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Phone *<input name="phone" type="tel" required minLength={7} maxLength={25} autoComplete="tel" placeholder="Include country code" className={`${control} mt-2`} /></label>
              <label className="block min-w-0 text-sm font-semibold text-[#30263a]">Your location *<input name="location" required minLength={2} maxLength={160} defaultValue={location} placeholder="City, state or country" className={`${control} mt-2`} /></label>
            </div>
            <label className="block text-sm font-semibold text-[#30263a]">Tell us about your interest *<textarea name="message" required minLength={10} maxLength={3000} rows={5} placeholder="Introduce yourself and explain how you would like to connect with this investment opportunity." className={`${field} mt-2 resize-y`} /></label>
            <label className="flex items-start gap-3 text-xs leading-5 text-[#756b72]"><input type="checkbox" required className="mt-1 accent-[#6b1e5b]" /><span>I agree to share these details with the admin team for this investment post.</span></label>
          </>}
        </form>
      </div>
      <div className="flex shrink-0 justify-end gap-3 border-t border-[#eee5e1] bg-white px-5 py-4 sm:px-8">
        <button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-[#e6dad8] px-4 py-2.5 text-sm font-semibold text-[#6b5e5a] transition hover:bg-[#faf3ef] disabled:opacity-50">Cancel</button>
        <button type="submit" form="investment-form" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#6b1e5b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#531547] disabled:opacity-50">{busy ? 'Saving...' : mode === 'post' ? 'Submit for review' : mode === 'edit' ? 'Save changes' : 'Send my interest'}<ArrowRight size={16} /></button>
      </div>
    </div>
  </div>, document.body);
}
