"use client";

import AdminSearchFilters, { type AdminSearchProps } from "@/components/admin/common/AdminSearchFilters";

interface EventFiltersProps extends AdminSearchProps {
  statusFilter: 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  setStatusFilter: (status: 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled') => void;
}

export default function EventFilters({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  isSearching,
  statusFilter,
  setStatusFilter,
}: EventFiltersProps) {
  return (
    <AdminSearchFilters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={onSearch}
      onClear={onClear}
      isSearching={isSearching}
      placeholder="Search by title, city, location..."
    >

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('upcoming')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'upcoming'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('ongoing')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'ongoing'
              ? 'bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Ongoing
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Completed
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('cancelled')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'cancelled'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Cancelled
        </button>
      </div>
    </AdminSearchFilters>
  );
}
