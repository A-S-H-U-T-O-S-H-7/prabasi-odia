'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, HeartPulse, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { doctorsService } from '@/lib/services/doctorsService';
import type { ConsultationRequest } from '@/lib/doctors/types';

function contactHref(request: ConsultationRequest) {
  if (request.contactMethod === 'whatsapp') return `https://wa.me/${request.contactValue.replace(/\D/g, '')}`;
  if (request.contactMethod === 'phone') return `tel:${request.contactValue.replace(/[^\d+]/g, '')}`;
  if (request.contactMethod === 'meet' || request.contactMethod === 'zoom') {
    try { const url = new URL(request.contactValue); return url.protocol === 'https:' ? url.toString() : ''; }
    catch { return ''; }
  }
  return '';
}
const statusTone = { pending: 'bg-amber-50 text-amber-700', scheduled: 'bg-teal-50 text-teal-700', completed: 'bg-slate-100 text-slate-700', cancelled: 'bg-rose-50 text-rose-700' };

export default function MyConsultations() {
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { setRequests(await doctorsService.getMyRequests()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load consultations.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isAuthenticated) void load(); else setLoading(false); }, [isAuthenticated]);

  return <main className="min-h-screen bg-[#f5faf8] px-4 py-8 text-[#153b45] sm:px-6"><div className="mx-auto max-w-5xl"><Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-semibold text-[#167f82]"><ArrowLeft size={16} /> Back to doctors</Link><div className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#16868a]">PRIVATE TO YOUR ACCOUNT</p><h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">My consultations</h1><p className="mt-3 text-sm text-[#657c80]">Track requests and find connection details after our team schedules them.</p></div><button type="button" onClick={() => void load()} disabled={!isAuthenticated || loading} className="rounded-xl border border-[#cbdedc] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Refresh</button></div>
    {!authLoading && !isAuthenticated ? <div className="mt-8 rounded-2xl border border-[#d6e9e5] bg-white p-8 text-center"><HeartPulse className="mx-auto text-[#16868a]" /><h2 className="mt-4 font-semibold">Sign in to see your consultations</h2><Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white">Sign in</Link></div> : error ? <div role="alert" className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-red-700">{error}<button type="button" onClick={() => void load()} className="ml-2 font-semibold underline">Retry</button></div> : loading || authLoading ? <div role="status" className="mt-8 rounded-2xl bg-white p-12 text-center text-sm text-[#657c80]">Loading consultations...</div> : requests.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#cbdedc] bg-white p-12 text-center"><MessageCircle className="mx-auto text-[#16868a]" /><h2 className="mt-4 font-semibold">No consultation requests yet</h2><p className="mt-2 text-sm text-[#657c80]">Find a doctor to start a conversation with our scheduling team.</p><Link href="/doctors" className="mt-5 inline-flex rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white">Explore doctors</Link></div> : <div className="mt-8 space-y-4">{requests.map(request => { const href = request.status === 'scheduled' ? contactHref(request) : ''; return <article key={request.id} className="rounded-[24px] border border-[#d6e9e5] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#16868a]">{request.doctorSpecialty}</p><h2 className="mt-1 font-serif text-xl font-bold">{request.doctorName}</h2><p className="mt-1 text-xs text-[#657c80]">For {request.patientName} · Requested {new Date(request.createdAt).toLocaleDateString('en-IN')}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusTone[request.status]}`}>{request.status}</span></div><div className="mt-5 grid gap-3 border-t border-[#e3efec] pt-4 text-sm sm:grid-cols-2"><p className="inline-flex items-center gap-2 text-[#557478]"><CalendarDays size={16} />Preferred: {request.preferredDate}</p><p className="inline-flex items-center gap-2 text-[#557478]"><Clock3 size={16} />{request.preferredTime} · {request.mode}</p></div>{request.status === 'scheduled' && <div className="mt-5 rounded-2xl bg-[#edf8f4] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#167f82]">Confirmed consultation</p><p className="mt-2 text-sm font-semibold">{new Date(request.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>{request.adminMessage && <p className="mt-2 text-sm leading-6 text-[#557478]">{request.adminMessage}</p>}{href && <a href={href} target={href.startsWith('https:') ? '_blank' : undefined} rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#167f82] px-4 py-2.5 text-sm font-semibold text-white">{request.contactMethod === 'whatsapp' ? 'Open WhatsApp' : request.contactMethod === 'phone' ? 'Call doctor' : 'Join video call'} <ArrowUpRight size={15} /></a>}</div>}{request.status === 'pending' && <p className="mt-4 text-xs text-[#657c80]">Our team will review your request and confirm a time here.</p>}{request.status === 'cancelled' && request.adminMessage && <p className="mt-4 text-sm text-[#a35050]">{request.adminMessage}</p>}</article>; })}</div>}
    </div></main>;
}
