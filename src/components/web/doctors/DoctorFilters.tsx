import { Search } from 'lucide-react';
import { CONSULTATION_MODES, DOCTOR_SPECIALTIES } from '@/lib/doctors/types';

const modeLabel = {
  chat: 'Chat',
  video: 'Video call',
  phone: 'Phone call',
};

interface DoctorFiltersProps {
  search: string;
  specialty: string;
  mode: string;
  onSearch: (value: string) => void;
  onSpecialty: (value: string) => void;
  onMode: (value: string) => void;
}

export default function DoctorFilters({
  search,
  specialty,
  mode,
  onSearch,
  onSpecialty,
  onMode,
}: DoctorFiltersProps) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[#d6e9e5] bg-white p-3 shadow-sm md:grid-cols-[1fr_220px_190px] md:p-4">
      <label className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a9798]"
          size={17}
        />
        <span className="sr-only">Search doctors</span>
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search doctor, specialty or city"
          className="w-full rounded-xl bg-[#f4faf8] py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#167f82]/15"
        />
      </label>
      <select
        aria-label="Filter by specialty"
        value={specialty}
        onChange={(event) => onSpecialty(event.target.value)}
        className="rounded-xl bg-[#f4faf8] px-4 py-3 text-sm outline-none"
      >
        <option>All specialties</option>
        {DOCTOR_SPECIALTIES.map((value) => (
          <option key={value}>{value}</option>
        ))}
      </select>
      <select
        aria-label="Filter by consultation mode"
        value={mode}
        onChange={(event) => onMode(event.target.value)}
        className="rounded-xl bg-[#f4faf8] px-4 py-3 text-sm outline-none"
      >
        <option>All modes</option>
        {CONSULTATION_MODES.map((value) => (
          <option key={value} value={value}>
            {modeLabel[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
