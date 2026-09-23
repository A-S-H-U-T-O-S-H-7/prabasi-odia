"use client";

import AdminSearchFilters, { type AdminSearchProps } from "@/components/admin/common/AdminSearchFilters";

interface NoticeFiltersProps extends AdminSearchProps {
  statusFilter: 'all' | 'published' | 'unpublished';
  setStatusFilter: (status: 'all' | 'published' | 'unpublished') => void;
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  setPriorityFilter: (priority: 'all' | 'high' | 'medium' | 'low') => void;
}

export default function NoticeFilters({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  isSearching,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
}: NoticeFiltersProps) {
  return (
    <AdminSearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm}
      onSearch={onSearch} onClear={onClear} isSearching={isSearching}
      placeholder="Search by title, content...">


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
          onClick={() => setStatusFilter('published')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'published'
              ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Published
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('unpublished')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === 'unpublished'
              ? 'bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          Unpublished
        </button>
      </div>

      {/* Priority Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPriorityFilter('all')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            priorityFilter === 'all'
              ? 'bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          All Priority
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('high')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            priorityFilter === 'high'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          🔴 High
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('medium')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            priorityFilter === 'medium'
              ? 'bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          🟠 Medium
        </button>
        <button
          type="button"
          onClick={() => setPriorityFilter('low')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            priorityFilter === 'low'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80'
          }`}
        >
          🔵 Low
        </button>
      </div>
    </AdminSearchFilters>
  );
}
