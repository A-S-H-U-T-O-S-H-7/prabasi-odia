'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { magazineService, type MagazineIssue } from '@/lib/services/magazineService';
import MagazineHero from './MagazineHero';

function displayMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export default function Magazine() {
  const router = useRouter();
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      setIssues(await magazineService.getIssues());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF9F2] px-2 py-3 sm:px-4 md:py-8">
      <div className="mx-1 max-w-8xl md:mx-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#6B5E5A] transition-colors hover:text-[#7C3A21]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <MagazineHero issueCount={issues.length} loading={loading || error} />

        <section aria-labelledby="magazine-heading">
          <div className="mb-6">
            <h2 id="magazine-heading" className="text-2xl font-bold text-[#2A1636]">
              {issues.length ? 'Latest editions' : 'Our magazine'}
            </h2>
            <p className="mt-2 text-sm text-[#6B5E5A]">
              {issues.length
                ? 'Choose an issue to turn its pages in a new tab.'
                : 'A space for stories from across the Prabasi Odia community.'}
            </p>
          </div>

          {loading ? (
            <div role="status" className="flex min-h-56 items-center justify-center gap-3 rounded-2xl border border-[#E7D7E8] bg-white text-sm text-[#6B5E5A]">
              <Loader2 className="h-6 w-6 animate-spin text-[#7C3A21]" /> Loading magazines...
            </div>
          ) : error ? (
            <div role="alert" className="rounded-2xl border border-[#E7D7E8] bg-white p-10 text-center">
              <p className="text-sm text-red-600">Magazines could not be loaded.</p>
              <button type="button" onClick={() => void load()} className="mt-4 text-sm font-semibold text-[#7C3A21]">
                Try again
              </button>
            </div>
          ) : issues.length ? (
            <div className="grid grid-cols-2 items-start gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {issues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/magazine/${issue.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block min-w-0 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7C3A21]"
                  aria-label={`Open ${issue.title} in a new tab`}
                >
                  <img
                    src={issue.coverUrl}
                    alt={`${issue.title} cover`}
                    loading="lazy"
                    className="aspect-[3/4] w-full bg-white object-contain shadow-md transition-shadow group-hover:shadow-xl"
                  />
                  <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-[#2A1636] group-hover:text-[#7C3A21] sm:text-lg">
                    {issue.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6B5E5A]">{displayMonth(issue.issueMonth)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#E7D7E8] bg-white p-8 text-center shadow-sm sm:p-12">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF0DF] text-[#7C3A21]">
                <BookOpen className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-[#2A1636]">The first issue is on its way</h3>
              <p className="mt-2 max-w-lg text-sm leading-7 text-[#6B5E5A]">
                Check back for the magazine. Until then, explore photos, videos, and links shared by the community.
              </p>
              <Link href="/media" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7C3A21] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#612C18]">
                Explore media <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
