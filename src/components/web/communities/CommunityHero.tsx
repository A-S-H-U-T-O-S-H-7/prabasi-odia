"use client";

import { motion } from "framer-motion";
import { Building2, Users } from "lucide-react";

interface CommunityHeroProps {
  totalCommunities: number;
  totalMembers: number;
}

export default function CommunityHero({ totalCommunities, totalMembers }: CommunityHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-12"
    >
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2A1636]">
        Find Your <span className="text-[#6B1E5B]">Community</span>
      </h1>
      <p className="text-lg text-[#6B5E5A] mt-4 max-w-2xl mx-auto">
        Connect with Odias in your city and beyond. Join communities that match your interests.
      </p>
      
      <div className="flex items-center justify-center gap-8 mt-6">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#6B1E5B]" />
          <span className="text-sm text-[#6B5E5A]">
            <span className="font-bold text-[#2A1636]">{totalCommunities}</span> Communities
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6B1E5B]" />
          <span className="text-sm text-[#6B5E5A]">
            <span className="font-bold text-[#2A1636]">{totalMembers}</span> Members
          </span>
        </div>
      </div>
    </motion.div>
  );
}