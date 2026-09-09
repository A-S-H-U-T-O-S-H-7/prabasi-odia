"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BriefcaseBusiness, Loader2, LockKeyhole, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore, useUserStore } from '@/lib/store';
import { jobsService, type Job } from '@/lib/services/jobsService';
import JobApplicationModal from './JobApplicationModal';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import JobForm from './JobForm';
import JobHero from './JobHero';

export default function Jobs() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { profile } = useUserStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const currentProfile = profile?.uid === user?.uid ? profile : null;
  const verifiedMember = Boolean((currentProfile?.hasJoinedCommunity ?? user?.hasJoinedCommunity) && (currentProfile?.isVerified ?? user?.isVerified));

  const loadJobs = async () => {
    setLoading(true); setLoadError('');
    try { setJobs(await jobsService.getApprovedJobs()); }
    catch { setLoadError('Unable to load opportunities right now. Please try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void loadJobs(); }, []);
  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter(job => (category === 'all' || job.category === category) && (!term || `${job.title} ${job.company} ${job.location} ${job.description}`.toLowerCase().includes(term)));
  }, [jobs, search, category]);

  const openPostForm = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!verifiedMember) { toast.error('Your membership application must be approved before you can post an opportunity.'); return; }
    setFormError(''); setShowJobForm(true);
  };
  const submitJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting || !user?.uid) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true); setFormError('');
    try {
      await jobsService.createJob({
        title: String(form.get('title') || '').trim(), company: String(form.get('company') || '').trim(), category: String(form.get('category') || 'Full-time') as Job['category'],
        location: String(form.get('location') || '').trim(), description: String(form.get('description') || '').trim(), compensation: String(form.get('compensation') || '').trim(),
        contactName: String(form.get('contactName') || '').trim(), contactEmail: String(form.get('contactEmail') || '').trim(), ownerId: user.uid, ownerName: user.displayName || user.email || '',
      });
      setShowJobForm(false); toast.success('Submitted successfully. Your opportunity will appear after admin approval.');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Could not submit the opportunity.'); }
    finally { setSubmitting(false); }
  };
  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedJob || submitting) return;
    if (!isAuthenticated || !user?.uid) { router.push('/login'); return; }
    const form = new FormData(event.currentTarget);
    const resume = form.get('resume');
    setSubmitting(true); setFormError('');
    try {
      if (resume instanceof File && resume.size && (resume.size > 5 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(resume.name))) throw new Error('Choose a PDF, DOC or DOCX resume up to 5 MB.');
      await jobsService.applyToJob(selectedJob.id, { applicantId: user.uid, name: String(form.get('name') || '').trim(), email: String(form.get('email') || '').trim(), phone: String(form.get('phone') || '').trim(), note: String(form.get('note') || '').trim() }, resume instanceof File && resume.size ? resume : undefined);
      setSelectedJob(null); toast.success('Your application has been saved successfully.');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'Could not send your interest.'); }
    finally { setSubmitting(false); }
  };

  return <div className="min-h-screen bg-[#FFF9F2] px-4 py-6 sm:px-6 md:py-8">
    <div className="mx-auto max-w-7xl">
      <button type="button" onClick={() => router.back()} className="mb-5 inline-flex items-center gap-2 text-sm text-[#6B5E5A] hover:text-[#6B1E5B]"><ArrowLeft className="h-4 w-4" /> Back</button>
      <JobHero totalJobs={jobs.length} categories={new Set(jobs.map(job => job.category)).size} loading={loading || !!loadError} />
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h2 className="text-2xl font-bold text-[#2A1636]">Explore opportunities</h2><p className="mt-2 text-sm text-[#6B5E5A]">Find a role, internship or startup to grow with.</p></div>
        <button type="button" disabled={authLoading} onClick={openPostForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B1E5B] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#531547] disabled:opacity-50"><Plus className="h-4 w-4" /> Share an opportunity</button>
      </section>
      <JobFilters search={search} category={category} onSearch={setSearch} onCategory={setCategory} />
      {!isAuthenticated && !authLoading && <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#E7D7E8] bg-white p-4 text-xs leading-6 text-[#6B5E5A]"><LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-[#8A2E72]" /><p>Anyone can explore opportunities. Sign in to apply; an approved community membership is required to post.</p></div>}
      {loadError ? <div role="alert" className="rounded-2xl border border-[#E7D7E8] bg-white p-10 text-center"><p className="text-sm text-[#6B5E5A]">{loadError}</p><button type="button" onClick={() => void loadJobs()} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6B1E5B]"><RefreshCw className="h-4 w-4" /> Try again</button></div> : loading ? <div role="status" className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-[#E7D7E8] bg-white text-sm text-[#6B5E5A]"><Loader2 className="h-6 w-6 animate-spin text-[#6B1E5B]" /> Loading opportunities...</div> : visibleJobs.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4C8C0] bg-white p-8 text-center"><BriefcaseBusiness className="h-10 w-10 text-[#8A2E72]" /><h3 className="mt-4 text-xl font-bold text-[#2A1636]">{search || category !== 'all' ? 'No matching opportunities' : 'New opportunities are on their way'}</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#6B5E5A]">{search || category !== 'all' ? 'Try another keyword or explore all opportunity types.' : 'Approved posts will appear here. Have a role to fill? Share it with the community.'}</p>{(search || category !== 'all') && <button type="button" onClick={() => { setSearch(''); setCategory('all'); }} className="mt-4 text-sm font-semibold text-[#6B1E5B]">Clear filters</button>}</div> : <><p className="mb-4 text-xs text-[#6B5E5A]">{visibleJobs.length} {visibleJobs.length === 1 ? 'opportunity' : 'opportunities'}</p><div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleJobs.map(job => <JobCard key={job.id} job={job} onApply={job => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (job.ownerId === user?.uid) { toast.error('You cannot apply to your own opportunity.'); return; }
        setFormError(''); setSelectedJob(job);
      }} />)}</div></>}
    </div>
    {showJobForm && <JobForm onClose={() => { if (!submitting) setShowJobForm(false); }} onSubmit={submitJob} submitting={submitting} error={formError} name={user?.displayName || ''} email={user?.email || ''} />}
    {selectedJob && <JobApplicationModal job={selectedJob} onClose={() => { if (!submitting) setSelectedJob(null); }} onSubmit={submitApplication} submitting={submitting} error={formError} name={user?.displayName || ''} email={user?.email || ''} />}
  </div>;
}
