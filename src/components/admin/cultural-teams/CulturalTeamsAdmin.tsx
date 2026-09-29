'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, Mail, RefreshCw, Search, Users, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { culturalTeamsService } from '@/lib/services/culturalTeamsService';
import type { CulturalTeam, CulturalTeamContact, CulturalTeamEnquiry, CulturalTeamStatus, EnquiryStatus } from '@/lib/culturalTeams/types';

const teamTone = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-rose-50 text-rose-700' };
const enquiryTone = { new: 'bg-amber-50 text-amber-700', contacted: 'bg-sky-50 text-sky-700', closed: 'bg-slate-100 text-slate-700' };
const field = 'mt-1.5 w-full rounded-xl border border-[#e5d8d5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8a465b]';
const availability = (team: CulturalTeam) => [team.travelScopes.includes('states') ? team.availableStates.join(', ') : '', team.travelScopes.includes('national') ? 'Across India' : '', team.travelScopes.includes('international') ? 'International' : ''].filter(Boolean).join(' · ');

export default function CulturalTeamsAdmin() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('cultural_teams');
  const [tab, setTab] = useState<'teams' | 'enquiries'>('teams');
  const [teams, setTeams] = useState<CulturalTeam[]>([]);
  const [enquiries, setEnquiries] = useState<CulturalTeamEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState<CulturalTeam | null>(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState<CulturalTeamEnquiry | null>(null);
  const [contact, setContact] = useState<CulturalTeamContact | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { if (!isAuthenticated) router.push('/admin/login'); else if (!canManage) router.push('/admin/dashboard'); }, [isAuthenticated, canManage, router]);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [teamList, enquiryList] = await Promise.all([culturalTeamsService.getAllTeams(), culturalTeamsService.getAllEnquiries()]);
      setTeams(teamList); setEnquiries(enquiryList);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load cultural teams.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isAuthenticated && canManage) void load(); }, [isAuthenticated, canManage]);
  const visibleTeams = useMemo(() => teams.filter(team => (filter === 'all' || team.status === filter)
    && (!search.trim() || `${team.name} ${team.artForm} ${team.baseCity} ${team.baseState}`.toLowerCase().includes(search.trim().toLowerCase()))), [teams, filter, search]);
  const visibleEnquiries = useMemo(() => enquiries.filter(enquiry => (filter === 'all' || enquiry.status === filter)
    && (!search.trim() || `${enquiry.teamName} ${enquiry.organiserName} ${enquiry.eventLocation}`.toLowerCase().includes(search.trim().toLowerCase()))), [enquiries, filter, search]);

  const openTeam = async (team: CulturalTeam) => {
    setSelectedTeam(team); setSelectedEnquiry(null); setContact(null); setContactLoading(true); setFormError('');
    try { setContact(await culturalTeamsService.getContact(team.id)); }
    catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not load private contact details.'); }
    finally { setContactLoading(false); }
  };
  const openEnquiry = async (enquiry: CulturalTeamEnquiry) => {
    setSelectedEnquiry(enquiry); setSelectedTeam(null); setContact(null); setContactLoading(true); setFormError('');
    try { setContact(await culturalTeamsService.getContact(enquiry.teamId)); }
    catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not load the team contact.'); }
    finally { setContactLoading(false); }
  };
  const changeTeamStatus = async (next: CulturalTeamStatus, reason = '') => {
    if (!selectedTeam || busy) return;
    if (next === 'rejected' && !reason.trim()) { setFormError('Add a reason so the team can see what happened.'); return; }
    setBusy(true); setFormError('');
    try {
      await culturalTeamsService.setStatus(selectedTeam.id, next, reason);
      setTeams(current => current.map(team => team.id === selectedTeam.id ? { ...team, status: next, rejectionReason: next === 'rejected' ? reason.trim() : '' } : team));
      setSelectedTeam(null); toast.success(next === 'approved' ? 'Team is now public.' : next === 'rejected' ? 'Application rejected.' : 'Team moved to pending.');
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not update the team.'); }
    finally { setBusy(false); }
  };
  const saveEnquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEnquiry || busy) return;
    const form = new FormData(event.currentTarget);
    const status = String(form.get('status')) as EnquiryStatus;
    const adminNotes = String(form.get('adminNotes') || '').trim();
    setBusy(true); setFormError('');
    try {
      await culturalTeamsService.updateEnquiry(selectedEnquiry.id, status, adminNotes);
      setEnquiries(current => current.map(item => item.id === selectedEnquiry.id ? { ...item, status, adminNotes } : item));
      setSelectedEnquiry(null); toast.success('Enquiry updated.');
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : 'Could not update enquiry.'); }
    finally { setBusy(false); }
  };

  if (!isAuthenticated || !canManage) return <p className="p-6 text-sm">Checking access...</p>;
  return <div className="mx-auto max-w-7xl pb-12 text-[#382333]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a65c52]">CULTURAL DIRECTORY</p><h1 className="mt-2 font-serif text-3xl font-bold">Cultural teams</h1><p className="mt-2 text-sm text-[#806f75]">Review team applications and coordinate program enquiries.</p></div><button type="button" onClick={() => void load()} disabled={loading || busy} className="inline-flex items-center gap-2 rounded-xl border border-[#e9dcd5] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} />Refresh</button></div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-[#e9dcd5] bg-white p-5"><Users className="text-[#a65c52]" /><strong className="mt-3 block text-2xl">{teams.filter(team => team.status === 'pending').length}</strong><span className="text-xs text-[#806f75]">Pending applications</span></div><div className="rounded-2xl border border-[#e9dcd5] bg-white p-5"><Check className="text-[#a65c52]" /><strong className="mt-3 block text-2xl">{teams.filter(team => team.status === 'approved').length}</strong><span className="text-xs text-[#806f75]">Published teams</span></div><div className="rounded-2xl border border-[#e9dcd5] bg-white p-5"><Mail className="text-[#a65c52]" /><strong className="mt-3 block text-2xl">{enquiries.filter(item => item.status === 'new').length}</strong><span className="text-xs text-[#806f75]">New enquiries</span></div></div>
    <div className="mt-7 inline-flex rounded-xl border border-[#e9dcd5] bg-white p-1"><button type="button" onClick={() => { setTab('teams'); setFilter('all'); setSearch(''); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'teams' ? 'bg-[#8a465b] text-white' : 'text-[#806f75]'}`}>Teams ({teams.length})</button><button type="button" onClick={() => { setTab('enquiries'); setFilter('all'); setSearch(''); }} className={`rounded-lg px-4 py-2 text-sm font-semibold ${tab === 'enquiries' ? 'bg-[#8a465b] text-white' : 'text-[#806f75]'}`}>Enquiries ({enquiries.length})</button></div><div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#e9dcd5] bg-white p-3 sm:flex-row"><label className="relative flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ab989b]" /><span className="sr-only">Search</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder={tab === 'teams' ? 'Search teams, art forms or cities' : 'Search teams, organisers or locations'} className="w-full rounded-xl bg-[#fbf5f1] py-3 pl-10 pr-4 text-sm outline-none" /></label><select aria-label="Filter by status" value={filter} onChange={event => setFilter(event.target.value)} className="rounded-xl bg-[#fbf5f1] px-4 py-3 text-sm sm:w-44"><option value="all">All statuses</option>{(tab === 'teams' ? ['pending', 'approved', 'rejected'] : ['new', 'contacted', 'closed']).map(value => <option key={value} value={value} className="capitalize">{value}</option>)}</select></div>
    {error ? <div role="alert" className="mt-5 rounded-2xl bg-white p-8 text-center text-sm text-red-700">{error}<button type="button" onClick={() => void load()} className="ml-2 underline">Retry</button></div> : loading ? <div role="status" className="mt-5 rounded-2xl bg-white p-12 text-center text-sm text-[#806f75]">Loading...</div> : tab === 'teams' ? <div className="mt-5 grid gap-3">{visibleTeams.length ? visibleTeams.map(team => <article key={team.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e9dcd5] bg-white p-4 sm:p-5"><div className="flex min-w-0 items-center gap-4">{team.images[0] ? <img src={team.images[0].url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" /> : <div className="h-16 w-16 rounded-xl bg-[#f7eee9]" />}<div className="min-w-0"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${teamTone[team.status]}`}>{team.status}</span><h2 className="mt-2 truncate font-semibold">{team.name}</h2><p className="mt-1 text-xs text-[#806f75]">{team.artForm} · {team.baseCity}, {team.baseState} · {team.images.length} photos</p></div></div><button type="button" onClick={() => void openTeam(team)} className="inline-flex items-center gap-2 rounded-xl border border-[#e9dcd5] px-4 py-2.5 text-xs font-bold text-[#8a465b]">Review <ChevronRight size={15} /></button></article>) : <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#806f75]">No team applications match this view.</div>}</div> : <div className="mt-5 grid gap-3">{visibleEnquiries.length ? visibleEnquiries.map(enquiry => <article key={enquiry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e9dcd5] bg-white p-5"><div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${enquiryTone[enquiry.status]}`}>{enquiry.status}</span><h2 className="mt-2 font-semibold">{enquiry.organiserName} <span className="font-normal text-[#806f75]">→ {enquiry.teamName}</span></h2><p className="mt-1 text-xs text-[#806f75]">{enquiry.eventType} · {enquiry.eventLocation} {enquiry.eventDate && `· ${enquiry.eventDate}`}</p></div><button type="button" onClick={() => void openEnquiry(enquiry)} className="inline-flex items-center gap-2 rounded-xl border border-[#e9dcd5] px-4 py-2.5 text-xs font-bold text-[#8a465b]">Coordinate <ChevronRight size={15} /></button></article>) : <div className="rounded-2xl bg-white p-10 text-center text-sm text-[#806f75]">No enquiries match this view.</div>}</div>}
    {(selectedTeam || selectedEnquiry) && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#241b2b]/70 p-3 backdrop-blur-sm" onMouseDown={event => { if (event.target === event.currentTarget && !busy) { setSelectedTeam(null); setSelectedEnquiry(null); } }}><div role="dialog" aria-modal="true" aria-labelledby="cultural-admin-dialog" className="flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] bg-[#fdf9f5]"><div className="flex items-start justify-between gap-4 border-b border-[#e9dcd5] bg-white p-5"><div><p className="text-xs font-bold uppercase tracking-wide text-[#a65c52]">{selectedTeam ? 'TEAM APPLICATION' : 'PROGRAM ENQUIRY'}</p><h2 id="cultural-admin-dialog" className="mt-1 font-serif text-xl font-bold">{selectedTeam?.name || selectedEnquiry?.teamName}</h2></div><button type="button" onClick={() => { if (!busy) { setSelectedTeam(null); setSelectedEnquiry(null); } }} aria-label="Close"><X size={19} /></button></div><div className="min-h-0 overflow-y-auto p-5 sm:p-7">{selectedTeam && <><div className="grid grid-cols-3 gap-2">{selectedTeam.images.map((image, index) => <a key={image.path} href={image.url} target="_blank" rel="noopener noreferrer" title="Open full image"><img src={image.url} alt={`${selectedTeam.name} photo ${index + 1}`} className="h-24 w-full rounded-xl object-cover sm:h-36" /></a>)}</div><div className="mt-5 flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${teamTone[selectedTeam.status]}`}>{selectedTeam.status}</span><span className="rounded-full bg-white px-3 py-1 text-xs">{selectedTeam.artForm}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#6f5964]">{selectedTeam.description}</p><div className="mt-5 grid gap-3 rounded-2xl bg-white p-5 text-sm sm:grid-cols-2"><p><span className="block text-xs text-[#99838b]">Based in</span>{selectedTeam.baseCity}, {selectedTeam.baseState}, {selectedTeam.baseCountry}</p><p><span className="block text-xs text-[#99838b]">Team size and languages</span>{selectedTeam.memberCount} members · {selectedTeam.languages}</p><p className="sm:col-span-2"><span className="block text-xs text-[#99838b]">Available for programs</span>{availability(selectedTeam)}</p></div><PrivateContact contact={contact} loading={contactLoading} />{selectedTeam.rejectionReason && <p className="mt-4 rounded-xl bg-rose-50 p-4 text-xs text-rose-700">Previous reason: {selectedTeam.rejectionReason}</p>}<label className="mt-5 block text-xs font-semibold">Reason for rejection<textarea id="team-rejection-reason" maxLength={1000} rows={2} placeholder="Required when rejecting" className={field} /></label>{formError && <p role="alert" className="mt-3 text-xs text-red-700">{formError}</p>}<div className="mt-5 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => void changeTeamStatus('pending')} disabled={busy || selectedTeam.status === 'pending'} className="rounded-xl border border-[#e9dcd5] px-4 py-2.5 text-xs font-bold disabled:opacity-50">Move to pending</button><button type="button" onClick={() => void changeTeamStatus('rejected', (document.getElementById('team-rejection-reason') as HTMLTextAreaElement)?.value || '')} disabled={busy} className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-50">Reject</button><button type="button" onClick={() => void changeTeamStatus('approved')} disabled={busy || selectedTeam.status === 'approved'} className="rounded-xl bg-[#8a465b] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Approve & publish</button></div></>}
      {selectedEnquiry && <><div className="grid gap-3 rounded-2xl bg-white p-5 text-sm sm:grid-cols-2"><p><span className="block text-xs text-[#99838b]">Organiser</span>{selectedEnquiry.organiserName}</p><p><span className="block text-xs text-[#99838b]">Program</span>{selectedEnquiry.eventType}</p><p><span className="block text-xs text-[#99838b]">Date</span>{selectedEnquiry.eventDate || 'To be confirmed'}</p><p><span className="block text-xs text-[#99838b]">Location</span>{selectedEnquiry.eventLocation}</p><p><span className="block text-xs text-[#99838b]">Email</span><a href={`mailto:${selectedEnquiry.email}`} className="break-all text-[#8a465b] underline">{selectedEnquiry.email}</a></p><p><span className="block text-xs text-[#99838b]">Phone</span><a href={`tel:${selectedEnquiry.phone}`} className="text-[#8a465b] underline">{selectedEnquiry.phone}</a></p></div><div className="mt-4 rounded-2xl bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#99838b]">Program details</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{selectedEnquiry.message}</p></div><PrivateContact contact={contact} loading={contactLoading} /><form key={selectedEnquiry.id} onSubmit={saveEnquiry} className="mt-5 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold">Status<select name="status" defaultValue={selectedEnquiry.status} className={field}><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label></div><label className="block text-xs font-semibold">Private admin notes<textarea name="adminNotes" defaultValue={selectedEnquiry.adminNotes} maxLength={2000} rows={3} placeholder="Record coordination updates; not visible to the public" className={field} /></label>{formError && <p role="alert" className="text-xs text-red-700">{formError}</p>}<div className="flex justify-end"><button type="submit" disabled={busy} className="rounded-xl bg-[#8a465b] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Save enquiry update'}</button></div></form></>}</div></div></div>}
  </div>;
}

function PrivateContact({ contact, loading }: { contact: CulturalTeamContact | null; loading: boolean }) {
  return <div className="mt-4 rounded-2xl border border-[#e9dcd5] bg-[#f7eee9] p-5"><p className="text-xs font-bold uppercase tracking-wide text-[#8a465b]">Private team contact · admin only</p>{loading ? <p className="mt-2 text-xs text-[#806f75]">Loading contact...</p> : contact ? <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><strong>{contact.contactName}</strong><a href={`mailto:${contact.email}`} className="break-all text-[#8a465b] underline">{contact.email}</a><a href={`tel:${contact.phone}`} className="text-[#8a465b] underline">{contact.phone}</a></div> : <p className="mt-2 text-xs text-[#806f75]">Contact details are unavailable.</p>}</div>;
}
