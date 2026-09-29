'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Check, ChevronRight, CircleDollarSign, Clock3, Loader2, MapPin, Pencil, RefreshCw, Search, Users, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { investmentsService } from '@/lib/services/investmentsService';
import type { Investment, InvestmentInterest, InvestmentInterestDetails, InvestmentStatus } from '@/lib/investments/types';
import InvestmentInterestCard from './InvestmentInterestCard';
import InvestmentModal from '@/components/web/investments/InvestmentModal';

const date = (value: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const money = (item: Investment) => new Intl.NumberFormat(item.currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: item.currency, maximumFractionDigits: 0 }).format(item.amount);
const tone: Record<InvestmentStatus, string> = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700', closed: 'bg-slate-100 text-slate-700' };

export default function InvestmentsAdmin() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('investments');
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<InvestmentStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Investment | null>(null);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [editError, setEditError] = useState('');
  const [interests, setInterests] = useState<InvestmentInterest[]>([]);
  const [interestLoading, setInterestLoading] = useState(false);
  const [interestError, setInterestError] = useState('');
  const [busy, setBusy] = useState(false);
  const interestRequest = useRef(0);

  useEffect(() => { if (!isAuthenticated) router.push('/admin/login'); else if (!canManage) router.push('/admin/dashboard'); }, [isAuthenticated, canManage, router]);
  const load = async () => {
    setLoading(true); setError('');
    try { setItems(await investmentsService.getAll()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load investment posts.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isAuthenticated && canManage) void load(); }, [isAuthenticated, canManage]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(item => (status === 'all' || item.status === status) && (!term || `${item.name} ${item.sector} ${item.place} ${item.preferredLocation} ${item.details}`.toLowerCase().includes(term)));
  }, [items, status, search]);

  const open = async (item: Investment) => {
    const request = ++interestRequest.current;
    setSelected(item); setInterests([]); setInterestError('');
    setInterestLoading(true);
    try { const result = await investmentsService.getInterests(item.id); if (request === interestRequest.current) setInterests(result); }
    catch (cause) { if (request === interestRequest.current) setInterestError(cause instanceof Error ? cause.message : 'Could not load responses.'); }
    finally { if (request === interestRequest.current) setInterestLoading(false); }
  };
  const changeStatus = async (item: Investment, next: InvestmentStatus, rejectionReason = '') => {
    if (busy) return;
    rejectionReason = rejectionReason.trim();
    if (next === 'rejected' && !rejectionReason) { toast.error('Please provide a rejection reason.'); return; }
    setBusy(true);
    try {
      await investmentsService.updateStatus(item.id, next, rejectionReason);
      const updated = { ...item, status: next, rejectionReason };
      setItems(current => current.map(entry => entry.id === item.id ? updated : entry));
      setSelected(current => current?.id === item.id ? updated : current);
      toast.success(next === 'approved' ? 'Investment approved for verified members.' : next === 'rejected' ? 'Investment rejected.' : 'Investment closed.');
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : 'Could not update the investment.'); }
    finally { setBusy(false); }
  };
  const changeInterest = async (interest: InvestmentInterest, next: InvestmentInterest['status']) => {
    if (!selected || busy) return;
    setBusy(true);
    try { await investmentsService.updateInterestStatus(selected.id, interest.memberId, next); setInterests(current => current.map(entry => entry.id === interest.id ? { ...entry, status: next } : entry)); toast.success('Response updated.'); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : 'Could not update the response.'); }
    finally { setBusy(false); }
  };
  const saveInterest = async (interest: InvestmentInterest, details: InvestmentInterestDetails) => {
    if (!selected || busy) throw new Error('Please wait and try again.');
    setBusy(true);
    try {
      await investmentsService.updateInterestDetails(selected.id, interest.memberId, details);
      setInterests(current => current.map(entry => entry.id === interest.id ? { ...entry, ...details } : entry));
      toast.success('Interest details updated.');
    } finally { setBusy(false); }
  };
  const openEdit = (item: Investment) => {
    if (item.status !== 'approved') return;
    interestRequest.current++;
    setSelected(null);
    setEditError('');
    setEditing(item);
  };
  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || busy) return;
    const form = new FormData(event.currentTarget);
    const draft = { name: String(form.get('name') || '').trim(), amount: Number(form.get('amount')), currency: String(form.get('currency')), sector: String(form.get('sector')), place: String(form.get('place') || '').trim(), preferredLocation: String(form.get('preferredLocation') || '').trim(), details: String(form.get('details') || '').trim() };
    setBusy(true); setEditError('');
    try {
      await investmentsService.updateApproved(editing.id, draft);
      setItems(current => current.map(item => item.id === editing.id ? { ...item, ...draft, currency: draft.currency === 'USD' ? 'USD' : 'INR', updatedAt: new Date().toISOString() } : item));
      setEditing(null);
      toast.success('Approved investment post updated.');
    } catch (cause) { setEditError(cause instanceof Error ? cause.message : 'Could not save the investment.'); }
    finally { setBusy(false); }
  };

  if (!isAuthenticated || !canManage) return <p className="p-6 text-sm text-[#6b5e5a]">Checking access...</p>;
  return <div className="mx-auto max-w-7xl pb-12 text-[#281b34]">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#a16d4e]">Member network</p><h1 className="mt-2 font-serif text-3xl font-bold">Investments</h1><p className="mt-2 text-sm text-[#756b72]">Review member investment intents and manage private responses.</p></div><button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#e8dedb] bg-white px-4 py-2.5 text-sm font-semibold text-[#6b1e5b] shadow-sm disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></div>
    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{(['pending', 'approved', 'rejected', 'closed'] as const).map(value => <button key={value} type="button" onClick={() => setStatus(value)} aria-pressed={status === value} className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 sm:p-5 ${status === value ? 'border-[#6b1e5b] ring-2 ring-[#6b1e5b]/10' : 'border-[#eadfdb]'}`}><span className="flex items-center gap-2 text-xs capitalize text-[#756b72]">{value === 'pending' ? <Clock3 size={15} /> : value === 'approved' ? <Check size={15} /> : <CircleDollarSign size={15} />}{value === 'pending' ? 'Pending review' : value}</span><strong className="mt-3 block text-2xl font-bold">{loading ? '—' : items.filter(item => item.status === value).length}</strong></button>)}</div>
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#eadfdb] bg-white p-3 shadow-sm sm:flex-row sm:p-4"><label className="relative flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49aa2]" /><span className="sr-only">Search investment posts</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search members, sectors or places" className="w-full rounded-xl bg-[#faf6f1] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#6b1e5b]/20" /></label><select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value as InvestmentStatus | 'all')} className="rounded-xl bg-[#faf6f1] px-4 py-3 text-sm outline-none sm:w-48"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="closed">Closed</option></select></div>
    {error ? <div role="alert" className="mt-5 rounded-2xl bg-white p-8 text-center text-sm text-red-700">{error}<button type="button" onClick={() => void load()} className="ml-2 font-bold underline">Retry</button></div> : loading ? <div role="status" className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-sm text-[#756b72]"><Loader2 size={18} className="animate-spin" />Loading submissions...</div> : visible.length === 0 ? <div className="mt-5 rounded-2xl bg-white p-12 text-center text-sm text-[#756b72]">No investment posts match this view.</div> : <div className="mt-5 grid gap-3">{visible.map(item => <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-[#eadfdb] bg-white p-5 shadow-sm transition hover:border-[#d9c8d3] sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${tone[item.status]}`}>{item.status}</span><span className="rounded-full bg-[#f5edf3] px-3 py-1 text-[11px] font-semibold text-[#6b1e5b]">{item.sector}</span></div><h2 className="mt-3 font-semibold text-[#281b34]">{item.name} <span className="font-serif text-xl text-[#6b1e5b]">· {money(item)}</span></h2><p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#756b72]"><MapPin size={13} />{item.place} <span>·</span> Preferred: {item.preferredLocation || 'Flexible'} <span>·</span> {date(item.createdAt)}</p><p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-[#756b72]">{item.details}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => void open(item)} className="inline-flex items-center gap-2 rounded-xl border border-[#e3d6df] px-4 py-2.5 text-xs font-bold text-[#6b1e5b] transition hover:bg-[#faf5f8]"><Users size={15} /> View & responses <ChevronRight size={14} /></button>{item.status === 'approved' && <button type="button" disabled={busy} onClick={() => openEdit(item)} className="inline-flex items-center gap-2 rounded-xl border border-[#e3d6df] px-4 py-2.5 text-xs font-bold text-[#6b1e5b] transition hover:bg-[#faf5f8] disabled:opacity-50"><Pencil size={14} /> Edit post</button>}{item.status === 'pending' && <button type="button" disabled={busy} onClick={() => void changeStatus(item, 'approved')} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Approve</button>}</div></article>)}</div>}
    {selected && <InvestmentReview item={selected} interests={interests} loading={interestLoading} error={interestError} busy={busy} onClose={() => { if (!busy) { interestRequest.current++; setSelected(null); } }} onStatus={(next, reason) => void changeStatus(selected, next, reason)} onEdit={() => openEdit(selected)} onInterest={(interest, next) => void changeInterest(interest, next)} onSaveInterest={saveInterest} onRetry={() => void open(selected)} />}
    {editing && <InvestmentModal key={editing.id} mode="edit" editor="admin" post={editing} name={editing.name} email="" location={editing.place} busy={busy} error={editError} onClose={() => { if (!busy) setEditing(null); }} onSubmit={saveEdit} />}
  </div>;
}

function InvestmentReview({ item, interests, loading, error, busy, onClose, onStatus, onEdit, onInterest, onSaveInterest, onRetry }: {
  item: Investment; interests: InvestmentInterest[]; loading: boolean; error: string; busy: boolean; onClose: () => void; onStatus: (status: InvestmentStatus, reason?: string) => void; onEdit: () => void; onInterest: (interest: InvestmentInterest, status: InvestmentInterest['status']) => void; onSaveInterest: (interest: InvestmentInterest, details: InvestmentInterestDetails) => Promise<void>; onRetry: () => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  useEffect(() => { const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, []);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) onClose(); }; document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [busy, onClose]);
  return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#140e23]/65 p-3 backdrop-blur-sm sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}><div role="dialog" aria-modal="true" aria-labelledby="investment-review-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-[26px] bg-[#fffaf6] shadow-2xl sm:max-h-[calc(100dvh-40px)]"><div className="flex items-start justify-between gap-4 border-b border-[#eadfdb] bg-white p-5 sm:px-7"><div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9a6839]">Investment review</p><h2 id="investment-review-title" className="mt-1 font-serif text-2xl font-bold text-[#281b34]">{item.name}</h2><p className="mt-1 text-sm text-[#756b72]">{item.sector} · {money(item)}</p></div><button type="button" onClick={onClose} disabled={busy} aria-label="Close review" className="rounded-full border border-[#eadfdb] p-2 text-[#756b72] disabled:opacity-50"><X size={18} /></button></div><div className="min-h-0 space-y-6 overflow-y-auto overscroll-contain p-5 sm:p-7"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${tone[item.status]}`}>{item.status}</span><span className="rounded-full bg-[#f3edf2] px-3 py-1 text-xs text-[#6b1e5b]">Submitted {date(item.createdAt)}</span></div><div className="grid gap-4 rounded-2xl border border-[#eadfdb] bg-white p-5 text-sm sm:grid-cols-2"><p><span className="block text-xs text-[#827780]">Member location</span><strong>{item.place}</strong></p><p><span className="block text-xs text-[#827780]">Preferred location</span><strong>{item.preferredLocation || 'Flexible'}</strong></p></div><section><h3 className="text-sm font-bold">Investment details</h3><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#635a63]">{item.details}</p></section>{item.rejectionReason && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><strong>Rejection reason:</strong> {item.rejectionReason}</p>}{rejecting && <label className="block text-sm font-semibold text-[#281b34]">Reason for rejection *<textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={1000} rows={3} placeholder="Explain what the member should correct" className="mt-2 w-full rounded-xl border border-red-200 bg-white p-3 text-sm outline-none focus:border-red-400" /></label>}<section className="border-t border-[#eadfdb] pt-6"><h3 className="font-serif text-xl font-bold">Private responses {!loading && !error ? `(${interests.length})` : ''}</h3><p className="mt-1 text-xs text-[#827780]">Only authorized admins can see these details.</p>{loading ? <p role="status" className="mt-5 flex items-center gap-2 text-sm text-[#756b72]"><Loader2 size={16} className="animate-spin" />Loading responses...</p> : error ? <p role="alert" className="mt-5 text-sm text-red-700">{error}<button type="button" onClick={onRetry} className="ml-2 underline">Retry</button></p> : interests.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-[#d9cbd1] bg-white p-6 text-sm text-[#756b72]">No one has expressed interest yet.</div> : <div className="mt-5 space-y-3">{interests.map(interest => <InvestmentInterestCard key={interest.id} interest={interest} busy={busy} onStatus={onInterest} onSave={onSaveInterest} />)}</div>}</section></div><div className="flex flex-wrap justify-end gap-2 border-t border-[#eadfdb] bg-white p-4 sm:px-7"><button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-[#eadfdb] px-4 py-2.5 text-sm font-semibold text-[#756b72] disabled:opacity-50">Close</button>{item.status === 'pending' && <><button type="button" onClick={() => { if (rejecting) onStatus('rejected', reason); else setRejecting(true); }} disabled={busy} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50">{rejecting ? 'Confirm rejection' : 'Reject'}</button><button type="button" onClick={() => onStatus('approved')} disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Approve & publish</button></>}{item.status === 'approved' && <button type="button" onClick={onEdit} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-[#e3d6df] px-4 py-2.5 text-sm font-semibold text-[#6b1e5b] disabled:opacity-50"><Pencil size={15} />Edit post</button>}{item.status === 'approved' && <button type="button" onClick={() => onStatus('closed')} disabled={busy} className="rounded-xl bg-[#6b1e5b] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Close post</button>}{(item.status === 'rejected' || item.status === 'closed') && <button type="button" onClick={() => onStatus('approved')} disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Approve & publish</button>}</div></div></div>, document.body);
}
