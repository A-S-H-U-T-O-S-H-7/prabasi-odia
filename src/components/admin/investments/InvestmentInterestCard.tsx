'use client';

import { useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import type { InvestmentInterest, InvestmentInterestDetails } from '@/lib/investments/types';

const date = (value: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const inputClass = 'mt-1.5 w-full rounded-xl border border-[#e1d6db] bg-white px-3 py-2.5 text-sm text-[#281b34] outline-none focus:border-[#6b1e5b] focus:ring-2 focus:ring-[#6b1e5b]/10';

export default function InvestmentInterestCard({ interest, busy, onStatus, onSave }: {
  interest: InvestmentInterest;
  busy: boolean;
  onStatus: (interest: InvestmentInterest, status: InvestmentInterest['status']) => void;
  onSave: (interest: InvestmentInterest, details: InvestmentInterestDetails) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const details: InvestmentInterestDetails = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      location: String(form.get('location') || '').trim(),
      message: String(form.get('message') || '').trim(),
    };
    setError('');
    try { await onSave(interest, details); setEditing(false); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save the response.'); }
  };

  return <article className="rounded-2xl border border-[#eadfdb] bg-white p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><strong className="text-sm">{interest.name}</strong><p className="mt-1 text-xs text-[#756b72]">{interest.location} · {date(interest.createdAt)}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => { setError(''); setEditing(value => !value); }} disabled={busy} aria-expanded={editing} className="inline-flex items-center gap-1.5 rounded-lg border border-[#e1d6db] px-3 py-2 text-xs font-semibold text-[#6b1e5b] transition hover:bg-[#faf5f8] disabled:opacity-50"><Pencil size={13} />{editing ? 'Cancel edit' : 'Edit details'}</button>
        <select aria-label={`Status for ${interest.name}`} value={interest.status} disabled={busy} onChange={event => onStatus(interest, event.target.value as InvestmentInterest['status'])} className="rounded-lg border border-[#e1d6db] bg-white px-3 py-2 text-xs capitalize disabled:opacity-50"><option value="new">New</option><option value="reviewed">Reviewed</option><option value="contacted">Contacted</option></select>
      </div>
    </div>
    {editing ? <form onSubmit={save} className="mt-4 space-y-4 border-t border-[#f0e8e8] pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold text-[#55485a]">Name<input name="name" defaultValue={interest.name} required minLength={2} maxLength={100} className={inputClass} /></label>
        <label className="text-xs font-semibold text-[#55485a]">Email<input name="email" type="email" defaultValue={interest.email} required maxLength={200} className={inputClass} /></label>
        <label className="text-xs font-semibold text-[#55485a]">Phone<input name="phone" type="tel" defaultValue={interest.phone} required minLength={7} maxLength={25} className={inputClass} /></label>
        <label className="text-xs font-semibold text-[#55485a]">Location<input name="location" defaultValue={interest.location} required minLength={2} maxLength={160} className={inputClass} /></label>
      </div>
      <label className="block text-xs font-semibold text-[#55485a]">Message<textarea name="message" defaultValue={interest.message} required minLength={10} maxLength={3000} rows={4} className={inputClass} /></label>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <div className="flex justify-end"><button type="submit" disabled={busy} className="rounded-xl bg-[#6b1e5b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#531547] disabled:opacity-50">{busy ? 'Saving...' : 'Save changes'}</button></div>
    </form> : <><div className="mt-3 flex flex-wrap gap-3 text-xs"><a href={`mailto:${interest.email}`} className="break-all font-semibold text-[#6b1e5b] underline">{interest.email}</a><a href={`tel:${interest.phone}`} className="font-semibold text-[#6b1e5b] underline">{interest.phone}</a></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#635a63]">{interest.message}</p></>}
  </article>;
}
