"use client";

import { Search } from "lucide-react";

interface RegisteredUserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "all" | "joined" | "signup_only";
  setStatusFilter: (status: "all" | "joined" | "signup_only") => void;
}

export default function RegisteredUserFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}: RegisteredUserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30"
          placeholder="Search by name, email, member ID..."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === "all"
              ? "bg-[#6B1E5B] text-white shadow-md shadow-[#6B1E5B]/20"
              : "bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("joined")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === "joined"
              ? "bg-green-600 text-white shadow-md shadow-green-600/20"
              : "bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80"
          }`}
        >
          Joined
        </button>
        <button
          onClick={() => setStatusFilter("signup_only")}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer ${
            statusFilter === "signup_only"
              ? "bg-[#D9772B] text-white shadow-md shadow-[#D9772B]/20"
              : "bg-white/50 text-[#6B5E5A] border border-[#D4C8C0]/30 hover:bg-white/80"
          }`}
        >
          Signup Only
        </button>
      </div>
    </div>
  );
}
