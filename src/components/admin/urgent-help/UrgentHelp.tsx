'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Edit3, Eye, Loader2, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { urgentHelpService, type UrgentHelpRequest, type UrgentHelpStatus } from '@/lib/services/urgentHelpService';
import EditUrgentHelpModal from './EditUrgentHelpModal';

const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const statusStyle: Record<UrgentHelpStatus, string> = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700', resolved: 'bg-slate-100 text-slate-600' };

export default function AdminUrgentHelp() {
  const { admin } = useAdminAuthStore();
  const [items, setItems] = useState<UrgentHelpRequest[]>([]);
  const [status, setStatus] = useState<UrgentHelpStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UrgentHelpRequest | null>(null);
  const [editing, setEditing] = useState<UrgentHelpRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('urgent_help');
  const load = async () => { setLoading(true); try { setItems(await urgentHelpService.getAllRequests()); } catch { toast.error('Could not load help requests.'); } finally { setLoading(false); } };
  useEffect(() => { if (canManage) void load(); }, [canManage]);
  const visible = useMemo(() => { const term = search.toLowerCase(); return items.filter(item => (status === 'all' || item.status === status) && (!term || `${item.title} ${item.location} ${item.ownerName}`.toLowerCase().includes(term))); }, [items, status, search]);

  const changeStatus = async (item: UrgentHelpRequest, next: UrgentHelpStatus) => {
    if (busy) return;
    let reason = '';
    if (next === 'rejected') {
      const result = await Swal.fire({ title: 'Reject this request?', text: 'Share a clear reason with the person who posted it.', icon: 'warning', input: 'textarea', inputLabel: 'Reason for rejection', inputValidator: value => value.trim().length < 5 ? 'Please enter at least 5 characters.' : undefined, showCancelButton: true, confirmButtonText: 'Reject request', cancelButtonText: 'Keep pending', confirmButtonColor: '#DC2626', background: '#FFF9F2', color: '#2A1636', reverseButtons: true });
      if (!result.isConfirmed) return;
      reason = String(result.value).trim();
    }
    setBusy(true);
    try { await urgentHelpService.updateStatus(item.id, next, reason); setItems(list => list.map(entry => entry.id === item.id ? { ...entry, status: next, rejectionReason: reason } : entry)); setSelected(null); toast.success(next === 'approved' ? 'Request approved and published.' : next === 'resolved' ? 'Request marked as resolved.' : 'Request rejected.'); }
    catch { toast.error('Could not update this request.'); }
    finally { setBusy(false); }
  };
  const saveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing || busy) return;
    const form = new FormData(event.currentTarget);
    const update = { title: String(form.get('title') || '').trim(), category: String(form.get('category')) as UrgentHelpRequest['category'], location: String(form.get('location') || '').trim(), message: String(form.get('message') || '').trim(), contactName: String(form.get('contactName') || '').trim(), email: String(form.get('email') || '').trim(), phone: String(form.get('phone') || '').trim() };
    setBusy(true);
    try { await urgentHelpService.updateRequest(editing.id, update); setItems(list => list.map(item => item.id === editing.id ? { ...item, ...update } : item)); if (selected?.id === editing.id) setSelected(item => item ? { ...item, ...update } : item); setEditing(null); toast.success('Help request updated.'); }
    catch { toast.error('Could not save the request changes.'); }
    finally { setBusy(false); }
  };
  const remove = async (item: UrgentHelpRequest) => {
    if (busy) return;
    const result = await Swal.fire({ title: 'Delete this request?', text: `"${item.title}" will be permanently removed from the board.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete request', cancelButtonText: 'Cancel', confirmButtonColor: '#DC2626', background: '#FFF9F2', color: '#2A1636', reverseButtons: true });
    if (!result.isConfirmed) return;
    setBusy(true);
    try { await urgentHelpService.deleteRequest(item.id); setItems(list => list.filter(entry => entry.id !== item.id)); setSelected(null); toast.success('Help request deleted.'); }
    catch { toast.error('Could not delete this request.'); }
    finally { setBusy(false); }
  };

  if (!canManage) return <p className="p-6 text-sm text-[#6B5E5A]">You do not have permission to manage urgent help.</p>;
  return <div className="mx-auto max-w-7xl">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Urgent Help</h1><p className="mt-2 text-sm text-[#6B5E5A]">Review and manage community support requests.</p></div><button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex items-center gap-2 rounded-xl border border-[#E7D7E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B1E5B]"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">{(['pending', 'approved', 'rejected', 'resolved'] as const).map(value => <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)} className={`rounded-2xl border bg-white p-5 text-left ${status === value ? 'border-[#B45337]' : 'border-[#E7D7E8]'}`}><span className="text-xs capitalize text-[#6B5E5A]">{value === 'pending' ? 'Pending review' : value}</span><strong className="mt-2 block text-2xl text-[#2A1636]">{items.filter(item => item.status === value).length}</strong></button>)}</div>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search requests, locations or posters" className="w-full rounded-xl border border-[#E7D7E8] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#B45337]" /></label><select value={status} onChange={event => setStatus(event.target.value as UrgentHelpStatus | 'all')} className="rounded-xl border border-[#E7D7E8] bg-white px-4 py-3 text-sm"><option value="all">All statuses</option><option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="resolved">Resolved</option></select></div>
    <div className="overflow-hidden rounded-2xl border border-[#E7D7E8] bg-white shadow-sm">{loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-[#6B5E5A]"><Loader2 className="h-5 w-5 animate-spin" />Loading requests...</div> : visible.length === 0 ? <p className="p-12 text-center text-sm text-[#6B5E5A]">No requests match this view.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left"><thead className="bg-[#F8F1F7] text-xs uppercase tracking-wider text-[#6B5E5A]"><tr><th className="px-5 py-4">Request</th><th className="px-5 py-4">Posted by</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Actions</th></tr></thead><tbody className="divide-y divide-[#F0E7EE]">{visible.map(item => <tr key={item.id} className="align-top"><td className="px-5 py-4"><strong className="block text-sm text-[#2A1636]">{item.title}</strong><span className="text-xs text-[#6B5E5A]">{item.category} · {date(item.createdAt)}</span></td><td className="px-5 py-4 text-sm text-[#6B5E5A]">{item.ownerName}<span className="block text-xs">{item.contactName}</span><span className="block text-xs">{item.email}</span></td><td className="px-5 py-4 text-xs text-[#6B5E5A]">{item.location}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyle[item.status]}`}>{item.status}</span></td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7D7E8] px-2.5 py-2 text-xs font-semibold text-[#6B1E5B]"><Eye className="h-3.5 w-3.5" />View</button><button type="button" disabled={busy} onClick={() => setEditing(item)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7D7E8] px-2.5 py-2 text-xs font-semibold text-[#6B1E5B]"><Edit3 className="h-3.5 w-3.5" />Edit</button><button type="button" disabled={busy} onClick={() => void remove(item)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" />Delete</button>{item.status === 'pending' && <><button type="button" disabled={busy} onClick={() => void changeStatus(item, 'approved')} className="rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-semibold text-white"><Check className="inline h-3.5 w-3.5" />Approve</button><button type="button" disabled={busy} onClick={() => void changeStatus(item, 'rejected')} className="rounded-lg bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-700"><X className="inline h-3.5 w-3.5" />Reject</button></>}{item.status === 'approved' && <button type="button" disabled={busy} onClick={() => void changeStatus(item, 'resolved')} className="rounded-lg bg-[#B45337] px-2.5 py-2 text-xs font-semibold text-white">Mark resolved</button>}</div></td></tr>)}</tbody></table></div>}</div>
    {selected && <Review item={selected} busy={busy} close={() => !busy && setSelected(null)} approve={() => void changeStatus(selected, 'approved')} reject={() => void changeStatus(selected, 'rejected')} resolve={() => void changeStatus(selected, 'resolved')} />}
    {editing && <EditUrgentHelpModal item={editing} saving={busy} onClose={() => !busy && setEditing(null)} onSave={saveEdit} />}
  </div>;
}
function Review({ item, busy, close, approve, reject, resolve }: { item: UrgentHelpRequest; busy: boolean; close: () => void; approve: () => void; reject: () => void; resolve: () => void }) { return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="flex max-h-[calc(100dvh-32px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#FFF9F2] shadow-2xl"><div className="flex items-start justify-between border-b border-[#E7D7E8] p-5 sm:px-7"><div><p className="text-xs font-semibold text-[#B45337]">{item.category}</p><h2 className="mt-1 text-xl font-bold text-[#2A1636]">{item.title}</h2><p className="mt-2 text-sm text-[#6B5E5A]">{item.location}</p></div><button onClick={close} disabled={busy} className="rounded-lg p-2 hover:bg-[#E7D7E8]/50"><X className="h-5 w-5" /></button></div><div className="min-h-0 space-y-5 overflow-y-auto p-5 text-sm leading-7 text-[#6B5E5A] sm:p-7"><p className="whitespace-pre-wrap">{item.message}</p><div className="rounded-xl bg-white p-4"><strong className="text-[#2A1636]">Contact</strong><p>{item.contactName} · <a className="text-[#B45337]" href={`tel:${item.phone}`}>{item.phone}</a></p>{item.email && <a className="break-all text-[#B45337]" href={`mailto:${item.email}`}>{item.email}</a>}</div>{item.media.map(media => media.type.startsWith('video/') ? <video key={media.url} controls className="max-h-80 w-full rounded-xl bg-black" src={media.url} /> : <img key={media.url} src={media.url} alt={media.name} className="max-h-80 w-full rounded-xl object-contain" />)}</div><div className="flex flex-wrap justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7"><button disabled={busy} onClick={close} className="rounded-xl border border-[#E7D7E8] px-4 py-2.5 text-sm">Close</button>{item.status === 'pending' && <><button disabled={busy} onClick={reject} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">Reject</button><button disabled={busy} onClick={approve} className="rounded-xl bg-[#B45337] px-4 py-2.5 text-sm font-semibold text-white">Approve & publish</button></>}{item.status === 'approved' && <button disabled={busy} onClick={resolve} className="rounded-xl bg-[#B45337] px-4 py-2.5 text-sm font-semibold text-white">Mark resolved</button>}</div></div></div>; }
