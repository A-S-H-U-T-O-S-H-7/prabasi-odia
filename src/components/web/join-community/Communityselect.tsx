// components/web/join-community/CommunitySelect.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, HelpCircle, Check, Loader2, X, Search } from "lucide-react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Communities near the user's current city/state float to the top
  const { nearby, others } = useMemo(() => {
    const cityMatch = (c: PublicCommunity) =>
      !!currentCity && !!c.city && c.city.trim().toLowerCase() === currentCity.trim().toLowerCase();
    const stateMatch = (c: PublicCommunity) =>
      !!currentState && !!(c as any).state && (c as any).state.trim().toLowerCase() === currentState.trim().toLowerCase();

    const nearbyList = communities.filter((c) => cityMatch(c) || stateMatch(c));
    const nearbyIds = new Set(nearbyList.map((c) => c.id));
    const otherList = communities.filter((c) => !nearbyIds.has(c.id));

    nearbyList.sort((a, b) => {
      const aCity = cityMatch(a) ? 0 : 1;
      const bCity = cityMatch(b) ? 0 : 1;
      return aCity - bCity;
    });

    return { nearby: nearbyList, others: otherList };
  }, [communities, currentCity, currentState]);

  // Filter communities based on search
  const filteredNearby = useMemo(() => {
    if (!searchTerm) return nearby;
    return nearby.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nearby, searchTerm]);

  const filteredOthers = useMemo(() => {
    if (!searchTerm) return others;
    return others.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [others, searchTerm]);

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
    setIsModalOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => setIsModalOpen(true)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border bg-white/50 transition-all duration-300 outline-none text-left disabled:opacity-60 disabled:cursor-not-allowed ${
          hasError
            ? "border-red-400 focus:border-red-400 ring-2 ring-red-200"
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
        <ChevronDown className="w-4 h-4 text-[#6B5E5A]/60 flex-shrink-0" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && !loading && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setSearchTerm("");
              }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 sm:inset-8 md:inset-[10%] z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#E7D7E8]/50 flex-shrink-0">
                <h3 className="text-lg font-semibold text-[#2A1636]">
                  Select Your Community
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSearchTerm("");
                  }}
                  className="p-2 rounded-full hover:bg-[#6B1E5B]/5 transition-colors"
                >
                  <X className="w-5 h-5 text-[#6B5E5A]" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-[#E7D7E8]/50 flex-shrink-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search communities..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C8C0]/30 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm text-[#2A1636] placeholder:text-[#6B5E5A]/40"
                    autoFocus
                  />
                </div>
              </div>

              {/* Community List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {communities.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-[#6B5E5A]">No communities available yet.</p>
                    <button
                      type="button"
                      onClick={() => handleSelect(CANT_FIND_COMMUNITY)}
                      className="mt-3 text-[#6B1E5B] font-medium hover:underline"
                    >
                      Request a new community →
                    </button>
                  </div>
                )}

                {/* Nearby Communities */}
                {filteredNearby.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#6B1E5B]/70 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6B1E5B]" />
                      Near your location
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredNearby.map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          selected={value === community.id}
                          onSelect={handleSelect}
                          highlight
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Communities */}
                {filteredOthers.length > 0 && (
                  <div>
                    {filteredNearby.length > 0 && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B5E5A]/50 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6B5E5A]/50" />
                        All Communities
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredOthers.map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          selected={value === community.id}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* No results */}
                {searchTerm && filteredNearby.length === 0 && filteredOthers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#6B5E5A]">No communities found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E7D7E8]/50 flex-shrink-0 bg-[#FFF9F2]/50">
                <button
                  type="button"
                  onClick={() => handleSelect(CANT_FIND_COMMUNITY)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isCantFind
                      ? "bg-[#D9772B] text-white"
                      : "border-2 border-dashed border-[#D9772B]/30 text-[#D9772B] hover:bg-[#D9772B]/5"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Can't find your community? Request a new one
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommunityCard({
  community,
  selected,
  onSelect,
  highlight = false,
}: {
  community: PublicCommunity;
  selected: boolean;
  onSelect: (id: string) => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(community.id)}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left w-full ${
        selected
          ? "border-[#6B1E5B] bg-[#6B1E5B]/5 ring-2 ring-[#6B1E5B]/20"
          : highlight
          ? "border-[#6B1E5B]/20 hover:border-[#6B1E5B]/50 hover:bg-[#6B1E5B]/5"
          : "border-[#D4C8C0]/30 hover:border-[#6B1E5B]/30 hover:bg-[#6B1E5B]/5"
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        highlight ? "bg-[#6B1E5B]/15" : "bg-[#6B5E5A]/10"
      }`}>
        <MapPin className={`w-4 h-4 ${highlight ? "text-[#6B1E5B]" : "text-[#6B5E5A]"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2A1636] truncate">{community.name}</p>
        <p className="text-xs text-[#6B5E5A] truncate">
          {community.city}, {community.state}
          {community.memberCount > 0 && (
            <span className="ml-2 text-[#6B5E5A]/60">• {community.memberCount} members</span>
          )}
        </p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-[#6B1E5B] flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
    </button>
  );
}