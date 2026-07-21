"use client";

import { Search } from "lucide-react";

interface CommunityFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | 'active' | 'pending' | 'inactive';
  setStatusFilter: (status: 'all' | 'active' | 'pending' | 'inactive') => void;
}

export default function CommunityFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: CommunityFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30"
          placeholder="Search by name or city..."
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'inactive'
              ? 'bg-gray-600 text-white shadow-md shadow-gray-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Inactive
        </button>
      </div>
    </div>
  );
}