"use client";

import { useEffect, useState } from 'react';
import { Download, CheckCircle, ArrowLeftRight, Loader2, RefreshCw } from 'lucide-react';
import { auth, authReady } from '@/lib/firebase/config';
import { toast } from 'react-hot-toast';

interface MemberCardBundle {
  front: string;
  back: string;
  pdf: string;
  fileName: string;
  details: { name: string; memberId: string; memberSince: string; bloodGroup: string; location: string; communityName?: string; residencyStatus?: string };
}
interface ProfileMemberCardProps { profile: { uid?: string; memberId?: string; isVerified?: boolean; updatedAt?: unknown } }

export default function ProfileMemberCard({ profile }: ProfileMemberCardProps) {
  const [bundle, setBundle] = useState<MemberCardBundle | null>(null);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const canDownload = profile.isVerified === true && Boolean(profile.memberId && profile.memberId !== 'Pending');
  const updatedAt = String(profile.updatedAt || '');

  useEffect(() => {
    if (!canDownload) { setBundle(null); setError(''); setLoading(false); return; }
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError('');
    setBundle(null);
    setSide('front');
    void (async () => {
      try {
        await authReady;
        if (!auth.currentUser) throw new Error('Please sign in again to load your member card.');
        const token = await auth.currentUser.getIdToken();
        const response = await fetch('/api/member-card', {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load your member card.');
        if (!data.front || !data.back || !data.pdf) throw new Error('Your card could not be prepared. Please try again.');
        if (!cancelled) setBundle(data);
      } catch (error) {
        if (!cancelled) setError(error instanceof Error ? error.message : 'Could not load your member card.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [profile.uid, profile.memberId, updatedAt, canDownload, retry]);

  const download = () => {
    if (!bundle || !canDownload) return;
    try {
      const bytes = Uint8Array.from(atob(bundle.pdf), char => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = bundle.fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Your member card has been downloaded.');
    } catch {
      toast.error('Could not download your card. Please try again.');
    }
  };
  const flip = () => setSide(value => value === 'front' ? 'back' : 'front');

  return (
    <section className="w-full min-w-0 rounded-2xl border border-[#E8DACA] bg-[#FFFCF7] p-3 shadow-sm sm:rounded-3xl sm:p-6" aria-label="Your member card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#96704B]">A shared heritage</p>
          <h3 className="mt-1 font-serif text-lg font-bold text-[#582636] sm:text-xl">Your member card</h3>
        </div>
        {canDownload && <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE0D5] bg-[#EAF2ED] px-2.5 py-1 text-xs font-medium text-[#346353]"><CheckCircle className="h-3.5 w-3.5" />Verified</span>}
      </div>

      {loading ? (
        <div role="status" className="flex aspect-[1000/540] flex-col items-center justify-center gap-3 rounded-2xl border border-[#E8DACA] bg-[#F7EFE3] text-sm text-[#826F6D]">
          <Loader2 className="h-6 w-6 animate-spin text-[#582636]" />Preparing your member card...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-[#E8DACA] bg-white p-5 text-sm text-[#582636]">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#D4B896] px-3 py-2 font-medium"><RefreshCw className="h-4 w-4" />Try again</button>
        </div>
      ) : bundle ? (
        <>
          <button type="button" onClick={flip} aria-label={side === 'front' ? 'Show back of member card' : 'Show front of member card'} className="block w-full rounded-2xl text-left outline-none [perspective:1400px] focus-visible:ring-2 focus-visible:ring-[#582636] focus-visible:ring-offset-4">
            <span className="relative block aspect-[1000/540] w-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] motion-reduce:transition-none" style={{ transform: side === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              <img src={bundle.front} alt={`Front of ${bundle.details.name}'s Prabasi Odia member card`} aria-hidden={side !== 'front'} width={1000} height={540} draggable={false} className="absolute inset-0 block h-full w-full rounded-2xl shadow-lg [backface-visibility:hidden] [-webkit-backface-visibility:hidden]" />
              <img src={bundle.back} alt={`Back of ${bundle.details.name}'s Prabasi Odia member card`} aria-hidden={side !== 'back'} width={1000} height={540} draggable={false} className="absolute inset-0 block h-full w-full rounded-2xl shadow-lg [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]" />
            </span>
          </button>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[#826F6D]">
            <button type="button" onClick={flip} className="inline-flex items-center gap-1.5 rounded-lg px-1 py-2 hover:text-[#582636]"><ArrowLeftRight className="h-3.5 w-3.5" />{side === 'front' ? 'View reverse' : 'View front'}</button>
            <span aria-live="polite">{side === 'front' ? 'Front' : 'Reverse'} · {side === 'front' ? '1' : '2'} / 2</span>
          </div>
          <dl className="mt-2 grid gap-2 border-t border-[#E8DACA] pt-3 text-sm sm:sr-only">
            <div><dt className="text-[10px] uppercase tracking-wider text-[#826F6D]">Member</dt><dd className="break-words font-medium text-[#452330]">{bundle.details.name}</dd></div>
            <div><dt className="text-[10px] uppercase tracking-wider text-[#826F6D]">Member ID</dt><dd className="break-all font-mono text-[#452330]">{bundle.details.memberId}</dd></div>
            <div className="sr-only"><dt>Location</dt><dd>{bundle.details.location}</dd><dt>Member since</dt><dd>{bundle.details.memberSince}</dd><dt>Blood group</dt><dd>{bundle.details.bloodGroup}</dd></div>
          </dl>
        </>
      ) : <p className="rounded-xl bg-[#F7EFE3] p-4 text-sm text-[#826F6D]">Your member card will be available after your application is approved.</p>}

      <button type="button" onClick={download} disabled={!bundle || !canDownload || loading} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#582636] px-4 py-3 text-sm font-medium text-[#FFF9EF] transition-colors hover:bg-[#703347] disabled:cursor-not-allowed disabled:opacity-50">
        <Download className="h-4 w-4" />Download member card
      </button>
      <p className="mt-2 text-center text-[11px] text-[#826F6D]">Front and reverse included in your PDF.</p>

    </section>
  );
}
