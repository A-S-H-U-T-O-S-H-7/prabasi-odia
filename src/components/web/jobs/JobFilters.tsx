"use client";

import { Search, SlidersHorizontal } from 'lucide-react';
import { JOB_CATEGORIES } from '@/lib/services/jobsService';

export default function JobFilters({ search, category, onSearch, onCategory }: { search: string; category: string; onSearch: (value: string) => void; onCategory: (value: string) => void }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]/45" /><input value={search} onChange={event => onSearch(event.target.value)} placeholder="Search roles, companies, or locations" aria-label="Search jobs" className="w-full rounded-2xl border border-[#D4C8C0]/60 bg-white px-11 py-3.5 text-sm text-[#2A1636] outline-none transition focus:border-[#6B1E5B] focus:ring-4 focus:ring-[#6B1E5B]/10" /></label>
      <label className="relative sm:w-64"><SlidersHorizontal className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]/45" /><select value={category} onChange={event => onCategory(event.target.value)} aria-label="Filter by job category" className="w-full appearance-none rounded-2xl border border-[#D4C8C0]/60 bg-white px-11 py-3.5 text-sm text-[#2A1636] outline-none transition focus:border-[#6B1E5B] focus:ring-4 focus:ring-[#6B1E5B]/10"><option value="all">All opportunities</option>{JOB_CATEGORIES.map(item => <option key={item}>{item}</option>)}</select></label>
    </div>
  );
}
