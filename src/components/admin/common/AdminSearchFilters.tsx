"use client";

import { useRef, useState, type ReactNode } from "react";
import { Filter, Loader2, Search } from "lucide-react";

export interface AdminSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearch: () => void | Promise<void>;
  onClear: () => void;
  isSearching?: boolean;
}

interface AdminSearchFiltersProps extends AdminSearchProps {
  placeholder: string;
  children: ReactNode;
}

/** Search actions belong to the input; filter controls stay in their own group. */
export default function AdminSearchFilters({
  searchTerm, setSearchTerm, onSearch, onClear, isSearching = false, placeholder, children,
}: AdminSearchFiltersProps) {
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const disabled = isSearching || submitting;

  return (
    <div className="flex min-w-0 flex-wrap items-start gap-3">
      <form
        role="search"
        aria-label="Search records"
        aria-busy={disabled}
        onSubmit={async (event) => {
          event.preventDefault();
          if (disabled || inFlight.current) return;
          inFlight.current = true;
          setSubmitting(true);
          try { await onSearch(); }
          finally { inFlight.current = false; setSubmitting(false); }
        }}
        className="flex min-w-0 flex-[1_1_25rem] flex-wrap items-center gap-2 rounded-xl border border-[#E7D7E8] bg-white/80 p-2"
      >
        <div className="relative min-w-0 flex-[1_1_12rem]">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A]" />
          <input
            ref={inputRef}
            type="search"
            aria-label={placeholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="h-10 w-full min-w-0 rounded-lg border border-[#D4C8C0]/60 bg-white pl-9 pr-3 text-sm text-[#2A1636] outline-none placeholder:text-[#6B5E5A]/60 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 disabled:opacity-60"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="submit" disabled={disabled} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#6B1E5B] px-3 text-sm font-medium text-white hover:bg-[#531547] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] disabled:cursor-not-allowed disabled:opacity-50">
            {disabled && <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />}
            Search
          </button>
          <button type="button" disabled={disabled} onClick={() => { onClear(); inputRef.current?.focus(); }} className="h-10 rounded-lg border border-[#D4C8C0] bg-white px-3 text-sm font-medium text-[#6B5E5A] hover:bg-[#FFF9F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1E5B] disabled:cursor-not-allowed disabled:opacity-50">
            Clear
          </button>
        </div>
      </form>
      <div role="group" aria-label="Filter" className="flex min-w-0 flex-[1_1_20rem] flex-wrap items-center gap-2 rounded-xl border border-[#E7D7E8] bg-white/80 p-2">
        <span className="inline-flex h-10 shrink-0 items-center gap-1.5 px-1 text-sm font-semibold text-[#6B5E5A]">
          <Filter aria-hidden="true" className="h-3.5 w-3.5" /> Filter
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
