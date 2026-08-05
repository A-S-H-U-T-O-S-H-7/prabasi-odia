"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Users, Calendar, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicCommunity } from "@/lib/services/publicCommunityService";

interface CommunityCoverProps {
  community: PublicCommunity;
  eventsCount: number;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
  isLoading: boolean;
}

export default function CommunityCover({
  community,
  eventsCount,
  isMember,
  onJoin,
  onLeave,
  isLoading,
}: CommunityCoverProps) {
  const router = useRouter();

  return (
    <div className="relative w-full h-[65vh] overflow-hidden rounded-3xl shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        {community.coverImage ? (
          <Image
            src={community.coverImage}
            alt={community.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] flex items-center justify-center">
            <span className="text-8xl opacity-50">🏘️</span>
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F1A]/90 via-[#1A0F1A]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0F1A]/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => router.push("/communities")}
          className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-300 border border-white/20 z-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <div className="max-w-4xl space-y-4">
          {/* Community Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight"
          >
            {community.name}
          </motion.h1>

          {/* Location & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 text-white/90"
          >
            <span className="flex items-center gap-1.5 text-sm md:text-base bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <MapPin className="w-4 h-4" />
              {community.city}, {community.state}
            </span>
            <span className="flex items-center gap-1.5 text-sm md:text-base bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Users className="w-4 h-4" />
              {community.memberCount} members
            </span>
            <span className="flex items-center gap-1.5 text-sm md:text-base bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Calendar className="w-4 h-4" />
              {eventsCount} events
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed"
          >
            {community.description || "A vibrant community of Odias in this location."}
          </motion.p>

          {/* Join Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {isLoading ? (
              <div className="w-40 h-12 bg-white/20 rounded-xl animate-pulse" />
            ) : (
              <button
                onClick={isMember ? onLeave : onJoin}
                className={`
                  px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2
                  ${isMember 
                    ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30' 
                    : 'bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white shadow-lg hover:shadow-[#6B1E5B]/30 hover:scale-[1.02]'
                  }
                `}
              >
                {isMember ? (
                  <>
                    <span>✓ Member</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  "Join Community →"
                )}
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Decorative Corner Element */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D9772B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-40 h-40 bg-[#6B1E5B]/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}