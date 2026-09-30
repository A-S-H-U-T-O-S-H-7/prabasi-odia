'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, HeartPulse, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { doctorsService } from '@/lib/services/doctorsService';
import type { ConsultationRequest } from '@/lib/doctors/types';
import ConsultationCard from './ConsultationCard';

export default function MyConsultations() {
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await doctorsService.getMyRequests());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load consultations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen bg-[#f5faf8] px-2 py-3 text-[#153b45] sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <Link
          href="/doctors"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#657c80] transition-colors hover:text-[#167f82]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to doctors
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#16868a]">
              Private to your account
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
              My consultations
            </h1>
            <p className="mt-3 text-sm text-[#657c80]">
              Track requests and find connection details after our team schedules them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={!isAuthenticated || loading}
            className="rounded-xl border border-[#cbdedc] bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {!authLoading && !isAuthenticated ? (
          <div className="mt-8 rounded-2xl border border-[#d6e9e5] bg-white p-8 text-center">
            <HeartPulse className="mx-auto text-[#16868a]" />
            <h2 className="mt-4 font-semibold">Sign in to see your consultations</h2>
            <Link
              href="/login"
              className="mt-5 inline-flex rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          </div>
        ) : error ? (
          <div role="alert" className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-red-700">
            {error}
            <button
              type="button"
              onClick={() => void load()}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        ) : loading || authLoading ? (
          <div role="status" className="mt-8 rounded-2xl bg-white p-12 text-center text-sm text-[#657c80]">
            Loading consultations...
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-[#cbdedc] bg-white p-12 text-center">
            <MessageCircle className="mx-auto text-[#16868a]" />
            <h2 className="mt-4 font-semibold">No consultation requests yet</h2>
            <p className="mt-2 text-sm text-[#657c80]">
              Find a doctor to start a conversation with our scheduling team.
            </p>
            <Link
              href="/doctors"
              className="mt-5 inline-flex rounded-xl bg-[#167f82] px-5 py-3 text-sm font-semibold text-white"
            >
              Explore doctors
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {requests.map((request) => (
              <ConsultationCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
