"use client";

import { Search } from "lucide-react";

interface CommunityFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: string[];
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export default function CommunityFilters({
  searchTerm,
  setSearchTerm,
  selectedCity,
  setSelectedCity,
  cities,
  selectedRegion,
  setSelectedRegion,
}: CommunityFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 md:gap-4 max-w-4xl mx-auto">
      {/* Search */}
      <div className="flex-1 sm:min-w-[240px] relative">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#6B5E5A]/40" />
        <input
          type="text"
          aria-label="Search communities by name or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 md:pl-11 pr-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30"
          placeholder="Search communities by name or city..."
        />
      </div>

      <select
        aria-label="Filter communities by region"
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        className="px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] cursor-pointer min-w-[160px]"
      >
        <option value="all">All locations</option>
        <option value="india">India</option>
        <option value="international">Outside India</option>
      </select>

      {/* City Filter */}
      <select
        aria-label="Filter communities by city"
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        className="px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 transition-all duration-300 outline-none text-[#2A1636] cursor-pointer min-w-[120px] md:min-w-[140px]"
      >
        <option value="all">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
    </div>
  );
}
