"use client";

import AdminSearchFilters, { type AdminSearchProps } from "@/components/admin/common/AdminSearchFilters";

interface UserFiltersProps extends AdminSearchProps {
  statusFilter: 'all' | 'pending' | 'verified' | 'rejected';
  setStatusFilter: (status: 'all' | 'pending' | 'verified' | 'rejected') => void;
}

export default function UserFilters({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  isSearching,
  statusFilter,
  setStatusFilter,
}: UserFiltersProps) {
  return (
    <AdminSearchFilters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={onSearch}
      onClear={onClear}
      isSearching={isSearching}
      placeholder="Search by name, email, member ID..."
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
          onClick={() => setStatusFilter('pending')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Pending
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('verified')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'verified'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Verified
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Rejected
        </button>
      </div>
    </AdminSearchFilters>
  );
}
