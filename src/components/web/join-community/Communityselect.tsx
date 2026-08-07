// components/web/join-community/CommunitySelect.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, HelpCircle, Check, Loader2 } from "lucide-react";
import { PublicCommunity } from "@/lib/services/publicCommunityService";

export const CANT_FIND_COMMUNITY = "__cant_find__";

interface CommunitySelectProps {
  communities: PublicCommunity[];
  value: string;
  onChange: (id: string) => void;
  loading?: boolean;
  currentCity?: string;
  currentState?: string;
  hasError?: boolean;
}

export default function CommunitySelect({
  communities,
  value,
  onChange,
  loading = false,
  currentCity,
  currentState,
  hasError = false,
}: CommunitySelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Communities near the user's current city/state float to the top
  const { nearby, others } = useMemo(() => {
    const cityMatch = (c: PublicCommunity) =>
      !!currentCity && !!c.city && c.city.trim().toLowerCase() === currentCity.trim().toLowerCase();
    const stateMatch = (c: PublicCommunity) =>
      !!currentState && !!(c as any).state && (c as any).state.trim().toLowerCase() === currentState.trim().toLowerCase();

    const nearbyList = communities.filter((c) => cityMatch(c) || stateMatch(c));
    const nearbyIds = new Set(nearbyList.map((c) => c.id));
    const otherList = communities.filter((c) => !nearbyIds.has(c.id));

    // Exact city matches first, then state-only matches
    nearbyList.sort((a, b) => {
      const aCity = cityMatch(a) ? 0 : 1;
      const bCity = cityMatch(b) ? 0 : 1;
      return aCity - bCity;
    });

    return { nearby: nearbyList, others: otherList };
  }, [communities, currentCity, currentState]);

  const selectedCommunity = communities.find((c) => c.id === value);
  const isCantFind = value === CANT_FIND_COMMUNITY;

  const label = isCantFind
    ? "Can't find nearby community"
    : selectedCommunity
    ? `${selectedCommunity.name}${selectedCommunity.city ? ` — ${selectedCommunity.city}` : ""}`
    : loading
    ? "Loading communities..."
    : "Select your nearby community";

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border bg-white/50 transition-all duration-300 outline-none text-left disabled:opacity-60 disabled:cursor-not-allowed ${
          hasError
            ? "border-red-400 focus:border-red-400 ring-2 ring-red-200"
            : open
            ? "border-[#6B1E5B] ring-2 ring-[#6B1E5B]/20"
            : "border-[#D4C8C0]/50 hover:border-[#6B1E5B]/40"
        }`}
      >
        <span className={`truncate text-sm ${isCantFind ? "text-[#D9772B] font-medium" : value ? "text-[#2A1636]" : "text-[#6B5E5A]/50"}`}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> {label}
            </span>
          ) : (
            label
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-[#6B5E5A]/60 flex-shrink-0" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute z-30 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-[#D4C8C0]/40 bg-white shadow-xl shadow-[#6B1E5B]/10 p-1.5"
          >
            {communities.length === 0 && (
              <div className="px-3 py-3 text-sm text-[#6B5E5A]">No communities available yet.</div>
            )}

            {nearby.length > 0 && (
              <div className="mb-1">
                <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B1E5B]/70">
                  Near your location
                </p>
                {nearby.map((c, i) => (
                  <CommunityOption key={c.id} community={c} index={i} selected={value === c.id} onSelect={handleSelect} highlight />
                ))}
              </div>
            )}

            {others.length > 0 && (
              <div className="mb-1">
                {nearby.length > 0 && (
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B5E5A]/50">
                    Other communities
                  </p>
                )}
                {others.map((c, i) => (
                  <CommunityOption key={c.id} community={c} index={i} selected={value === c.id} onSelect={handleSelect} />
                ))}
              </div>
            )}

            {/* Visually distinct "can't find" option */}
            <div className="mt-1 pt-1 border-t border-dashed border-[#D9772B]/30">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                onClick={() => handleSelect(CANT_FIND_COMMUNITY)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isCantFind ? "bg-[#D9772B]/10 text-[#D9772B]" : "text-[#D9772B]/90 hover:bg-[#D9772B]/5"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[#D9772B]/15 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-3.5 h-3.5 text-[#D9772B]" />
                </span>
                Can&apos;t find nearby community
                {isCantFind && <Check className="w-4 h-4 ml-auto" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommunityOption({
  community,
  index,
  selected,
  onSelect,
  highlight = false,
}: {
  community: PublicCommunity;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  highlight?: boolean;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.2) }}
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(community.id)}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
        selected ? "bg-[#6B1E5B]/10 text-[#6B1E5B] font-medium" : "text-[#2A1636] hover:bg-[#6B1E5B]/5"
      }`}
    >
      <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? "bg-[#6B1E5B]/15" : "bg-[#6B5E5A]/10"}`}>
        <MapPin className={`w-3.5 h-3.5 ${highlight ? "text-[#6B1E5B]" : "text-[#6B5E5A]"}`} />
      </span>
      <span className="truncate">
        {community.name}
        {community.city && <span className="text-[#6B5E5A]"> — {community.city}</span>}
      </span>
      {selected && <Check className="w-4 h-4 ml-auto flex-shrink-0" />}
    </motion.button>
  );
}