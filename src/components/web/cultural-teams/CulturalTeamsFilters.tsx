'use client';

import { Search } from 'lucide-react';
import { CULTURAL_ART_FORMS, TRAVEL_SCOPES, type TravelScope } from '@/lib/culturalTeams/types';

const scopeLabel: Record<TravelScope, string> = {
  states: 'Selected states',
  national: 'Across India',
  international: 'International',
};

interface CulturalTeamsFiltersProps {
  search: string;
  artForm: string;
  travel: string;
  onSearch: (value: string) => void;
  onArtForm: (value: string) => void;
  onTravel: (value: string) => void;
}

export default function CulturalTeamsFilters({
  search,
  artForm,
  travel,
  onSearch,
  onArtForm,
  onTravel,
}: CulturalTeamsFiltersProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#efdfd8] bg-white p-3 shadow-sm md:grid-cols-[1fr_210px_190px] md:p-4">
      <label className="relative">
        <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ab989b]" />
        <span className="sr-only">Search teams</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search team, art form or location"
          className="w-full rounded-xl bg-[#fbf5f1] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#ad6659]/20"
        />
      </label>
      <label>
        <span className="sr-only">Filter by art form</span>
        <select
          aria-label="Filter by art form"
          value={artForm}
          onChange={(event) => onArtForm(event.target.value)}
          className="w-full cursor-pointer rounded-xl bg-[#fbf5f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ad6659]/20"
        >
          <option>All art forms</option>
          {CULTURAL_ART_FORMS.map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Filter by travel availability</span>
        <select
          aria-label="Filter by travel availability"
          value={travel}
          onChange={(event) => onTravel(event.target.value)}
          className="w-full cursor-pointer rounded-xl bg-[#fbf5f1] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#ad6659]/20"
        >
          <option>Anywhere</option>
          {TRAVEL_SCOPES.map((value) => <option key={value} value={value}>{scopeLabel[value]}</option>)}
        </select>
      </label>
    </div>
  );
}
