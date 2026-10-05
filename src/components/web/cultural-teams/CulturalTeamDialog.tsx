'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe2, Images, Languages, MapPin, Music2, Users2, Wallet, X } from 'lucide-react';
import { CULTURAL_ART_FORMS, INDIAN_STATES, type CulturalTeam, type TravelScope } from '@/lib/culturalTeams/types';
import { availability } from './CulturalTeamCard';
import CulturalTeamLightbox from './CulturalTeamLightbox';

const field = 'mt-1.5 w-full rounded-xl border border-[#e9dcd5] bg-white px-2.5 py-3 text-sm text-[#382333] outline-none transition focus:border-[#ad6659] focus:ring-2 focus:ring-[#ad6659]/15 sm:px-3.5';
const scopeLabel: Record<TravelScope, string> = { states: 'Select states', national: 'Across India', international: 'International' };
const scopeOrder: TravelScope[] = ['international', 'national', 'states'];
const languageOptions = ['Odia', 'Hindi', 'English', 'Bengali'];

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
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [otherLanguageSelected, setOtherLanguageSelected] = useState(false);

  const toggleScope = (value: TravelScope) => {
    if (value === 'states') {
      onScopes(scopes.includes('states')
        ? [...scopes.filter((scope) => scope !== 'states' && scope !== 'national'), 'national']
        : [...scopes.filter((scope) => scope !== 'national'), 'states']);
    } else if (value === 'national') {
      onScopes(scopes.includes('national')
        ? scopes.filter((scope) => scope !== 'national')
        : [...scopes.filter((scope) => scope !== 'states'), 'national']);
    } else {
      onScopes(scopes.includes('international')
        ? scopes.filter((scope) => scope !== 'international')
        : [...scopes, 'international']);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#241b2b]/70 p-2 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="cultural-dialog-title" className={`flex max-h-[calc(100dvh-24px)] w-full flex-col overflow-hidden rounded-3xl bg-[#fdf9f5] shadow-2xl ${mode === 'detail' ? 'max-w-6xl' : mode === 'register' ? 'max-w-5xl' : 'max-w-4xl'}`}>
        <div className="flex items-start justify-between gap-4 border-b border-[#efdfd8] bg-white p-4 sm:px-8 sm:py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#aa6555]">
              {mode === 'register' ? 'Join the directory' : mode === 'enquiry' ? 'Program enquiry' : selected?.artForm}
            </p>
            <h2 id="cultural-dialog-title" className="mt-1 text-2xl font-bold text-[#382333]">
              {mode === 'register' ? 'Register your cultural team' : mode === 'enquiry' ? `Contact ${selected?.name}` : selected?.name}
            </h2>
            {mode === 'detail' && selected && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#806f75]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {selected.baseCity}, {selected.baseState}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="cursor-pointer rounded-full border border-[#efdfd8] p-2 transition hover:bg-[#fbf5f1] disabled:cursor-not-allowed disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto p-3 sm:p-8">
          {mode === 'detail' && selected && (
            <>
              {selected.images.length > 0 ? (
                <div>
                  <button type="button" onClick={() => setLightboxIndex(0)} aria-label={`Open photo 1 of ${selected.images.length}`} className="group relative block h-60 w-full cursor-pointer overflow-hidden rounded-2xl bg-[#e9d5cf] text-left sm:h-80 lg:h-[380px]">
                    <img src={selected.images[0].url} alt={`${selected.name} performance photo 1`} className="h-full w-full object-cover" />
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#713d55] shadow-md sm:bottom-5 sm:left-5">
                      <Images className="h-4 w-4" aria-hidden="true" />
                      View photos · {selected.images.length}
                    </span>
                  </button>
                  {selected.images.length > 1 && (
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="More team photos">
                      {selected.images.slice(1).map((image, index) => (
                        <button key={image.path} type="button" onClick={() => setLightboxIndex(index + 1)} aria-label={`Open photo ${index + 2} of ${selected.images.length}`} className="h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-white bg-[#e9d5cf] shadow-sm transition hover:border-[#a65c52] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a465b] sm:h-24 sm:w-36">
                          <img src={image.url} alt={`${selected.name} performance photo ${index + 2}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#ad6a66] to-[#713d55] text-white">
                  <Music2 className="h-9 w-9" aria-hidden="true" />
                  <span className="mt-2 text-sm font-semibold">{selected.artForm}</span>
                </div>
              )}

              <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(290px,0.9fr)]">
                <section className="rounded-2xl border border-[#efdfd8] bg-white p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-[#aa6555]">Meet the performers</p>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-[#382333]">About the team</h3>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6f5964]">{selected.description}</p>
                </section>
                <aside className="rounded-2xl border border-[#efdfd8] bg-white p-5 sm:p-6">
                  <h3 className="font-serif text-lg font-bold text-[#382333]">At a glance</h3>
                  <dl className="mt-4 divide-y divide-[#f1e5df] text-sm">
                    <div className="flex gap-3 py-3 first:pt-0">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" />
                      <div><dt className="text-xs text-[#99838b]">Based in</dt><dd className="mt-0.5 font-semibold text-[#382333]">{selected.baseCity}, {selected.baseState}, {selected.baseCountry}</dd></div>
                    </div>
                    <div className="flex gap-3 py-3">
                      <Users2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" />
                      <div><dt className="text-xs text-[#99838b]">Team size</dt><dd className="mt-0.5 font-semibold text-[#382333]">{selected.memberCount} members</dd></div>
                    </div>
                    <div className="flex gap-3 py-3">
                      <Languages className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" />
                      <div><dt className="text-xs text-[#99838b]">Languages</dt><dd className="mt-0.5 font-semibold text-[#382333]">{selected.languages}</dd></div>
                    </div>
                    <div className="flex gap-3 pt-3">
                      <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" />
                      <div><dt className="text-xs text-[#99838b]">Available for programs</dt><dd className="mt-0.5 font-semibold text-[#382333]">{availability(selected) || 'Contact us for availability'}</dd></div>
                    </div>
                    <div className="flex gap-3 pt-3">
                      <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#a65c52]" aria-hidden="true" />
                      <div>
                        <dt className="text-xs text-[#99838b]">Minimum performance charge</dt>
                        <dd className="mt-0.5 font-semibold text-[#382333]">Ask for a quote</dd>
                      </div>
                    </div>
                  </dl>
                </aside>
              </div>
              <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#f7e9e4] to-[#f5edef] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <p className="max-w-xl text-sm leading-6 text-[#6f5964]">Planning a program? Send us the details and our coordination team will help you connect with {selected.name}. Private contact details stay with us.</p>
                <button type="button" onClick={() => onMode('enquiry')} className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#713d55] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#5c3048] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713d55]">
                  Enquire for a program <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (!isAuthenticated && !authLoading ? (
            <div className="rounded-xl bg-white p-8 text-center">
              <h3 className="font-semibold">Sign in to register a team</h3>
              <p className="mt-2 text-sm text-[#806f75]">Your account lets you see the application status after submission.</p>
              <Link href="/login" className="mt-5 inline-flex cursor-pointer rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white">Sign in</Link>
            </div>
          ) : (
            <form onSubmit={onRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                <label className="min-w-0 text-xs font-semibold">Team name *<input name="name" required minLength={3} maxLength={120} className={field} /></label>
                <label className="min-w-0 text-xs font-semibold">Art form *<select name="artForm" required className={field}>{CULTURAL_ART_FORMS.map(value => <option key={value}>{value}</option>)}</select></label>
                <label className="min-w-0 text-xs font-semibold">Number of members *<input name="memberCount" type="number" min={1} max={500} required className={field} /></label>
                <label className="min-w-0 text-xs font-semibold">Base city *<input name="baseCity" required maxLength={100} className={field} /></label>
                <label className="min-w-0 text-xs font-semibold">Base state / region *<input name="baseState" required maxLength={100} className={field} /></label>
                <label className="min-w-0 text-xs font-semibold">Base country *<input name="baseCountry" required maxLength={100} defaultValue="India" className={field} /></label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <fieldset className="min-w-0 rounded-xl border border-[#e9dcd5] bg-white px-3 py-4 sm:p-4">
                  <legend className="px-1 text-sm font-bold">Languages performed in *</legend>
                  <p className="mb-3 text-xs text-[#806f75]">Select all that apply.</p>
                  <div className="flex flex-wrap gap-2">
                    {languageOptions.map((language) => (
                      <label key={language} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e9dcd5] bg-[#fdf9f5] px-2.5 py-2 text-xs font-semibold text-[#713d55] sm:px-3">
                        <input type="checkbox" name="languages" value={language} className="cursor-pointer accent-[#8a465b]" />
                        {language}
                      </label>
                    ))}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e9dcd5] bg-[#fdf9f5] px-2.5 py-2 text-xs font-semibold text-[#713d55] sm:px-3">
                      <input type="checkbox" name="languages" value="Other" checked={otherLanguageSelected} onChange={(event) => setOtherLanguageSelected(event.target.checked)} className="cursor-pointer accent-[#8a465b]" />
                      Other
                    </label>
                  </div>
                  {otherLanguageSelected && <label className="mt-3 block text-xs font-semibold">Other language *<input name="otherLanguage" required maxLength={100} placeholder="Enter the language" className={field} /></label>}
                </fieldset>
                <fieldset className="min-w-0 rounded-xl border border-[#e9dcd5] bg-white px-3 py-4 sm:p-4">
                  <legend className="px-1 text-sm font-bold">Where can your team perform? *</legend>
                  <p className="mt-1 text-xs text-[#806f75]">If your team is available across India, you don&apos;t need to select individual states.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {scopeOrder.map(value => (
                      <label key={value} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2.5 text-xs font-semibold sm:px-4 ${scopes.includes(value) ? 'border-[#a45b5c] bg-[#fbede9] text-[#8a465b]' : 'border-[#e9dcd5] bg-white'}`}>
                        <input type="checkbox" checked={scopes.includes(value)} onChange={() => toggleScope(value)} className="cursor-pointer accent-[#8a465b]" />{scopeLabel[value]}
                      </label>
                    ))}
                  </div>
                  {scopes.includes('states') && (
                    <div className="mt-4 rounded-xl border border-[#efdfd8] bg-[#fdf9f5] p-3 sm:p-4">
                      <p className="text-xs font-semibold">Select available Indian states and territories *</p>
                      <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto sm:grid-cols-2">
                        {INDIAN_STATES.map(value => <label key={value} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={states.includes(value)} onChange={() => onStates(states.includes(value) ? states.filter(item => item !== value) : [...states, value])} className="accent-[#8a465b]" />{value}</label>)}
                      </div>
                    </div>
                  )}
                </fieldset>
              </div>
              <label className="block text-xs font-semibold">About the team and performances *<textarea name="description" required minLength={40} maxLength={4000} rows={4} placeholder="Tell organisers about your art, experience and the kinds of programs you perform" className={field} /></label>
              <div className="rounded-xl border border-[#e9dcd5] bg-white p-3 sm:p-5">
                <label className="block text-sm font-bold">Your minimum performance charge (excluding travel and stay) *
                  <input name="minimumCharge" type="text" required minLength={2} maxLength={100} placeholder="e.g. ₹25,000" className={field} />
                </label>
                <p className="mt-2 text-xs leading-5 text-[#806f75]">Enter a starting amount with currency for admin reference only. It won&apos;t appear on your public team profile. Final charges can be negotiated later based on travel distance, program location, and number of program days. Travel and stay are additional.</p>
              </div>
              <fieldset>
                <legend className="text-sm font-bold">Team photos * <span className="font-normal text-[#806f75]">(1–10 images, max 5 MB each)</span></legend>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => {
                  const incoming = Array.from(event.target.files || []);
                  event.target.value = '';
                  if (files.length + incoming.length > 10) { onError('You can select up to 10 images.'); return; }
                  if (incoming.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024)) { onError('Each image must be JPG, PNG or WebP and under 5 MB.'); return; }
                  onError(''); onFiles([...files, ...incoming]);
                }} className="mt-3 block w-full cursor-pointer rounded-xl border border-dashed border-[#d8bfb8] bg-white p-3 text-xs file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#f7e7df] file:px-3 file:py-2 file:font-semibold file:text-[#8a465b] sm:p-4" />
                <p className="mt-2 text-xs text-[#806f75]">{files.length} of 10 selected</p>
                {files.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{files.map((file, index) => <ImageThumb key={`${file.name}-${index}`} file={file} onRemove={() => onFiles(files.filter((_, item) => item !== index))} />)}</div>}
              </fieldset>
              <div className="rounded-xl bg-white p-3 sm:p-5">
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
              <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className="cursor-pointer rounded-xl border border-[#e9dcd5] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed">Cancel</button><button type="submit" disabled={busy} className="cursor-pointer rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Submitting...' : 'Submit for approval'}</button></div>
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
                <label className="text-xs font-semibold sm:col-span-2">Your budget (include currency) *<input name="budget" type="text" required minLength={2} maxLength={100} placeholder="e.g. ₹50,000 or $1,000" className={field} /></label>
              </div>
              <label className="block text-xs font-semibold">Program details *<textarea name="message" required minLength={20} maxLength={2000} rows={4} placeholder="Expected audience, program duration, requirements, and anything else we should know" className={field} /></label>
              <label className="flex gap-3 rounded-xl bg-[#f7eee9] p-4 text-xs leading-5"><input type="checkbox" required className="mt-1 accent-[#8a465b]" /><span>I consent to the coordination team using these details to respond to my enquiry and coordinate with the selected cultural team.</span></label>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <div className="flex justify-end gap-2"><button type="button" onClick={() => onMode('detail')} disabled={busy} className="cursor-pointer rounded-xl border border-[#e9dcd5] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed">Back</button><button type="submit" disabled={busy} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#8a465b] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Sending...' : 'Send enquiry'}</button></div>
            </form>
          )}
        </div>
      </div>
      {mode === 'detail' && selected && lightboxIndex !== null && (
        <CulturalTeamLightbox
          images={selected.images}
          teamName={selected.name}
          index={lightboxIndex}
          onPrevious={() => setLightboxIndex((current) => current === null ? 0 : (current - 1 + selected.images.length) % selected.images.length)}
          onNext={() => setLightboxIndex((current) => current === null ? 0 : (current + 1) % selected.images.length)}
          onClose={() => setLightboxIndex(null)}
        />
      )}
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
      {url && <img src={url} alt={file.name} className="h-full w-full object-contain" />}
      <button type="button" onClick={onRemove} aria-label={`Remove ${file.name}`} className="absolute right-1 top-1 cursor-pointer rounded-full bg-white p-1 shadow"><X className="h-3 w-3" /></button>
    </div>
  );
}
