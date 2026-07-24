"use client";

import { Search } from "lucide-react";

interface EventFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  setStatusFilter: (status: 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled') => void;
}

export default function EventFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-3xl mx-auto">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#6B5E5A]/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30"
          placeholder="Search events by title, location, city..."
        />
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('upcoming')}
          className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'upcoming'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          📅 Upcoming
        </button>
        <button
          onClick={() => setStatusFilter('ongoing')}
          className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'ongoing'
              ? 'bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          🔄 Ongoing
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          ✅ Completed
        </button>
      </div>
    </div>
  );
}