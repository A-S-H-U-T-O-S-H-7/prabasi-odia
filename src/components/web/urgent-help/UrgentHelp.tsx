'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, HeartHandshake, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { URGENT_HELP_CATEGORIES, urgentHelpService, type UrgentHelpRequest } from '@/lib/services/urgentHelpService';
import UrgentHelpCard from './UrgentHelpCard';
import UrgentHelpDetails from './UrgentHelpDetails';
import UrgentHelpForm from './UrgentHelpForm';
import UrgentHelpHero from './UrgentHelpHero';

export default function UrgentHelp() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [requests, setRequests] = useState<UrgentHelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<UrgentHelpRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await urgentHelpService.getApprovedRequests());
    } catch {
      setError('Unable to load help requests right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter(item =>
      (category === 'all' || item.category === category)
      && (!term || `${item.title} ${item.location} ${item.message}`.toLowerCase().includes(term)),
    );
  }, [requests, search, category]);

  const openForm = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setFormError('');
    setShowForm(true);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.uid || submitting) return;
    const form = new FormData(event.currentTarget);
    const media = form.getAll('media').filter((item): item is File => item instanceof File && item.size > 0);
    setSubmitting(true);
    setFormError('');
    try {
      await urgentHelpService.createRequest({
        title: String(form.get('title') || '').trim(),
        category: String(form.get('category')) as UrgentHelpRequest['category'],
        location: String(form.get('location') || '').trim(),
        message: String(form.get('message') || '').trim(),
        contactName: String(form.get('contactName') || '').trim(),
        email: user.email || '',
        phone: String(form.get('phone') || '').trim(),
        ownerId: user.uid,
        ownerName: user.displayName || user.email || '',
      }, media);
      setShowForm(false);
      toast.success('Your request was submitted for admin review.');
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : 'Could not submit your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] px-4 py-6 sm:px-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        <UrgentHelpHero count={requests.length} />
        <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-bold text-[#2A1636]">Community help requests</h2><p className="mt-2 text-sm text-[#6B5E5A]">See where a helping hand can make a difference.</p></div>
          <button type="button" onClick={openForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B45337] px-5 py-3 text-sm font-semibold text-white hover:bg-[#923A22]"><Plus className="h-4 w-4" /> Request urgent help</button>
        </section>
        <div className="mb-6 rounded-xl border border-[#F0D8D0] bg-[#FFF0EA] p-4 text-xs leading-6 text-[#704235]"><strong>Important:</strong> This page is not monitored around the clock. Call local emergency services first if someone is in immediate danger.</div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by need or location" className="w-full rounded-xl border border-[#E7D7E8] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#B45337]" /></label>
          <label className="relative sm:w-72"><Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]" /><select value={category} onChange={event => setCategory(event.target.value)} className="w-full appearance-none rounded-xl border border-[#E7D7E8] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#B45337]"><option value="all">All help types</option>{URGENT_HELP_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label>
        </div>
        {error ? <div role="alert" className="rounded-2xl border border-[#E7D7E8] bg-white p-10 text-center"><p className="text-sm text-red-600">{error}</p><button onClick={() => void load()} className="mt-4 text-sm font-semibold text-[#B45337]">Try again</button></div>
          : loading ? <div role="status" className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-[#E7D7E8] bg-white text-sm text-[#6B5E5A]"><Loader2 className="h-6 w-6 animate-spin text-[#B45337]" />Loading requests...</div>
            : visible.length === 0 ? <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4C8C0] bg-white p-8 text-center"><HeartHandshake className="h-10 w-10 text-[#B45337]" /><h3 className="mt-4 text-xl font-bold text-[#2A1636]">{search || category !== 'all' ? 'No matching requests' : 'No open requests right now'}</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#6B5E5A]">{search || category !== 'all' ? 'Try another keyword or help type.' : 'Approved community help requests will appear here.'}</p></div>
              : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <UrgentHelpCard key={item.id} request={item} onView={setSelected} />)}</div>}
      </div>
      {showForm && <UrgentHelpForm onClose={() => !submitting && setShowForm(false)} onSubmit={submit} submitting={submitting} error={formError} name={user?.displayName || ''} email={user?.email || ''} />}
      {selected && <UrgentHelpDetails request={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
