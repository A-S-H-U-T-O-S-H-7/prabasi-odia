"use client";

import AdminSearchFilters, { type AdminSearchProps } from "@/components/admin/common/AdminSearchFilters";

interface RegisteredUserFiltersProps extends AdminSearchProps {
  statusFilter: "all" | "joined" | "signup_only";
  setStatusFilter: (status: "all" | "joined" | "signup_only") => void;
}

export default function RegisteredUserFilters({
  searchTerm,
  setSearchTerm,
  onSearch,
  onClear,
  isSearching,
  statusFilter,
  setStatusFilter,
}: RegisteredUserFiltersProps) {
  return (
    <AdminSearchFilters
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={onSearch}
      onClear={onClear}
      isSearching={isSearching}
      placeholder="Search by name, email, member ID..."
    >

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === "all"
              ? "bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20"
              : "bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("joined")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === "joined"
              ? "bg-green-600 text-white shadow-md shadow-green-600/20"
              : "bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80"
          }`}
        >
          Application submitted
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("signup_only")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === "signup_only"
              ? "bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20"
              : "bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80"
          }`}
        >
          Account only
        </button>
      </div>
    </AdminSearchFilters>
  );
}
