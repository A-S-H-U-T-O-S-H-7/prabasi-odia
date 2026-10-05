'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, Globe2, Images, Languages, Mail, MapPin, Phone, Users2, Wallet, X, ZoomIn } from 'lucide-react';
import type { CulturalTeam, CulturalTeamContact, CulturalTeamStatus } from '@/lib/culturalTeams/types';
import CulturalTeamLightbox from '@/components/web/cultural-teams/CulturalTeamLightbox';

const statusTone: Record<CulturalTeamStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
};

const availability = (team: CulturalTeam) => [
  team.travelScopes.includes('states') ? team.availableStates.join(', ') : '',
  team.travelScopes.includes('national') ? 'Across India' : '',
  team.travelScopes.includes('international') ? 'International' : '',
].filter(Boolean).join(' · ');

const formatDate = (value: string) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

interface CulturalTeamReviewDialogProps {
  team: CulturalTeam;
  contact: CulturalTeamContact | null;
  contactLoading: boolean;
  busy: boolean;
  error: string;
  onClose: () => void;
  onStatus: (status: CulturalTeamStatus, reason?: string) => void;
  onChooseHero: (imagePath: string) => void;
}

export default function CulturalTeamReviewDialog({ team, contact, contactLoading, busy, error, onClose, onStatus, onChooseHero }: CulturalTeamReviewDialogProps) {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#241b2b]/75 p-2 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="admin-review-title" className="flex max-h-[calc(100dvh-16px)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-[#fdf9f5] shadow-2xl sm:max-h-[calc(100dvh-40px)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#eadbd8] bg-white px-4 py-4 sm:px-8 sm:py-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#a65c52]">Team application</p>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusTone[team.status]}`}>{team.status}</span>
            </div>
            <h2 id="admin-review-title" className="mt-2 font-serif text-2xl font-bold text-[#382333] sm:text-3xl">{team.name}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#806f75]">
              <span>{team.artForm}</span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{team.baseCity}, {team.baseState}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close team review" className="cursor-pointer rounded-full border border-[#eadbd8] p-2.5 text-[#713d55] transition hover:bg-[#fbf5f1] disabled:cursor-not-allowed disabled:opacity-50">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-3 sm:p-8">
          <section aria-label="Team photos" className="rounded-2xl border border-[#eadbd8] bg-white p-3 sm:p-5">
            {team.images[0] ? (
              <button type="button" onClick={() => setPhotoIndex(0)} className="group relative block h-56 w-full cursor-pointer overflow-hidden rounded-xl bg-[#e9d5cf] text-left sm:h-80 lg:h-[380px]">
                <img src={team.images[0].url} alt={`${team.name} hero photo`} className="h-full w-full object-cover" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-[#713d55] shadow sm:bottom-4 sm:left-4"><ZoomIn className="h-4 w-4" aria-hidden="true" />View full photo</span>
                <span className="absolute right-3 top-3 rounded-full bg-[#713d55] px-3 py-1.5 text-xs font-bold text-white sm:right-4 sm:top-4">Current hero</span>
              </button>
            ) : (
              <div className="grid h-48 place-items-center rounded-xl bg-gradient-to-br from-[#ad6a66] to-[#713d55] text-white"><Images className="h-9 w-9" aria-hidden="true" /></div>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#382333]">Choose the hero photo</h3>
                <p className="mt-1 text-xs text-[#806f75]">The selected photo appears on the public card and first in the team gallery.</p>
              </div>
              <span className="text-xs font-semibold text-[#806f75]">{team.images.length} photos</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {team.images.map((image, index) => (
                <div key={image.path} className={`overflow-hidden rounded-xl border-2 bg-[#f7eee9] ${index === 0 ? 'border-[#8a465b]' : 'border-[#eadbd8]'}`}>
                  <button type="button" onClick={() => setPhotoIndex(index)} aria-label={`View photo ${index + 1}`} className="block h-24 w-full cursor-pointer bg-[#eee1dc] sm:h-28">
                    <img src={image.url} alt={`${team.name} photo ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChooseHero(image.path)}
                    disabled={busy || index === 0}
                    className={`flex w-full items-center justify-center gap-1 py-2 text-xs font-bold transition ${index === 0 ? 'cursor-default bg-[#f8ecf1] text-[#713d55]' : 'cursor-pointer bg-white text-[#8a465b] hover:bg-[#fbf2ef] disabled:cursor-not-allowed disabled:opacity-50'}`}
                  >
                    {index === 0 ? <><Check className="h-3.5 w-3.5" aria-hidden="true" />Hero photo</> : 'Set as hero'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,1fr)]">
            <section className="rounded-2xl border border-[#eadbd8] bg-white p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#a65c52]">The team</p>
              <h3 className="mt-2 font-serif text-xl font-bold text-[#382333]">About their performances</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6f5964]">{team.description}</p>
            </section>
            <section className="rounded-2xl border border-[#eadbd8] bg-white p-5 sm:p-6">
              <h3 className="font-serif text-lg font-bold text-[#382333]">Team details</h3>
              <dl className="mt-3 divide-y divide-[#f0e5e0] text-sm">
                <div className="flex gap-3 py-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" /><div><dt className="text-xs text-[#99838b]">Based in</dt><dd className="font-semibold">{team.baseCity}, {team.baseState}, {team.baseCountry}</dd></div></div>
                <div className="flex gap-3 py-3"><Users2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" /><div><dt className="text-xs text-[#99838b]">Team size</dt><dd className="font-semibold">{team.memberCount} members</dd></div></div>
                <div className="flex gap-3 py-3"><Languages className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" /><div><dt className="text-xs text-[#99838b]">Languages</dt><dd className="font-semibold">{team.languages}</dd></div></div>
                <div className="flex gap-3 py-3"><Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" /><div><dt className="text-xs text-[#99838b]">Available for programs</dt><dd className="font-semibold">{availability(team) || 'Not specified'}</dd></div></div>
                <div className="flex gap-3 py-3"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" /><div><dt className="text-xs text-[#99838b]">Registered</dt><dd className="font-semibold">{formatDate(team.createdAt)}</dd></div></div>
              </dl>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-[#eadbd8] bg-gradient-to-r from-[#fff5ef] to-[#f8eef2] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#a65c52]">Admin only</p>
            <h3 className="mt-2 font-serif text-xl font-bold text-[#382333]">Charge and team contact</h3>
            {contactLoading ? <p className="mt-4 text-sm text-[#806f75]">Loading private details...</p> : contact ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 sm:col-span-2"><p className="flex items-center gap-2 text-xs font-semibold text-[#806f75]"><Wallet className="h-4 w-4 text-[#a65c52]" aria-hidden="true" />Minimum performance charge, excluding travel and stay</p><p className="mt-1 text-lg font-bold text-[#713d55]">{contact.minimumCharge || 'Not provided'}</p><p className="mt-1 text-xs text-[#806f75]">For coordination only. Final charges can be negotiated based on distance, location, and program days.</p></div>
                <div className="rounded-xl bg-white p-4"><p className="text-xs text-[#99838b]">Contact person</p><p className="mt-1 font-semibold">{contact.contactName}</p></div>
                <div className="rounded-xl bg-white p-4"><p className="flex items-center gap-1 text-xs text-[#99838b]"><Mail className="h-3.5 w-3.5" aria-hidden="true" />Email</p><a href={`mailto:${contact.email}`} className="mt-1 block break-all font-semibold text-[#8a465b] hover:underline">{contact.email}</a></div>
                <div className="rounded-xl bg-white p-4"><p className="flex items-center gap-1 text-xs text-[#99838b]"><Phone className="h-3.5 w-3.5" aria-hidden="true" />Phone</p><a href={`tel:${contact.phone}`} className="mt-1 block font-semibold text-[#8a465b] hover:underline">{contact.phone}</a></div>
              </div>
            ) : <p className="mt-4 text-sm text-[#806f75]">Private contact details are unavailable.</p>}
          </section>

          <section className="mt-5 rounded-2xl border border-[#eadbd8] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a65c52]">Review</p><h3 className="mt-1 font-serif text-xl font-bold">Application decision</h3></div><span className="text-xs text-[#806f75]">Updated {formatDate(team.updatedAt)}</span></div>
            {team.rejectionReason && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Previous rejection reason: {team.rejectionReason}</p>}
            <label className="mt-4 block text-xs font-semibold">Reason for rejection<textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} maxLength={1000} rows={3} placeholder="Required when rejecting this team" className="mt-2 w-full rounded-xl border border-[#e5d8d5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8a465b]" /></label>
            {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => onStatus('pending')} disabled={busy || team.status === 'pending'} className="cursor-pointer rounded-xl border border-[#e9dcd5] px-4 py-2.5 text-xs font-bold transition hover:bg-[#f7eee9] disabled:cursor-not-allowed disabled:opacity-50">Move to pending</button>
              <button type="button" onClick={() => onStatus('rejected', rejectionReason)} disabled={busy} className="cursor-pointer rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">Reject</button>
              <button type="button" onClick={() => onStatus('approved')} disabled={busy || team.status === 'approved'} className="cursor-pointer rounded-xl bg-[#8a465b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#713d55] disabled:cursor-not-allowed disabled:opacity-50">Approve &amp; publish</button>
            </div>
            <p className="mt-4 break-all text-[11px] text-[#99838b]">Team ID: {team.id} · Owner ID: {team.ownerId}</p>
          </section>
        </div>
      </div>

      {photoIndex !== null && (
        <CulturalTeamLightbox
          images={team.images}
          teamName={team.name}
          index={photoIndex}
          onPrevious={() => setPhotoIndex((current) => current === null ? 0 : (current - 1 + team.images.length) % team.images.length)}
          onNext={() => setPhotoIndex((current) => current === null ? 0 : (current + 1) % team.images.length)}
          onClose={() => setPhotoIndex(null)}
        />
      )}
    </div>,
    document.body,
  );
}
