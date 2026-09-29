'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { ArrowRight, CalendarDays, HeartPulse, MapPin, MessageCircle, Phone, Search, ShieldCheck, Video, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { CONSULTATION_MODES, DOCTOR_SPECIALTIES, type ConsultationDraft, type Doctor } from '@/lib/doctors/types';
import { doctorsService } from '@/lib/services/doctorsService';

const modeLabel = { chat: 'Chat', video: 'Video call', phone: 'Phone call' };
const modeIcon = { chat: MessageCircle, video: Video, phone: Phone };
const field = 'mt-1.5 w-full rounded-xl border border-[#cbdedc] bg-white px-3.5 py-3 text-sm text-[#153b45] outline-none transition focus:border-[#167f82] focus:ring-2 focus:ring-[#167f82]/15';
const today = () => { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

export default function Doctors() {
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [mode, setMode] = useState('All modes');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setDoctors(await doctorsService.getPublished()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load doctors.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (!selected) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; };
  }, [selected]);

  const visible = useMemo(() => doctors.filter(doctor => {
    const term = search.trim().toLowerCase();
    return (specialty === 'All specialties' || doctor.specialty === specialty)
      && (mode === 'All modes' || doctor.modes.includes(mode as Doctor['modes'][number]))
      && (!term || `${doctor.name} ${doctor.specialty} ${doctor.city} ${doctor.country} ${doctor.degrees}`.toLowerCase().includes(term));
  }), [doctors, search, specialty, mode]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || saving) return;
    const form = new FormData(event.currentTarget);
    const draft: ConsultationDraft = {
      patientName: String(form.get('patientName') || '').trim(), age: Number(form.get('age')),
      phone: String(form.get('phone') || '').trim(), email: String(form.get('email') || '').trim(),
      city: String(form.get('city') || '').trim(), concern: String(form.get('concern') || '').trim(),
      mode: String(form.get('mode')) as ConsultationDraft['mode'],
      preferredDate: String(form.get('preferredDate') || ''), preferredTime: String(form.get('preferredTime') || ''),
    };
    setSaving(true); setFormError('');
    try {
      await doctorsService.requestConsultation(selected.id, draft);
      setSelected(null); setRequesting(false);
      toast.success('Request sent. Check My consultations for updates.');
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not send your request.'); }
    finally { setSaving(false); }
  };

  return <main className="min-h-screen bg-[#f5faf8] text-[#153b45]">
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_20%,#2c8991_0%,#12616d_36%,#103e56_100%)] px-4 py-16 text-white sm:px-6 md:py-20">
      <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute right-20 top-28 h-52 w-52 rounded-full border border-white/10" />
      <div className="relative mx-auto max-w-7xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide"><HeartPulse size={15} /> COMMUNITY HEALTH</span><h1 className="mt-6 max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-5xl">Care starts with the right conversation.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-white/85 sm:text-base">Explore doctors in our community and request a chat, phone, or video consultation. Our team will confirm the time and share the connection details.</p><div className="mt-8 flex flex-wrap gap-3"><a href="#find-a-doctor" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#125c68] transition hover:bg-[#e7f6f4]">Find a doctor <ArrowRight size={16} /></a><Link href="/doctors/my-consultations" className="inline-flex items-center gap-2 rounded-xl border border-white/35 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">My consultations <CalendarDays size={16} /></Link></div></div>
    </section>
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mb-9 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-[#d6e9e5] bg-white p-5"><ShieldCheck className="text-[#16868a]" size={24} /><strong className="mt-3 block text-sm">Admin listed doctors</strong><p className="mt-1 text-xs leading-5 text-[#657c80]">Profiles are added and managed by our team.</p></div><div className="rounded-2xl border border-[#d6e9e5] bg-white p-5"><CalendarDays className="text-[#16868a]" size={24} /><strong className="mt-3 block text-sm">Scheduled by our team</strong><p className="mt-1 text-xs leading-5 text-[#657c80]">We confirm a time after reviewing your request.</p></div><div className="rounded-2xl border border-[#d6e9e5] bg-white p-5"><MessageCircle className="text-[#16868a]" size={24} /><strong className="mt-3 block text-sm">Connect outside the site</strong><p className="mt-1 text-xs leading-5 text-[#657c80]">Chat, phone and video calls use external services.</p></div></div>
      <div id="find-a-doctor" className="scroll-mt-24"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#16868a]">DOCTOR DIRECTORY</p><h2 className="mt-2 font-serif text-3xl font-bold">Find your doctor</h2></div><span className="text-sm text-[#657c80]">{loading ? 'Loading...' : `${visible.length} available`}</span></div>
      <div className="grid gap-3 rounded-2xl border border-[#d6e9e5] bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_190px] md:p-4"><label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a9798]" size={17} /><span className="sr-only">Search doctors</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search doctor, specialty or city" className="w-full rounded-xl bg-[#f4faf8] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#167f82]/15" /></label><select aria-label="Filter by specialty" value={specialty} onChange={event => setSpecialty(event.target.value)} className="rounded-xl bg-[#f4faf8] px-4 py-3 text-sm outline-none"><option>All specialties</option>{DOCTOR_SPECIALTIES.map(value => <option key={value}>{value}</option>)}</select><select aria-label="Filter by consultation mode" value={mode} onChange={event => setMode(event.target.value)} className="rounded-xl bg-[#f4faf8] px-4 py-3 text-sm outline-none"><option>All modes</option>{CONSULTATION_MODES.map(value => <option key={value} value={value}>{modeLabel[value]}</option>)}</select></div>
      {error ? <div role="alert" className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-red-700">{error}<button type="button" onClick={() => void load()} className="ml-2 font-semibold underline">Try again</button></div> : loading ? <div role="status" className="mt-6 rounded-2xl bg-white p-12 text-center text-sm text-[#657c80]">Loading doctors...</div> : visible.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-[#c8deda] bg-white p-12 text-center"><HeartPulse className="mx-auto text-[#16868a]" /><h3 className="mt-4 font-semibold">No doctors match your search</h3><p className="mt-2 text-sm text-[#657c80]">Try a different specialty or city.</p><button type="button" onClick={() => { setSearch(''); setSpecialty('All specialties'); setMode('All modes'); }} className="mt-4 text-sm font-bold text-[#167f82]">Clear filters</button></div> : <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} onOpen={() => { setSelected(doctor); setRequesting(false); setFormError(''); }} />)}</div>}</div>
      <p className="mt-10 rounded-2xl border border-[#d5e6e5] bg-[#ecf6f4] p-5 text-sm leading-6 text-[#496c70]"><strong className="text-[#174a55]">For emergencies:</strong> This service does not provide immediate care. Please contact your local emergency service or go to the nearest emergency department.</p>
    </div>
    {selected && createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0c2e3b]/65 p-3 backdrop-blur-sm sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget && !saving) setSelected(null); }}><div role="dialog" aria-modal="true" aria-labelledby="doctor-dialog-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[26px] bg-[#f8fcfa] shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-[#d9e8e6] bg-white p-5 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#16868a]">{requesting ? 'REQUEST CONSULTATION' : selected.specialty}</p><h2 id="doctor-dialog-title" className="mt-2 font-serif text-2xl font-bold">{selected.name}</h2><p className="mt-1 text-sm text-[#657c80]">{selected.degrees} · {selected.city}, {selected.country}</p></div><button type="button" onClick={() => { if (!saving) setSelected(null); }} disabled={saving} aria-label="Close" className="rounded-full border border-[#d9e8e6] p-2"><X size={18} /></button></div><div className="min-h-0 overflow-y-auto p-5 sm:p-7">{requesting ? <>{!isAuthenticated && !authLoading ? <div className="rounded-2xl bg-white p-8 text-center"><h3 className="font-semibold">Sign in to request a consultation</h3><p className="mt-2 text-sm text-[#657c80]">Your account lets you track the request and see the confirmed connection details.</p><Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white">Sign in</Link></div> : <form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Patient name *<input name="patientName" defaultValue={user?.displayName || ''} required minLength={2} maxLength={100} className={field} /></label><label className="text-xs font-semibold">Age *<input name="age" type="number" min={0} max={120} required className={field} /></label><label className="text-xs font-semibold">Phone with country code *<input name="phone" type="tel" required minLength={7} maxLength={25} placeholder="+91 98765 43210" className={field} /></label><label className="text-xs font-semibold">Email *<input name="email" type="email" defaultValue={user?.email || ''} required maxLength={200} className={field} /></label><label className="text-xs font-semibold sm:col-span-2">City and country *<input name="city" required minLength={2} maxLength={120} placeholder="Bhubaneswar, India" className={field} /></label></div><label className="block text-xs font-semibold">Briefly describe the concern *<textarea name="concern" required minLength={15} maxLength={1500} rows={4} placeholder="Share the main symptoms or reason for consultation. Avoid uploading reports here." className={field} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Consultation type *<select name="mode" required defaultValue={selected.modes[0]} className={field}>{selected.modes.map(value => <option key={value} value={value}>{modeLabel[value]}</option>)}</select></label><label className="text-xs font-semibold">Preferred date *<input name="preferredDate" type="date" min={today()} required className={field} /></label><label className="text-xs font-semibold sm:col-span-2">Preferred time *<select name="preferredTime" required className={field}><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Evening">Evening</option></select></label></div><label className="flex gap-3 rounded-xl bg-[#eaf5f2] p-4 text-xs leading-5 text-[#496c70]"><input type="checkbox" required className="mt-1 accent-[#167f82]" /><span>I consent to sharing these details with the consultation team and the selected doctor for scheduling. I understand this is not an emergency service.</span></label>{formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}<div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setRequesting(false)} disabled={saving} className="rounded-xl border border-[#cbdedc] px-5 py-3 text-sm font-semibold">Back</button><button type="submit" disabled={saving} className="rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Sending...' : 'Send request'}</button></div></form>}</> : <><p className="text-sm leading-7 text-[#4f7074]">{selected.about}</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-[#d9e8e6] bg-white p-4"><p className="text-xs text-[#657c80]">Experience</p><strong className="mt-1 block">{selected.experienceYears} years</strong></div><div className="rounded-xl border border-[#d9e8e6] bg-white p-4"><p className="text-xs text-[#657c80]">Languages</p><strong className="mt-1 block">{selected.languages}</strong></div></div><p className="mt-6 text-xs font-bold uppercase tracking-wide text-[#657c80]">Consultation options</p><div className="mt-3 flex flex-wrap gap-2">{selected.modes.map(value => { const Icon = modeIcon[value]; return <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f4f1] px-3 py-1.5 text-xs font-semibold text-[#167f82]"><Icon size={14} />{modeLabel[value]}</span>; })}</div><button type="button" onClick={() => setRequesting(true)} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#167f82] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12686e]">Request consultation <ArrowRight size={16} /></button></>}</div></div></div>, document.body)}
  </main>;
}

function DoctorCard({ doctor, onOpen }: { doctor: Doctor; onOpen: () => void }) {
  return <article className="flex h-full flex-col rounded-[24px] border border-[#d6e9e5] bg-[radial-gradient(circle_at_top_right,#e1f5f0_0%,#fff_55%)] p-5 shadow-[0_10px_28px_rgba(16,80,88,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(16,80,88,.12)] sm:p-6"><div className="flex items-start gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#d5efeb] font-serif text-2xl font-bold text-[#167f82]">{doctor.name.replace(/^Dr\.?\s*/i, '').charAt(0) || 'D'}</div><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-[#16868a]">{doctor.specialty}</p><h3 className="mt-1 break-words font-serif text-xl font-bold">{doctor.name}</h3><p className="mt-1 text-xs text-[#657c80]">{doctor.degrees}</p></div></div><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#657c80]"><span className="inline-flex items-center gap-1"><MapPin size={14} />{doctor.city}, {doctor.country}</span><span>{doctor.experienceYears} years experience</span></div><p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-[#557478]">{doctor.about}</p><div className="mt-5 flex flex-wrap gap-2">{doctor.modes.map(value => <span key={value} className="rounded-full bg-[#eaf5f2] px-3 py-1.5 text-[11px] font-semibold text-[#167f82]">{modeLabel[value]}</span>)}</div><button type="button" onClick={onOpen} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12686e]">View details & request <ArrowRight size={15} /></button></article>;
}
