"use client";

import { motion } from "framer-motion";
import { Users, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { PublicCommunity } from "@/lib/services/publicCommunityService";

interface CommunityCardProps {
  community: PublicCommunity;
  index: number;
  onJoin?: (id: string) => void;
  isMember?: boolean;
  isAuthenticated?: boolean;
  isVerified?: boolean;
}

export default function CommunityCard({
  community,
  index,
  onJoin,
  isMember = false,
  isAuthenticated = false,
  isVerified = false,
}: CommunityCardProps) {
  // Elegant gradient backgrounds
  const gradients = [
    "from-[#6B1E5B]/5 to-[#8A2E72]/5",
    "from-[#D9772B]/5 to-[#E6A11C]/5",
    "from-[#059669]/5 to-[#0EA5E9]/5",
    "from-[#7C3AED]/5 to-[#EC4899]/5",
    "from-[#14B8A6]/5 to-[#F59E0B]/5",
    "from-[#8A2E72]/5 to-[#D9772B]/5",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group"
    >
      {/* Elegant Gradient Border on Hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6B1E5B]/20 via-[#D9772B]/10 to-[#E6A11C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      {/* Decorative Top-Right Pattern */}
      <div className="absolute -top-12 -right-12 w-32 h-32 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700">
        <svg viewBox="0 0 100 100" fill="none">
          <path d="M50 0 L50 100 M0 50 L100 50" stroke="#6B1E5B" strokeWidth="1" />
          <circle cx="50" cy="50" r="30" stroke="#6B1E5B" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="45" stroke="#D9772B" strokeWidth="0.3" />
        </svg>
      </div>

      {/* Decorative Bottom-Left Dots */}
      <div className="absolute -bottom-8 -left-8 w-20 h-20 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700">
        <svg viewBox="0 0 60 60" fill="none">
          <circle cx="10" cy="10" r="2" fill="#6B1E5B" />
          <circle cx="25" cy="10" r="1.5" fill="#D9772B" />
          <circle cx="40" cy="10" r="2" fill="#6B1E5B" />
          <circle cx="10" cy="25" r="1.5" fill="#E6A11C" />
          <circle cx="25" cy="25" r="2" fill="#6B1E5B" />
          <circle cx="40" cy="25" r="1.5" fill="#D9772B" />
          <circle cx="10" cy="40" r="2" fill="#6B1E5B" />
          <circle cx="25" cy="40" r="1.5" fill="#E6A11C" />
        </svg>
      </div>

      {/* Cover Image */}
      <div className="relative w-full h-28 md:h-38 rounded-xl overflow-hidden mb-3 md:mb-4">
        {community.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6B1E5B]/10 to-[#D9772B]/10 flex items-center justify-center">
            <span className="text-3xl md:text-4xl">🏘️</span>
          </div>
        )}
        {/* Member Badge */}
        <div className="absolute top-2 right-2 bg-[#6B1E5B]/80 backdrop-blur-sm text-white text-[8px] md:text-[10px] px-2.5 py-1 rounded-full shadow-lg">
          {community.memberCount} members
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-sm md:text-lg font-bold text-[#2A1636] group-hover:text-[#6B1E5B] transition-colors duration-300 truncate">
          {community.name}
        </h3>
        <p className="text-xs md:text-sm text-[#6B5E5A] flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />
          {community.city}, {community.state}
        </p>

        <p className="text-xs md:text-sm text-[#6B5E5A] mt-1.5 md:mt-2 line-clamp-2">
          {community.description || "A vibrant community of Odias in this city."}
        </p>
      </div>

      {/* Action Button */}
      <div className="mt-3 md:mt-4 cursor-pointer pt-3 md:pt-4 border-t border-[#E7D7E8]/30 relative z-10">
        {isAuthenticated && isVerified ? (
          isMember ? (
            <button
              disabled
              className="w-full px-4 py-2 md:py-2.5 rounded-xl bg-green-50 text-green-700 text-xs md:text-sm font-medium cursor-default flex items-center justify-center gap-1.5 border border-green-200"
            >
              <Sparkles className="w-3.5 h-3.5" /> Member
            </button>
          ) : (
            <button
              onClick={() => onJoin?.(community.id)}
              className="w-full cursor-pointer px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white text-xs md:text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Join Community
            </button>
          )
        ) : (
          <Link
            href={isAuthenticated ? "/profile" : "/login"}
            className="w-full cursor-pointer px-4 py-2 md:py-2.5 rounded-xl bg-[#D4C8C0] text-white text-xs md:text-sm font-medium text-center block hover:bg-[#C4B8B0] transition-colors"
          >
            {isAuthenticated ? "Verify to Join" : "Login to Join"}
          </Link>
        )}
      </div>
    </motion.div>
  );
}