'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Check, Pencil, Plus, RefreshCw, Search, Stethoscope, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { CONSULTATION_MODES, DOCTOR_SPECIALTIES, type ConsultationMode, type ConsultationRequest, type Doctor, type DoctorDraft } from '@/lib/doctors/types';
import { doctorsService } from '@/lib/services/doctorsService';

const field = 'mt-1.5 w-full rounded-xl border border-[#d6e4e1] bg-white px-3.5 py-2.5 text-sm text-[#153b45] outline-none focus:border-[#167f82] focus:ring-2 focus:ring-[#167f82]/10';
const modeLabel = { chat: 'Chat', video: 'Video call', phone: 'Phone call' };
const statusTone = { pending: 'bg-amber-50 text-amber-700', scheduled: 'bg-teal-50 text-teal-700', completed: 'bg-slate-100 text-slate-700', cancelled: 'bg-rose-50 text-rose-700' };
const localDateTime = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function DoctorsAdmin() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('doctors');
  const [tab, setTab] = useState<'requests' | 'doctors'>('requests');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Doctor | 'new' | null>(null);
  const [selected, setSelected] = useState<ConsultationRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { if (!isAuthenticated) router.push('/admin/login'); else if (!canManage) router.push('/admin/dashboard'); }, [isAuthenticated, canManage, router]);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [doctorList, requestList] = await Promise.all([doctorsService.getAllDoctors(), doctorsService.getAllRequests()]);
      setDoctors(doctorList); setRequests(requestList);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load consultations.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isAuthenticated && canManage) void load(); }, [isAuthenticated, canManage]);

  const visibleRequests = useMemo(() => requests.filter(request => {
    const term = search.trim().toLowerCase();
    return (status === 'all' || request.status === status)
      && (!term || `${request.patientName} ${request.doctorName} ${request.doctorSpecialty} ${request.city}`.toLowerCase().includes(term));
  }), [requests, status, search]);
  const visibleDoctors = useMemo(() => doctors.filter(doctor => !search.trim() || `${doctor.name} ${doctor.specialty} ${doctor.city}`.toLowerCase().includes(search.trim().toLowerCase())), [doctors, search]);

  const saveDoctor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || busy) return;
    const form = new FormData(event.currentTarget);
    const draft: DoctorDraft = {
      name: String(form.get('name') || '').trim(), degrees: String(form.get('degrees') || '').trim(),
      specialty: String(form.get('specialty') || ''), experienceYears: Number(form.get('experienceYears')),
      city: String(form.get('city') || '').trim(), country: String(form.get('country') || '').trim(),
      languages: String(form.get('languages') || '').trim(), about: String(form.get('about') || '').trim(),
      modes: form.getAll('modes') as ConsultationMode[], published: form.get('published') === 'on',
    };
    setBusy(true); setFormError('');
    try {
      await doctorsService.saveDoctor(draft, editing === 'new' ? undefined : editing.id);
      setEditing(null); await load(); toast.success('Doctor profile saved.');
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not save doctor.'); }
    finally { setBusy(false); }
  };

  const saveSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || busy) return;
    const form = new FormData(event.currentTarget);
    const nextStatus = String(form.get('status')) as ConsultationRequest['status'];
    const dateTime = String(form.get('scheduledAt') || '');
    const scheduledDate = dateTime ? new Date(dateTime) : null;
    if (scheduledDate && Number.isNaN(scheduledDate.getTime())) { setFormError('Enter a valid consultation date and time.'); return; }
    const draft = {
      status: nextStatus, scheduledAt: scheduledDate ? scheduledDate.toISOString() : '',
      contactMethod: String(form.get('contactMethod') || '') as ConsultationRequest['contactMethod'],
      contactValue: String(form.get('contactValue') || '').trim(), adminMessage: String(form.get('adminMessage') || '').trim(),
    };
    setBusy(true); setFormError('');
    try {
      await doctorsService.updateRequest(selected.id, draft);
      setSelected(null); await load(); toast.success('Consultation updated.');
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not update request.'); }
    finally { setBusy(false); }
  };

  if (!isAuthenticated || !canManage) return <p className="p-6 text-sm">Checking access...</p>;
  return <div className="mx-auto max-w-7xl pb-12 text-[#153b45]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#16868a]">COMMUNITY HEALTH</p><h1 className="mt-2 font-serif text-3xl font-bold">Doctor consultations</h1><p className="mt-2 text-sm text-[#657c80]">Manage doctor profiles and schedule private consultation requests.</p></div><button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex items-center gap-2 rounded-xl border border-[#d6e4e1] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} />Refresh</button></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#d6e4e1] bg-white p-5"><CalendarClock className="text-[#16868a]" /><strong className="mt-3 block text-2xl">{requests.filter(item => item.status === 'pending').length}</strong><span className="text-xs text-[#657c80]">Awaiting schedule</span></div><div className="rounded-2xl border border-[#d6e4e1] bg-white p-5"><Check className="text-[#16868a]" /><strong className="mt-3 block text-2xl">{requests.filter(item => item.status === 'scheduled').length}</strong><span className="text-xs text-[#657c80]">Scheduled</span></div><div className="rounded-2xl border border-[#d6e4e1] bg-white p-5"><Stethoscope className="text-[#16868a]" /><strong className="mt-3 block text-2xl">{doctors.filter(item => item.published).length}</strong><span className="text-xs text-[#657c80]">Published doctors</span></div></div>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><div className="inline-flex rounded-xl border border-[#d6e4e1] bg-white p-1"><button type="button" onClick={() => { setTab('requests'); setSearch(''); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'requests' ? 'bg-[#167f82] text-white' : 'text-[#657c80]'}`}>Requests ({requests.length})</button><button type="button" onClick={() => { setTab('doctors'); setSearch(''); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'doctors' ? 'bg-[#167f82] text-white' : 'text-[#657c80]'}`}>Doctors ({doctors.length})</button></div>{tab === 'doctors' && <button type="button" onClick={() => { setEditing('new'); setFormError(''); }} className="inline-flex items-center gap-2 rounded-xl bg-[#167f82] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Add doctor</button>}</div>
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#d6e4e1] bg-white p-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ba5a5]" size={16} /><span className="sr-only">Search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={tab === 'doctors' ? 'Search doctors' : 'Search patient, doctor or city'} className="w-full rounded-xl bg-[#f4faf8] py-3 pl-10 pr-4 text-sm outline-none" /></label>{tab === 'requests' && <select aria-label="Request status" value={status} onChange={event => setStatus(event.target.value)} className="rounded-xl bg-[#f4faf8] px-4 py-3 text-sm sm:w-44"><option value="all">All statuses</option><option value="pending">Pending</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>}</div>
    {error ? <div role="alert" className="mt-5 rounded-2xl bg-white p-8 text-center text-sm text-red-700">{error}<button type="button" onClick={() => void load()} className="ml-2 underline">Retry</button></div> : loading ? <div role="status" className="mt-5 rounded-2xl bg-white p-12 text-center text-sm text-[#657c80]">Loading...</div> : tab === 'doctors' ? <div className="mt-5 grid gap-3">{visibleDoctors.length ? visibleDoctors.map(doctor => <article key={doctor.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d6e4e1] bg-white p-5"><div className="flex items-center gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e5f4f0] font-serif text-xl font-bold text-[#167f82]">{doctor.name.replace(/^Dr\.?\s*/i, '').charAt(0) || 'D'}</div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{doctor.name}</h2><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${doctor.published ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>{doctor.published ? 'Published' : 'Draft'}</span></div><p className="mt-1 text-xs text-[#657c80]">{doctor.specialty} · {doctor.degrees} · {doctor.city}, {doctor.country}</p></div></div><button type="button" onClick={() => { setEditing(doctor); setFormError(''); }} className="inline-flex items-center gap-2 rounded-xl border border-[#d6e4e1] px-4 py-2.5 text-xs font-bold text-[#167f82]"><Pencil size={14} />Edit profile</button></article>) : <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#657c80]">No doctor profiles found.</div>}</div> : <div className="mt-5 grid gap-3">{visibleRequests.length ? visibleRequests.map(request => <article key={request.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d6e4e1] bg-white p-5"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusTone[request.status]}`}>{request.status}</span><span className="text-xs text-[#657c80]">{new Date(request.createdAt).toLocaleDateString('en-IN')}</span></div><h2 className="mt-2 font-semibold">{request.patientName} <span className="font-normal text-[#657c80]">with {request.doctorName}</span></h2><p className="mt-1 text-xs text-[#657c80]">{request.doctorSpecialty} · {modeLabel[request.mode]} · Preferred {request.preferredDate}, {request.preferredTime}</p></div><button type="button" onClick={() => { setSelected(request); setFormError(''); }} className="inline-flex items-center gap-2 rounded-xl bg-[#167f82] px-4 py-2.5 text-xs font-bold text-white">Review & schedule</button></article>) : <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#657c80]">No requests match this view.</div>}</div>}
    {editing && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0c2e3b]/65 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setEditing(null); }}><div role="dialog" aria-modal="true" aria-labelledby="doctor-admin-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-[#f8fcfa]"><div className="flex items-center justify-between border-b border-[#d6e4e1] bg-white p-5"><h2 id="doctor-admin-title" className="font-serif text-xl font-bold">{editing === 'new' ? 'Add doctor' : 'Edit doctor profile'}</h2><button type="button" onClick={() => { if (!busy) setEditing(null); }} aria-label="Close"><X size={19} /></button></div><form onSubmit={saveDoctor} className="space-y-4 overflow-y-auto p-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Doctor name *<input name="name" defaultValue={editing === 'new' ? '' : editing.name} required minLength={3} maxLength={100} placeholder="Dr. Name" className={field} /></label><label className="text-xs font-semibold">Degrees *<input name="degrees" defaultValue={editing === 'new' ? '' : editing.degrees} required maxLength={120} placeholder="MBBS, MD" className={field} /></label><label className="text-xs font-semibold">Specialty *<select name="specialty" defaultValue={editing === 'new' ? DOCTOR_SPECIALTIES[0] : editing.specialty} className={field}>{DOCTOR_SPECIALTIES.map(value => <option key={value}>{value}</option>)}</select></label><label className="text-xs font-semibold">Years of experience *<input name="experienceYears" type="number" min={0} max={70} defaultValue={editing === 'new' ? 0 : editing.experienceYears} required className={field} /></label><label className="text-xs font-semibold">City *<input name="city" defaultValue={editing === 'new' ? '' : editing.city} required maxLength={100} className={field} /></label><label className="text-xs font-semibold">Country *<input name="country" defaultValue={editing === 'new' ? '' : editing.country} required maxLength={100} className={field} /></label><label className="text-xs font-semibold sm:col-span-2">Languages *<input name="languages" defaultValue={editing === 'new' ? '' : editing.languages} required maxLength={160} placeholder="Odia, Hindi, English" className={field} /></label></div><label className="block text-xs font-semibold">About the doctor *<textarea name="about" defaultValue={editing === 'new' ? '' : editing.about} required minLength={20} maxLength={3000} rows={4} placeholder="Professional background and areas of care" className={field} /></label><fieldset><legend className="text-xs font-semibold">Consultation options *</legend><div className="mt-2 flex flex-wrap gap-3">{CONSULTATION_MODES.map(value => <label key={value} className="inline-flex items-center gap-2 rounded-xl border border-[#d6e4e1] bg-white px-3 py-2 text-xs"><input type="checkbox" name="modes" value={value} defaultChecked={editing === 'new' ? value === 'video' : editing.modes.includes(value)} className="accent-[#167f82]" />{modeLabel[value]}</label>)}</div></fieldset><label className="flex items-center gap-2 rounded-xl bg-[#e9f5f1] p-4 text-xs font-semibold"><input type="checkbox" name="published" defaultChecked={editing !== 'new' && editing.published} className="accent-[#167f82]" />Publish this profile to the public directory</label>{formError && <p role="alert" className="text-xs text-red-700">{formError}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} disabled={busy} className="rounded-xl border border-[#d6e4e1] px-4 py-2.5 text-xs font-bold">Cancel</button><button type="submit" disabled={busy} className="rounded-xl bg-[#167f82] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save doctor'}</button></div></form></div></div>}
    {selected && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0c2e3b]/65 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setSelected(null); }}><div role="dialog" aria-modal="true" aria-labelledby="consultation-admin-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-[#f8fcfa]"><div className="flex items-start justify-between border-b border-[#d6e4e1] bg-white p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-[#16868a]">PRIVATE REQUEST</p><h2 id="consultation-admin-title" className="mt-1 font-serif text-xl font-bold">{selected.patientName} · {selected.doctorName}</h2></div><button type="button" onClick={() => { if (!busy) setSelected(null); }} aria-label="Close"><X size={19} /></button></div><div className="overflow-y-auto p-5"><div className="grid gap-3 rounded-2xl bg-white p-4 text-sm sm:grid-cols-2"><p><span className="block text-xs text-[#657c80]">Patient</span>{selected.patientName}, age {selected.age}</p><p><span className="block text-xs text-[#657c80]">Location</span>{selected.city}</p><p><span className="block text-xs text-[#657c80]">Email</span><a href={`mailto:${selected.email}`} className="break-all text-[#167f82] underline">{selected.email}</a></p><p><span className="block text-xs text-[#657c80]">Phone</span><a href={`tel:${selected.phone}`} className="text-[#167f82] underline">{selected.phone}</a></p><p><span className="block text-xs text-[#657c80]">Requested</span>{modeLabel[selected.mode]} · {selected.preferredDate}, {selected.preferredTime}</p></div><div className="mt-4 rounded-2xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#657c80]">Patient's concern</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{selected.concern}</p></div><form key={selected.id} onSubmit={saveSchedule} className="mt-6 space-y-4"><h3 className="font-serif text-lg font-bold">Schedule and response</h3><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Status *<select name="status" defaultValue={selected.status === 'pending' ? 'scheduled' : selected.status} className={field}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label className="text-xs font-semibold">Confirmed date and time<input name="scheduledAt" type="datetime-local" defaultValue={localDateTime(selected.scheduledAt)} className={field} /></label><label className="text-xs font-semibold">Connection method<select name="contactMethod" defaultValue={selected.contactMethod || (selected.mode === 'chat' ? 'whatsapp' : selected.mode === 'phone' ? 'phone' : 'meet')} className={field}><option value="whatsapp">WhatsApp</option><option value="meet">Google Meet</option><option value="zoom">Zoom</option><option value="phone">Phone call</option></select></label><label className="text-xs font-semibold">Number or meeting link<input name="contactValue" defaultValue={selected.contactValue} maxLength={500} placeholder="+91... or https://..." className={field} /></label></div><label className="block text-xs font-semibold">Message to patient<textarea name="adminMessage" defaultValue={selected.adminMessage} maxLength={1000} rows={3} placeholder="Scheduling instructions or update" className={field} /></label><p className="text-xs leading-5 text-[#657c80]">The confirmed schedule, contact detail and message become visible in the patient's My consultations page.</p>{formError && <p role="alert" className="text-xs text-red-700">{formError}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(null)} disabled={busy} className="rounded-xl border border-[#d6e4e1] px-4 py-2.5 text-xs font-bold">Cancel</button><button type="submit" disabled={busy} className="rounded-xl bg-[#167f82] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save update'}</button></div></form></div></div></div>}
  </div>;
}
