"use client";

import { PublicCommunity } from "@/lib/services/publicCommunityService";
import CommunityCard from "./CommunityCard";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface CommunityGridProps {
  communities: PublicCommunity[];
  loading?: boolean;
  onJoin?: (id: string) => void;
  isMember?: (id: string) => boolean;
  isAuthenticated?: boolean;
  isVerified?: boolean;
}

export default function CommunityGrid({
  communities,
  loading = false,
  onJoin,
  isMember,
  isAuthenticated = false,
  isVerified = false,
}: CommunityGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white/70 rounded-2xl border border-[#E7D7E8]/50 p-6 shadow-sm animate-pulse">
            <div className="w-full h-32 bg-gray-200 rounded-xl mb-4" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded-xl flex-1" />
              <div className="h-10 bg-gray-200 rounded-xl w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Building2 className="w-16 h-16 text-[#6B5E5A]/30 mx-auto" />
        <h3 className="text-xl font-semibold text-[#2A1636] mt-4">No communities found</h3>
        <p className="text-[#6B5E5A] mt-2">Try adjusting your search or filters</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community, index) => (
        <CommunityCard
          key={community.id}
          community={community}
          index={index}
          onJoin={onJoin}
          isMember={isMember?.(community.id)}
          isAuthenticated={isAuthenticated}
          isVerified={isVerified}
        />
      ))}
    </div>
  );
}