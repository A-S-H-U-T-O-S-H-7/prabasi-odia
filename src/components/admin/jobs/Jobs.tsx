"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Check, Eye, FileText, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import useAdminAuthStore from '@/lib/store/useAdminAuthStore';
import { adminJobsService, type Job, type JobApplication, type JobStatus } from '@/lib/services/adminJobsService';

const date = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const statusStyles: Record<JobStatus, string> = { pending: 'bg-amber-50 text-amber-700', approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700', closed: 'bg-slate-100 text-slate-600' };

export default function AdminJobsPage() {
  const router = useRouter();
  const { admin, isAuthenticated } = useAdminAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<JobStatus | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [busy, setBusy] = useState(false);
  const applicationRequest = useRef(0);
  const canManage = admin?.role === 'super_admin' || admin?.permissions?.includes('jobs');

  useEffect(() => {
    if (!isAuthenticated) router.push('/admin/login');
    else if (!canManage) router.push('/admin/dashboard');
  }, [isAuthenticated, canManage, router]);

  const load = async () => {
    setLoading(true); setLoadError('');
    try { setJobs(await adminJobsService.getJobs()); }
    catch { setLoadError('Could not load submissions. Please try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (isAuthenticated && canManage) void load(); }, [isAuthenticated, canManage]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter(job => (status === 'all' || job.status === status) && (!term || `${job.title} ${job.company} ${job.location} ${job.ownerName}`.toLowerCase().includes(term)));
  }, [jobs, search, status]);

  const updateStatus = async (job: Job, next: JobStatus) => {
    if (busy) return;
    let reason = '';
    if (next === 'rejected') {
      const result = await Swal.fire({
        title: 'Reject this opportunity?',
        text: `Provide feedback for "${job.title}" so the poster knows why it was rejected.`,
        icon: 'warning', input: 'textarea', inputLabel: 'Reason for rejection',
        inputPlaceholder: 'Explain what needs to be corrected...',
        inputAttributes: { maxlength: '1000', 'aria-label': 'Reason for rejection' },
        inputValidator: value => value.trim().length < 5 ? 'Please enter a reason with at least 5 characters.' : undefined,
        showCancelButton: true, confirmButtonText: 'Reject opportunity', cancelButtonText: 'Keep pending',
        confirmButtonColor: '#DC2626', cancelButtonColor: '#6B7280',
        background: '#FFF9F2', color: '#2A1636', reverseButtons: true,
      });
      if (!result.isConfirmed) return;
      reason = String(result.value).trim();
    }
    setBusy(true);
    try {
      await adminJobsService.updateStatus(job.id, next, reason);
      setJobs(items => items.map(item => item.id === job.id ? { ...item, status: next, rejectionReason: reason } : item));
      setSelected(null); setApplications([]); applicationRequest.current++;
      toast.success(next === 'approved' ? 'Opportunity approved and published.' : next === 'rejected' ? 'Opportunity rejected.' : 'Opportunity closed.');
    } catch { toast.error('Could not update this opportunity. Please try again.'); }
    finally { setBusy(false); }
  };

  const viewJob = async (job: Job) => {
    const request = ++applicationRequest.current;
    setSelected(job); setApplications([]); setApplicationsError('');
    if (job.status === 'pending') { setApplicationsLoading(false); return; }
    setApplicationsLoading(true);
    try {
      const result = await adminJobsService.getApplications(job.id);
      if (request === applicationRequest.current) setApplications(result);
    } catch { if (request === applicationRequest.current) setApplicationsError('Could not load applications. Please try again.'); }
    finally { if (request === applicationRequest.current) setApplicationsLoading(false); }
  };
  const closeReview = () => {
    if (busy) return;
    applicationRequest.current++; setSelected(null); setApplications([]);
  };
  const changeApplicationStatus = async (application: JobApplication, next: JobApplication['status']) => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await adminJobsService.updateApplicationStatus(selected.id, application.id, next);
      setApplications(items => items.map(item => item.id === application.id ? { ...item, status: next } : item));
      toast.success('Applicant status updated.');
    } catch { toast.error('Could not update the applicant status.'); }
    finally { setBusy(false); }
  };

  if (!isAuthenticated || !canManage) return <p className="p-6 text-sm text-[#6B5E5A]">Checking access...</p>;
  return <div className="mx-auto max-w-7xl">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Jobs & Startups</h1><p className="mt-2 text-sm text-[#6B5E5A]">Review opportunities and manage applications from the community.</p></div>
      <button type="button" disabled={loading || busy} onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7D7E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B1E5B] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
    </div>
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {(['pending', 'approved', 'rejected', 'closed'] as const).map(value => <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)} className={`rounded-2xl border bg-white p-5 text-left ${status === value ? 'border-[#6B1E5B]' : 'border-[#E7D7E8]'}`}><span className="text-xs capitalize text-[#6B5E5A]">{value === 'pending' ? 'Pending review' : value}</span><strong className="mt-2 block text-2xl font-bold text-[#2A1636]">{loading ? '—' : jobs.filter(job => job.status === value).length}</strong></button>)}
    </div>
    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]" /><input value={search} onChange={event => setSearch(event.target.value)} aria-label="Search job submissions" placeholder="Search jobs, companies or submitters" className="w-full rounded-xl border border-[#E7D7E8] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#6B1E5B]" /></label>
      <select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value as JobStatus | 'all')} className="rounded-xl border border-[#E7D7E8] bg-white px-4 py-3 text-sm outline-none focus:border-[#6B1E5B]"><option value="all">All statuses</option><option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="closed">Closed</option></select>
    </div>
    <div className="overflow-hidden rounded-2xl border border-[#E7D7E8] bg-white shadow-sm">
      {loadError ? <div role="alert" className="p-12 text-center"><p className="text-sm text-red-600">{loadError}</p><button onClick={() => void load()} className="mt-3 text-sm font-semibold text-[#6B1E5B]">Try again</button></div> : loading ? <div role="status" className="flex items-center justify-center gap-2 p-12 text-sm text-[#6B5E5A]"><Loader2 className="h-5 w-5 animate-spin" />Loading submissions...</div> : visible.length === 0 ? <div className="p-12 text-center text-sm text-[#6B5E5A]">No submissions match this view.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left">
        <thead className="bg-[#F8F1F7] text-xs uppercase tracking-wider text-[#6B5E5A]"><tr>{['Opportunity', 'Submitted by', 'Category', 'Status', 'Actions'].map(label => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#F0E7EE]">{visible.map(job => <tr key={job.id} className="align-top hover:bg-[#FFF9F2]/60">
          <td className="max-w-xs px-5 py-4"><strong className="block break-words text-sm text-[#2A1636]">{job.title}</strong><span className="text-xs text-[#6B5E5A]">{job.company} · {job.location}</span><span className="mt-1 block text-[11px] text-[#8A7B82]">{date(job.createdAt)}</span></td>
          <td className="px-5 py-4 text-sm text-[#6B5E5A]">{job.ownerName}<span className="block text-xs">{job.contactEmail}</span></td>
          <td className="px-5 py-4 text-xs text-[#6B5E5A]">{job.category}</td>
          <td className="px-5 py-4"><span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[job.status]}`}>{job.status}</span></td>
          <td className="px-5 py-4"><div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void viewJob(job)} className="inline-flex items-center gap-1 rounded-lg border border-[#E7D7E8] px-2.5 py-2 text-xs font-semibold text-[#6B1E5B] disabled:opacity-50"><Eye className="h-3.5 w-3.5" /> View</button>
            {job.status === 'pending' && <><button type="button" disabled={busy} onClick={() => void updateStatus(job, 'approved')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Approve</button><button type="button" disabled={busy} onClick={() => void updateStatus(job, 'rejected')} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"><X className="h-3.5 w-3.5" /> Reject</button></>}
            {job.status !== 'pending' && <button type="button" disabled={busy} onClick={() => void viewJob(job)} className="inline-flex items-center gap-1 rounded-lg bg-[#6B1E5B] px-2.5 py-2 text-xs font-semibold text-white disabled:opacity-50"><FileText className="h-3.5 w-3.5" /> Applicants</button>}
          </div></td>
        </tr>)}</tbody>
      </table></div>}
    </div>
    {selected && <JobReviewModal job={selected} applications={applications} loading={applicationsLoading} error={applicationsError} busy={busy} onRetry={() => void viewJob(selected)} onClose={closeReview} onApprove={() => void updateStatus(selected, 'approved')} onReject={() => void updateStatus(selected, 'rejected')} onCloseJob={() => void updateStatus(selected, 'closed')} onApplicationStatus={changeApplicationStatus} />}
  </div>;
}

function JobReviewModal({ job, applications, loading, error, busy, onClose, onApprove, onReject, onCloseJob, onRetry, onApplicationStatus }: {
  job: Job; applications: JobApplication[]; loading: boolean; error: string; busy: boolean;
  onClose: () => void; onApprove: () => void; onReject: () => void; onCloseJob: () => void; onRetry: () => void;
  onApplicationStatus: (application: JobApplication, status: JobApplication['status']) => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy && !Swal.isVisible()) onClose(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [busy, onClose]);
  return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
    <div role="dialog" aria-modal="true" aria-labelledby="job-review-title" className="flex max-h-[calc(100dvh-32px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E7D7E8] bg-[#FFF9F2] shadow-2xl">
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E7D7E8] p-5 sm:px-7"><div><p className="text-xs font-semibold text-[#8A2E72]">{job.company}</p><h2 id="job-review-title" className="mt-1 break-words text-xl font-bold text-[#2A1636]">{job.title}</h2><p className="mt-2 text-xs text-[#6B5E5A]">{job.location} · {job.category}</p></div><button type="button" autoFocus disabled={busy} onClick={onClose} aria-label="Close review" className="shrink-0 rounded-lg p-2 hover:bg-[#E7D7E8]/50 disabled:opacity-50"><X className="h-5 w-5" /></button></div>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-[#6B5E5A]"><span className={`rounded-full px-3 py-1 font-semibold capitalize ${statusStyles[job.status]}`}>{job.status}</span><span>Submitted {date(job.createdAt)} by {job.ownerName}</span></div>
        <h3 className="mb-2 text-sm font-semibold text-[#2A1636]">About the opportunity</h3><p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#6B5E5A]">{job.description}</p>
        {job.compensation && <p className="mt-4 text-sm text-[#6B5E5A]"><strong>Compensation:</strong> {job.compensation}</p>}
        <div className="mt-5 rounded-xl border border-[#E7D7E8] bg-white p-4 text-sm text-[#6B5E5A]"><strong className="text-[#2A1636]">Contact person</strong><p className="mt-1">{job.contactName}</p><a className="break-all text-[#6B1E5B]" href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a></div>
        {job.rejectionReason && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-700"><strong>Rejection reason:</strong> {job.rejectionReason}</p>}
        {job.status !== 'pending' && <section className="mt-7 border-t border-[#E7D7E8] pt-6"><h3 className="text-lg font-bold text-[#2A1636]">Applicants{!loading && !error && ` (${applications.length})`}</h3>
          {loading ? <p role="status" className="mt-4 flex items-center gap-2 text-sm text-[#6B5E5A]"><Loader2 className="h-4 w-4 animate-spin" /> Loading applicants...</p> : error ? <div role="alert" className="mt-4 text-sm text-red-700">{error}<button type="button" onClick={onRetry} className="ml-2 underline">Retry</button></div> : applications.length === 0 ? <p className="mt-3 text-sm text-[#6B5E5A]">No applications received yet.</p> : <div className="mt-4 space-y-4">{applications.map(application => <article key={application.id} className="rounded-xl border border-[#E7D7E8] bg-white p-4">
            <div className="flex flex-wrap justify-between gap-3"><div><strong className="text-sm text-[#2A1636]">{application.name}</strong><div className="mt-2 flex flex-wrap gap-2 text-xs text-[#6B5E5A]"><a href={`mailto:${application.email}`} className="break-all hover:text-[#6B1E5B]">{application.email}</a><a href={`tel:${application.phone}`} className="hover:text-[#6B1E5B]">{application.phone}</a></div></div><select disabled={busy} aria-label={`Status for ${application.name}`} value={application.status} onChange={event => onApplicationStatus(application, event.target.value as JobApplication['status'])} className="h-fit rounded-lg border border-[#D4C8C0] bg-white px-2 py-2 text-xs disabled:opacity-50"><option>new</option><option>reviewed</option><option>contacted</option><option>declined</option></select></div>
            {application.note && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#6B5E5A]">{application.note}</p>}
            {application.resumeUrl && <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 break-all text-xs font-semibold text-[#6B1E5B]"><FileText className="h-4 w-4 shrink-0" />{application.resumeName || 'View resume'}</a>}
            <p className="mt-3 text-[11px] text-[#8A7B82]">Received {date(application.createdAt)}</p>
          </article>)}</div>}
        </section>}
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-[#E7D7E8] bg-white p-4 sm:px-7">
        <button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-[#E7D7E8] px-4 py-2.5 text-sm font-semibold text-[#6B5E5A] disabled:opacity-50">Close</button>
        {job.status === 'pending' && <><button type="button" disabled={busy} onClick={onReject} className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50">Reject</button><button type="button" disabled={busy} onClick={onApprove} className="rounded-xl bg-[#6B1E5B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving...' : 'Approve & publish'}</button></>}
        {job.status === 'approved' && <button type="button" disabled={busy} onClick={onCloseJob} className="rounded-xl bg-[#6B1E5B] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Close opportunity</button>}
      </div>
    </div>
  </div>, document.body);
}
