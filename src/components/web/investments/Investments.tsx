'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, HandCoins, LockKeyhole, Plus, Search, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore, useUserStore } from '@/lib/store';
import { canUseMemberServices } from '@/lib/residency';
import { investmentsService } from '@/lib/services/investmentsService';
import { INVESTMENT_SECTORS, type Investment } from '@/lib/investments/types';
import InvestmentModal from './InvestmentModal';
import InvestmentHero from './InvestmentHero';
import InvestmentCard from './InvestmentCard';

export default function Investments() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { profile } = useUserStore();
  const currentProfile = profile?.uid === user?.uid ? profile : null;
  const verified = Boolean(
    (currentProfile?.hasJoinedCommunity ?? user?.hasJoinedCommunity) &&
    (currentProfile?.isVerified ?? user?.isVerified) &&
    canUseMemberServices(currentProfile?.residencyStatus ?? user?.residencyStatus)
  );
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All sectors');
  const [tab, setTab] = useState<'explore' | 'mine'>('explore');
  const [mode, setMode] = useState<'post' | 'edit' | 'interest' | null>(null);
  const [selected, setSelected] = useState<Investment | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [responded, setResponded] = useState<string[]>([]);
  const [checkingInterestId, setCheckingInterestId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const posts = await investmentsService.getVisible();
      const interestIds = await investmentsService.getMyInterestIds(
        posts
          .filter((item) => item.status === 'approved' && item.ownerId !== user?.uid)
          .map((item) => item.id)
      );
      setItems(posts);
      setResponded(interestIds);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load investment posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && verified) void load();
  }, [isAuthenticated, verified, user?.uid]);

  const published = items.filter((item) => item.status === 'approved');
  const mine = items.filter((item) => item.ownerId === user?.uid);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        (tab === 'mine' ? item.ownerId === user?.uid : item.status === 'approved') &&
        (sector === 'All sectors' || item.sector === sector) &&
        (!term ||
          `${item.name} ${item.sector} ${item.place} ${item.preferredLocation} ${item.details}`
            .toLowerCase()
            .includes(term))
    );
  }, [items, tab, user?.uid, sector, search]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const form = new FormData(event.currentTarget);
    setBusy(true);
    setFormError('');
    try {
      const draft = {
        name: String(form.get('name') || '').trim(),
        amount: Number(form.get('amount')),
        currency: String(form.get('currency')),
        sector: String(form.get('sector')),
        place: String(form.get('place') || '').trim(),
        preferredLocation: String(form.get('preferredLocation') || '').trim(),
        details: String(form.get('details') || '').trim(),
      };

      if (mode === 'post') {
        await investmentsService.create(draft);
        setTab('mine');
        toast.success('Investment submitted for admin review.');
        await load();
      } else if (mode === 'edit' && selected) {
        await investmentsService.updatePending(selected.id, draft);
        setItems((current) =>
          current.map((item) =>
            item.id === selected.id
              ? {
                  ...item,
                  ...draft,
                  currency: draft.currency === 'USD' ? 'USD' : 'INR',
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
        );
        toast.success('Your pending investment post was updated.');
      } else if (mode === 'interest' && selected) {
        await investmentsService.expressInterest(selected.id, {
          name: String(form.get('name') || '').trim(),
          email: String(form.get('email') || '').trim(),
          phone: String(form.get('phone') || '').trim(),
          location: String(form.get('location') || '').trim(),
          message: String(form.get('message') || '').trim(),
        });
        setResponded((ids) => [...new Set([...ids, selected.id])]);
        toast.success('Your interest was saved privately for the admin team.');
      }

      setMode(null);
      setSelected(null);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not submit the form.';
      if (
        mode === 'interest' &&
        selected &&
        message === 'You have already expressed interest in this post.'
      ) {
        setResponded((ids) => [...new Set([...ids, selected.id])]);
        setMode(null);
        setSelected(null);
        toast('You are already interested in this post.');
      } else {
        setFormError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const openPost = () => {
    setFormError('');
    setSelected(null);
    setMode('post');
  };

  const openEdit = (item: Investment) => {
    if (item.ownerId !== user?.uid || item.status !== 'pending') return;
    setFormError('');
    setSelected(item);
    setMode('edit');
  };

  const openInterest = async (item: Investment) => {
    if (
      checkingInterestId ||
      responded.includes(item.id) ||
      item.ownerId === user?.uid ||
      item.status !== 'approved'
    ) {
      return;
    }
    setCheckingInterestId(item.id);
    try {
      if ((await investmentsService.getMyInterestIds([item.id])).length) {
        setResponded((ids) => [...new Set([...ids, item.id])]);
        toast('You are already interested in this post.');
        return;
      }
      setFormError('');
      setSelected(item);
      setMode('interest');
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Could not check your response.');
    } finally {
      setCheckingInterestId(null);
    }
  };

  const name = currentProfile?.displayName || user?.displayName || '';
  const email = currentProfile?.email || user?.email || '';
  const location = currentProfile?.currentCity || '';

  return (
    <div className="min-h-screen bg-[#FFF9F2] px-2 py-3 text-[#2A1636] sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#6B5E5A] transition-colors hover:text-[#6B1E5B]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <InvestmentHero
          posts={published.length}
          sectors={new Set(published.map((item) => item.sector)).size}
          loading={!verified || loading || !!error}
        />

        <div id="investment-list">
          {!isAuthenticated && !authLoading ? (
            <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e8dedb] bg-white p-8 text-center shadow-sm sm:p-12">
              <LockKeyhole className="mx-auto text-[#6b1e5b]" size={34} />
              <h2 className="mt-5 font-serif text-2xl font-bold">
                A space for verified members
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#756b72]">
                Sign in with your community account to explore investment posts and connect
                with members.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6b1e5b] px-6 py-3 text-sm font-semibold text-white"
              >
                Sign in
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : !verified && !authLoading ? (
            <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e8dedb] bg-white p-8 text-center shadow-sm sm:p-12">
              <ShieldCheck className="mx-auto text-[#6b1e5b]" size={36} />
              <h2 className="mt-5 font-serif text-2xl font-bold">
                Membership verification required
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#756b72]">
                Investment posts are available after your community membership is approved.
              </p>
              <Link
                href={user?.hasJoinedCommunity ? '/profile' : '/join-community'}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6b1e5b] px-6 py-3 text-sm font-semibold text-white"
              >
                {user?.hasJoinedCommunity ? 'View my profile' : 'Join the community'}
                <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-bold text-[#2A1636]">Explore investments</h2>
                  <p className="mt-2 text-sm text-[#6B5E5A]">
                    Find investment plans shared by verified community members.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPost}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B1E5B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#531547]"
                >
                  <Plus className="h-4 w-4" />
                  Post investment intent
                </button>
              </section>

              <div className="mb-6 inline-flex rounded-2xl border border-[#E7D7E8] bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setTab('explore')}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    tab === 'explore'
                      ? 'bg-[#6B1E5B] text-white'
                      : 'text-[#6B5E5A] hover:bg-[#F7EFF5]'
                  }`}
                >
                  Explore
                </button>
                <button
                  type="button"
                  onClick={() => setTab('mine')}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    tab === 'mine'
                      ? 'bg-[#6B1E5B] text-white'
                      : 'text-[#6B5E5A] hover:bg-[#F7EFF5]'
                  }`}
                >
                  My posts{mine.length ? ` (${mine.length})` : ''}
                </button>
              </div>

              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#E7D7E8] bg-white p-3 shadow-sm sm:flex-row sm:p-4">
                <label className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49aa2]" />
                  <span className="sr-only">Search investments</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search sector, place or details"
                    className="w-full rounded-xl bg-[#FFF9F2] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#6b1e5b]/20"
                  />
                </label>
                <label className="sm:w-56">
                  <span className="sr-only">Filter by sector</span>
                  <select
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                    className="w-full rounded-xl bg-[#FFF9F2] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#6b1e5b]/20"
                  >
                    <option>All sectors</option>
                    {INVESTMENT_SECTORS.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>

              {error ? (
                <div role="alert" className="rounded-2xl border border-[#E7D7E8] bg-white p-10 text-center">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-4 text-sm font-semibold text-[#6B1E5B]"
                  >
                    Try again
                  </button>
                </div>
              ) : loading || authLoading ? (
                <div role="status" className="flex min-h-56 items-center justify-center rounded-2xl border border-[#E7D7E8] bg-white text-sm text-[#6B5E5A]">
                  Loading investment posts...
                </div>
              ) : visible.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4C8C0] bg-white p-8 text-center">
                  <HandCoins className="h-10 w-10 text-[#244B78]" />
                  <h3 className="mt-4 text-xl font-bold text-[#2A1636]">
                    {tab === 'mine' ? 'No posts yet' : 'No matching investments yet'}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#6B5E5A]">
                    {tab === 'mine'
                      ? 'Share your investment plans with the community.'
                      : 'Try a different search or check back for newly approved posts.'}
                  </p>
                  {tab === 'mine' && (
                    <button
                      type="button"
                      onClick={openPost}
                      className="mt-4 text-sm font-semibold text-[#6B1E5B]"
                    >
                      Create a post
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="mb-4 text-xs text-[#6B5E5A]">
                    {visible.length} {visible.length === 1 ? 'investment' : 'investments'}
                  </p>
                  <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visible.map((item) => (
                      <InvestmentCard
                        key={item.id}
                        item={item}
                        own={item.ownerId === user?.uid}
                        interested={responded.includes(item.id)}
                        checkingInterest={checkingInterestId === item.id}
                        onInterest={openInterest}
                        onEdit={openEdit}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {mode && (
        <InvestmentModal
          key={`${mode}-${selected?.id || 'new'}`}
          mode={mode}
          post={selected || undefined}
          name={name}
          email={email}
          location={location}
          busy={busy}
          error={formError}
          onClose={() => {
            if (!busy) {
              setMode(null);
              setSelected(null);
            }
          }}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
