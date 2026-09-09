"use client";

import { ArrowUpRight, Building2, Clock3, MapPin } from 'lucide-react';
import type { Job } from '@/lib/services/jobsService';

const formatDate = (value: string) => new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function JobCard({ job, onApply }: { job: Job; onApply: (job: Job) => void }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-[#E7D7E8] bg-white p-5 shadow-sm transition duration-300 hover:shadow-xl hover:shadow-[#6B1E5B]/10 sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4E8F1] text-[#6B1E5B]"><Building2 className="h-5 w-5" /></span><span className="rounded-full bg-[#FFF1DF] px-3 py-1.5 text-[11px] font-semibold text-[#9A5B20]">{job.category}</span></div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#8A2E72]">{job.company}</p>
      <h2 className="break-words text-lg font-bold leading-snug text-[#2A1636]">{job.title}</h2>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#6B5E5A]"><span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</span>{job.compensation && <span>{job.compensation}</span>}</div>
      <p className="mt-5 line-clamp-3 flex-1 text-sm leading-7 text-[#6B5E5A]">{job.description}</p>
      <details className="mt-3 text-xs text-[#6B1E5B]"><summary className="cursor-pointer font-semibold">Read full description</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#6B5E5A]">{job.description}</p></details>
      <div className="mt-6 flex flex-wrap gap-3 items-center justify-between border-t border-[#F0E7EE] pt-4"><span className="inline-flex items-center gap-1.5 text-[11px] text-[#8A7B82]"><Clock3 className="h-3.5 w-3.5" />{formatDate(job.createdAt)}</span><button type="button" onClick={() => onApply(job)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#6B1E5B] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#531547]">I’m interested <ArrowUpRight className="h-4 w-4" /></button></div>
    </article>
  );
}
