"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { PublicCommunity } from "@/lib/services/publicCommunityService";
import { UserData } from "@/lib/services/adminUserService";

interface CommunityAssignmentProps {
  user: UserData;
  communities: PublicCommunity[];
  loadingCommunities: boolean;
  communityAction: "auto" | "existing" | "create";
  setCommunityAction: (action: "auto" | "existing" | "create") => void;
  selectedCommunityId: string;
  setSelectedCommunityId: (id: string) => void;
  selectedCommunityName: string;
  setSelectedCommunityName: (name: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  handleCommunitySelect: (community: PublicCommunity) => void;
  filteredCommunities: PublicCommunity[];
}

export function CommunityAssignment({
  user,
  communities,
  loadingCommunities,
  communityAction,
  setCommunityAction,
  selectedCommunityId,
  setSelectedCommunityId,
  selectedCommunityName,
  setSelectedCommunityName,
  searchTerm,
  setSearchTerm,
  isSearchOpen,
  setIsSearchOpen,
  handleCommunitySelect,
  filteredCommunities,
}: CommunityAssignmentProps) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-[#2A1636] block mb-2">
        Community Assignment
      </label>
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            checked={communityAction === "auto"}
            onChange={() => {
              setCommunityAction("auto");
              setSearchTerm("");
              setSelectedCommunityName("");
              setSelectedCommunityId("");
            }}
            className="accent-[#6B1E5B]"
          />
          Auto
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            checked={communityAction === "existing"}
            onChange={() => {
              setCommunityAction("existing");
              setIsSearchOpen(true);
            }}
            className="accent-[#6B1E5B]"
          />
          Assign Existing
        </label>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="radio"
            checked={communityAction === "create"}
            onChange={() => {
              setCommunityAction("create");
              setSearchTerm("");
              setSelectedCommunityName("");
              setSelectedCommunityId("");
            }}
            className="accent-[#6B1E5B]"
          />
          Create New
        </label>
      </div>

      {communityAction === "existing" && (
        <div className="relative">
          <div 
            className="w-full px-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm cursor-pointer flex items-center justify-between"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <span className={selectedCommunityName ? "text-[#2A1636]" : "text-[#6B5E5A]/50"}>
              {selectedCommunityName || "Search and select a community..."}
            </span>
            {isSearchOpen ? (
              <ChevronUp className="w-4 h-4 text-[#6B5E5A]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#6B5E5A]" />
            )}
          </div>
          
          {isSearchOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-xl border border-[#D4C8C0]/30 shadow-lg overflow-hidden">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D4C8C0]/30 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {loadingCommunities ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-5 h-5 text-[#6B1E5B] animate-spin" />
                  </div>
                ) : filteredCommunities.length === 0 ? (
                  <p className="text-sm text-[#6B5E5A] p-3 text-center">
                    {searchTerm ? "No communities found" : "No communities available"}
                  </p>
                ) : (
                  filteredCommunities.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleCommunitySelect(c)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-[#6B1E5B]/5 transition-colors ${
                        selectedCommunityId === c.id ? 'bg-[#6B1E5B]/10' : ''
                      }`}
                    >
                      <div className="text-sm font-medium text-[#2A1636]">{c.name}</div>
                      <div className="text-xs text-[#6B5E5A]">
                        {c.city}, {c.state} • {c.memberCount} members
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {communityAction === "create" && (
        <p className="text-sm text-[#D9772B] bg-[#D9772B]/5 p-3 rounded-xl border border-[#D9772B]/20">
          New community will be created: <strong>{user.requestedCommunityName || user.currentCity || "New Community"}</strong>
        </p>
      )}

      {communityAction === "auto" && (
        <p className="text-sm text-[#6B5E5A] bg-[#6B5E5A]/5 p-3 rounded-xl border border-[#D4C8C0]/30">
          {user.requestedCommunityName ? (
            <>Will auto-create: <strong className="text-[#D9772B]">{user.requestedCommunityName}</strong></>
          ) : user.nearbyCommunityName ? (
            <>Will add to: <strong className="text-green-600">{user.nearbyCommunityName}</strong></>
          ) : (
            "No community selected. Will create from city name."
          )}
        </p>
      )}
    </div>
  );
}