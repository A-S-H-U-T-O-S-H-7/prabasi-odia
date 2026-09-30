'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { CULTURAL_ART_FORMS, INDIAN_STATES, TRAVEL_SCOPES, type CulturalTeam, type TravelScope } from '@/lib/culturalTeams/types';
import { availability } from './CulturalTeamCard';

const field = 'mt-1.5 w-full rounded-xl border border-[#e9dcd5] bg-white px-3.5 py-3 text-sm text-[#382333] outline-none transition focus:border-[#ad6659] focus:ring-2 focus:ring-[#ad6659]/15';
const scopeLabel: Record<TravelScope, string> = { states: 'Selected states', national: 'Across India', international: 'International' };

type Mode = 'register' | 'detail' | 'enquiry';
interface CulturalTeamDialogProps {
  mode: Mode;
  selected: CulturalTeam | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  userName: string;
  userEmail: string;
  files: File[];
  scopes: TravelScope[];
  states: string[];
  busy: boolean;
  uploadProgress: string;
  error: string;
  onClose: () => void;
  onMode: (mode: Mode) => void;
  onRegister: (event: React.FormEvent<HTMLFormElement>) => void;
  onEnquire: (event: React.FormEvent<HTMLFormElement>) => void;
  onFiles: (files: File[]) => void;
  onScopes: (scopes: TravelScope[]) => void;
  onStates: (states: string[]) => void;
  onError: (message: string) => void;
}

export default function CulturalTeamDialog(props: CulturalTeamDialogProps) {
  const {
    mode, selected, isAuthenticated, authLoading, userName, userEmail, files, scopes, states,
    busy, uploadProgress, error, onClose, onMode, onRegister, onEnquire, onFiles, onScopes,
    onStates, onError,
  } = props;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#241b2b]/70 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="cultural-dialog-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-[#fdf9f5] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#efdfd8] bg-white p-5 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#aa6555]">
              {mode === 'register' ? 'Join the directory' : mode === 'enquiry' ? 'Program enquiry' : selected?.artForm}
            </p>
            <h2 id="cultural-dialog-title" className="mt-1 text-2xl font-bold text-[#382333]">
              {mode === 'register' ? 'Register your cultural team' : mode === 'enquiry' ? `Contact ${selected?.name}` : selected?.name}
            </h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-full border border-[#efdfd8] p-2 transition hover:bg-[#fbf5f1] disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">
          {mode === 'detail' && selected && (
            <>
              {selected.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-xl">
                  {selected.images.map((image, index) => (
                    <img key={image.path} src={image.url} alt={`${selected.name} performance ${index + 1}`} className={`h-28 w-full object-cover sm:h-40 ${index === 0 ? 'col-span-2 row-span-2 h-full' : ''}`} />
                  ))}
                </div>
              )}
              <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[#6f5964]">{selected.description}</p>
              <div className="mt-5 grid gap-3 rounded-xl bg-white p-5 text-sm sm:grid-cols-2">
                <p><span className="block text-xs text-[#99838b]">Based in</span><strong>{selected.baseCity}, {selected.baseState}, {selected.baseCountry}</strong></p>
                <p><span className="block text-xs text-[#99838b]">Team size</span><strong>{selected.memberCount} members</strong></p>
                <p><span className="block text-xs text-[#99838b]">Languages</span><strong>{selected.languages}</strong></p>
                <p><span className="block text-xs text-[#99838b]">Available for programs</span><strong>{availability(selected)}</strong></p>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#806f75]">Enquiries go to our coordination team. The team&apos;s private contact details are not shown publicly.</p>
              <button type="button" onClick={() => onMode('enquiry')} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8a465b] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#71374c]">
                Enquire for a program <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {mode === 'register' && (!isAuthenticated && !authLoading ? (
            <div className="rounded-xl bg-white p-8 text-center">
              <h3 className="font-semibold">Sign in to register a team</h3>
              <p className="mt-2 text-sm text-[#806f75]">Your account lets you see the application status after submission.</p>
              <Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white">Sign in</Link>
            </div>
          ) : (
            <form onSubmit={onRegister} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold">Team name *<input name="name" required minLength={3} maxLength={120} className={field} /></label>
                <label className="text-xs font-semibold">Art form *<select name="artForm" required className={field}>{CULTURAL_ART_FORMS.map(value => <option key={value}>{value}</option>)}</select></label>
                <label className="text-xs font-semibold">Number of members *<input name="memberCount" type="number" min={1} max={500} required className={field} /></label>
                <label className="text-xs font-semibold">Languages performed in *<input name="languages" required maxLength={160} placeholder="Odia, Hindi, English" className={field} /></label>
                <label className="text-xs font-semibold">Base city *<input name="baseCity" required maxLength={100} className={field} /></label>
                <label className="text-xs font-semibold">Base state / region *<input name="baseState" required maxLength={100} className={field} /></label>
                <label className="text-xs font-semibold sm:col-span-2">Base country *<input name="baseCountry" required maxLength={100} defaultValue="India" className={field} /></label>
              </div>
              <label className="block text-xs font-semibold">About the team and performances *<textarea name="description" required minLength={40} maxLength={4000} rows={4} placeholder="Tell organisers about your art, experience and the kinds of programs you perform" className={field} /></label>
              <fieldset>
                <legend className="text-sm font-bold">Where can your team perform? *</legend>
                <p className="mt-1 text-xs text-[#806f75]">Select every option that applies.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TRAVEL_SCOPES.map(value => (
                    <label key={value} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold ${scopes.includes(value) ? 'border-[#a45b5c] bg-[#fbede9] text-[#8a465b]' : 'border-[#e9dcd5] bg-white'}`}>
                      <input type="checkbox" checked={scopes.includes(value)} onChange={() => onScopes(scopes.includes(value) ? scopes.filter(item => item !== value) : [...scopes, value])} className="accent-[#8a465b]" />{scopeLabel[value]}
                    </label>
                  ))}
                </div>
                {scopes.includes('states') && (
                  <div className="mt-4 rounded-xl border border-[#efdfd8] bg-white p-4">
                    <p className="text-xs font-semibold">Select available Indian states and territories *</p>
                    <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2">
                      {INDIAN_STATES.map(value => <label key={value} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={states.includes(value)} onChange={() => onStates(states.includes(value) ? states.filter(item => item !== value) : [...states, value])} className="accent-[#8a465b]" />{value}</label>)}
                    </div>
                  </div>
                )}
              </fieldset>
              <fieldset>
                <legend className="text-sm font-bold">Team photos * <span className="font-normal text-[#806f75]">(1–10 images, max 5 MB each)</span></legend>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => {
                  const incoming = Array.from(event.target.files || []);
                  event.target.value = '';
                  if (files.length + incoming.length > 10) { onError('You can select up to 10 images.'); return; }
                  if (incoming.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024)) { onError('Each image must be JPG, PNG or WebP and under 5 MB.'); return; }
                  onError(''); onFiles([...files, ...incoming]);
                }} className="mt-3 block w-full rounded-xl border border-dashed border-[#d8bfb8] bg-white p-4 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#f7e7df] file:px-3 file:py-2 file:font-semibold file:text-[#8a465b]" />
                <p className="mt-2 text-xs text-[#806f75]">{files.length} of 10 selected</p>
                {files.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{files.map((file, index) => <ImageThumb key={`${file.name}-${index}`} file={file} onRemove={() => onFiles(files.filter((_, item) => item !== index))} />)}</div>}
              </fieldset>
              <div className="rounded-xl bg-white p-5">
                <h3 className="text-sm font-bold">Private team contact</h3>
                <p className="mt-1 text-xs text-[#806f75]">Only admins use these details to coordinate enquiries.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold">Contact person *<input name="contactName" required maxLength={100} defaultValue={userName} className={field} /></label>
                  <label className="text-xs font-semibold">Email *<input name="email" type="email" required maxLength={200} defaultValue={userEmail} className={field} /></label>
                  <label className="text-xs font-semibold sm:col-span-2">Phone with country code *<input name="phone" type="tel" required maxLength={25} placeholder="+91 98765 43210" className={field} /></label>
                </div>
              </div>
              <label className="flex gap-3 rounded-xl bg-[#f7eee9] p-4 text-xs leading-5"><input type="checkbox" required className="mt-1 accent-[#8a465b]" /><span>I confirm I can represent this team, and I consent to publishing the team profile and selected photos after admin approval.</span></label>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              {uploadProgress && <p role="status" className="text-sm font-semibold text-[#8a465b]">{uploadProgress}</p>}
              <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-[#e9dcd5] px-4 py-3 text-sm font-semibold">Cancel</button><button type="submit" disabled={busy} className="rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Submitting...' : 'Submit for approval'}</button></div>
            </form>
          ))}

          {mode === 'enquiry' && selected && (
            <form onSubmit={onEnquire} className="space-y-5">
              <p className="rounded-xl bg-[#f7eee9] p-4 text-xs leading-5 text-[#795d64]">Tell us about your program. Our team will review the enquiry and coordinate with {selected.name}; their private contact details remain with us.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold">Your name / organisation *<input name="organiserName" required maxLength={100} className={field} /></label>
                <label className="text-xs font-semibold">Email *<input name="email" type="email" required maxLength={200} className={field} /></label>
                <label className="text-xs font-semibold">Phone with country code *<input name="phone" type="tel" required maxLength={25} className={field} /></label>
                <label className="text-xs font-semibold">Program type *<input name="eventType" required maxLength={120} placeholder="Festival, wedding, community event..." className={field} /></label>
                <label className="text-xs font-semibold">Tentative date<input name="eventDate" type="date" className={field} /></label>
                <label className="text-xs font-semibold">Program location *<input name="eventLocation" required maxLength={180} placeholder="City, state, country" className={field} /></label>
              </div>
              <label className="block text-xs font-semibold">Program details *<textarea name="message" required minLength={20} maxLength={2000} rows={4} placeholder="Expected audience, program duration, requirements, and anything else we should know" className={field} /></label>
              <label className="flex gap-3 rounded-xl bg-[#f7eee9] p-4 text-xs leading-5"><input type="checkbox" required className="mt-1 accent-[#8a465b]" /><span>I consent to the coordination team using these details to respond to my enquiry and coordinate with the selected cultural team.</span></label>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-2"><button type="button" onClick={() => onMode('detail')} disabled={busy} className="rounded-xl border border-[#e9dcd5] px-4 py-3 text-sm font-semibold">Back</button><button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Sending...' : 'Send enquiry'}</button></div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ImageThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f7eee9]">
      {url && <img src={url} alt={file.name} className="h-full w-full object-cover" />}
      <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`} className="absolute right-1 top-1 rounded-full bg-white p-1 shadow"><X className="h-3 w-3" /></button>
    </div>
  );
}
