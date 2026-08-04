"use client";

interface MapFiltersProps {
  countries: string[];
  states: string[];
  selectedCountry: string;
  selectedState: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
}

export default function MapFilters({
  countries,
  states,
  selectedCountry,
  selectedState,
  onCountryChange,
  onStateChange,
}: MapFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl border border-[#E7D7E8] bg-white/80">
      <div>
        <label className="text-xs text-[#6B5E5A] font-medium">Country</label>
        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-xl border border-[#D4C8C0]/50 text-sm text-[#2A1636] bg-white"
        >
          <option value="all">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-[#6B5E5A] font-medium">State</label>
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-xl border border-[#D4C8C0]/50 text-sm text-[#2A1636] bg-white"
        >
          <option value="all">All States</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
