"use client";

import { AdvisoryBoardMember } from "@/lib/services/adminAdvisoryBoardService";
import AdvisoryBoardCard from "./AdvisoryBoardCard";

interface AdvisoryBoardGridProps {
  members: AdvisoryBoardMember[];
  loading?: boolean;
}

export default function AdvisoryBoardGrid({
  members,
  loading = false,
}: AdvisoryBoardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/70 rounded-2xl overflow-hidden border border-[#E7D7E8]/50 animate-pulse"
          >
            <div className="aspect-[4/5] bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-12 text-center">
        <p className="text-lg font-serif font-semibold text-[#2A1636]">
          Advisory board coming soon
        </p>
        <p className="text-sm text-[#6B5E5A] mt-2">
          Our advisory members will appear here shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {members.map((member, index) => (
        <AdvisoryBoardCard key={member.id} member={member} index={index} />
      ))}
    </div>
  );
}
