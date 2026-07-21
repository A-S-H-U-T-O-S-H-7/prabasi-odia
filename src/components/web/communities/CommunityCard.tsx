"use client";

import { motion } from "framer-motion";
import { Users, MapPin } from "lucide-react";
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
  // Gradient colors based on index
  const gradients = [
    "from-[#6B1E5B]/10 via-[#8A2E72]/5 to-[#D9772B]/10",
    "from-[#D9772B]/10 via-[#E6A11C]/5 to-[#6B1E5B]/10",
    "from-[#059669]/10 via-[#0EA5E9]/5 to-[#6B1E5B]/10",
    "from-[#7C3AED]/10 via-[#EC4899]/5 to-[#D9772B]/10",
    "from-[#14B8A6]/10 via-[#F59E0B]/5 to-[#6B1E5B]/10",
    "from-[#8A2E72]/10 via-[#6B1E5B]/5 to-[#E6A11C]/10",
  ];

  const gradient = gradients[index % gradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className={`bg-gradient-to-br ${gradient} rounded-2xl border border-[#E7D7E8]/50 p-6 shadow-sm hover:shadow-lg transition-all duration-300 backdrop-blur-sm`}
    >
      {/* Cover Image */}
      <div className="w-full h-32 rounded-xl bg-gradient-to-r from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center mb-4 overflow-hidden">
        {community.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">🏘️</span>
        )}
      </div>

      {/* Name & City */}
      <h3 className="text-lg font-bold text-[#2A1636] truncate">{community.name}</h3>
      <p className="text-sm text-[#6B5E5A] flex items-center gap-1 mt-0.5">
        <MapPin className="w-3.5 h-3.5" />
        {community.city}, {community.state}
      </p>

      {/* Description */}
      <p className="text-sm text-[#6B5E5A] mt-2 line-clamp-2">
        {community.description || "A vibrant community of Odias in this city."}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 text-xs text-[#6B5E5A]">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{community.memberCount} members</span>
        </div>
      </div>

      {/* Actions - Only Join Button */}
      <div className="mt-4 pt-4 border-t border-[#E7D7E8]/30">
        {isAuthenticated && isVerified ? (
          isMember ? (
            <button
              disabled
              className="w-full px-4 py-2.5 rounded-xl bg-green-100 text-green-700 text-sm font-medium cursor-default"
            >
              ✅ Member
            </button>
          ) : (
            <button
              onClick={() => onJoin?.(community.id)}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              Join Community
            </button>
          )
        ) : (
          <Link
            href={isAuthenticated ? "/profile" : "/login"}
            className="w-full px-4 py-2.5 rounded-xl bg-[#D4C8C0] text-white text-sm font-medium text-center block hover:bg-[#C4B8B0] transition-colors"
          >
            {isAuthenticated ? "Verify to Join" : "Login to Join"}
          </Link>
        )}
      </div>
    </motion.div>
  );
}