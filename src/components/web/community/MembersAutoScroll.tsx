"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, User, Loader2 } from "lucide-react";
import Image from "next/image";

interface Member {
  uid: string;
  displayName: string;
  photoURL?: string;
  isVerified: boolean;
  currentCity?: string;
}

interface MembersAutoScrollProps {
  memberIds: string[];
  communityId: string;
}

export default function MembersAutoScroll({ memberIds, communityId }: MembersAutoScrollProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Array of gradient colors for user icons
  const avatarColors = [
    "from-[#6B1E5B] to-[#D9772B]",
    "from-[#1E6B5B] to-[#2BD9B7]",
    "from-[#1E3B6B] to-[#2B97D9]",
    "from-[#6B1E3B] to-[#D92B6B]",
    "from-[#3B6B1E] to-[#97D92B]",
    "from-[#6B4B1E] to-[#D9B72B]",
    "from-[#1E4B6B] to-[#2B6BD9]",
    "from-[#6B1E4B] to-[#D92B97]",
    "from-[#4B6B1E] to-[#B7D92B]",
    "from-[#6B2B1E] to-[#D95B2B]",
  ];

  useEffect(() => {
    const fetchMembers = async () => {
      if (!memberIds || memberIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user details for each member ID
        const { userService } = await import("@/lib/services/userService");
        const memberPromises = memberIds.map(async (uid) => {
          const result = await userService.getUserProfile(uid);
          if (result.success && result.data) {
            return {
              uid,
              displayName: result.data.displayName || "Member",
              photoURL: result.data.photoURL || "",
              isVerified: result.data.isVerified || false,
              currentCity: result.data.currentCity || "",
            } as Member;
          }
          return null;
        });

        const results = await Promise.all(memberPromises);
        const validMembers = results.filter((m): m is Member => m !== null);
        setMembers(validMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [memberIds]);

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollContainerRef.current || members.length === 0) return;

    const container = scrollContainerRef.current;
    let scrollInterval: NodeJS.Timeout;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!container) return;
        
        const maxScroll = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= maxScroll - 10) {
          container.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ top: 80, behavior: "smooth" });
        }
      }, 2000);
    };

    startAutoScroll();

    // Pause on hover
    const pauseScroll = () => clearInterval(scrollInterval);
    container.addEventListener("mouseenter", pauseScroll);
    container.addEventListener("mouseleave", startAutoScroll);

    return () => {
      clearInterval(scrollInterval);
      container.removeEventListener("mouseenter", pauseScroll);
      container.removeEventListener("mouseleave", startAutoScroll);
    };
  }, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Loader2 className="w-6 h-6 text-[#6B1E5B] animate-spin" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
        <Users className="w-12 h-12 text-[#D4C8C0] mb-3" />
        <p className="text-[#6B5E5A] text-sm">No members yet</p>
        <p className="text-[#6B5E5A]/60 text-xs mt-1">Be the first to join this community!</p>
      </div>
    );
  }

  return (
    <div className="relative h-full max-h-[600px] overflow-hidden">
      {/* Gradient Fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/90 to-transparent pointer-events-none z-10" />

      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto scrollbar-hide py-4 px-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="space-y-3">
          {members.map((member, index) => (
            <motion.div
              key={member.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white/90 transition-all duration-300 border border-[#E7D7E8]/30 hover:border-[#6B1E5B]/20 shadow-sm hover:shadow-md group"
            >
              {/* Avatar - Always show User Icon for privacy */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-sm`}>
                  <User className="w-5 h-5" />
                </div>
                {member.isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border-2 border-white">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2A1636] truncate group-hover:text-[#6B1E5B] transition-colors">
                  {member.displayName}
                </p>
                <p className="text-xs text-[#6B5E5A] truncate">
                  {member.currentCity || "Member"}
                </p>
              </div>

              {/* Member Badge */}
              <span className="text-[8px] font-medium text-[#6B5E5A]/50 bg-[#F0EAE6] px-2 py-0.5 rounded-full">
                #{index + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Member Count Badge */}
      <div className="absolute top-4 right-4 bg-[#6B1E5B]/10 backdrop-blur-sm rounded-full px-3 py-1 border border-[#6B1E5B]/10 z-20">
        <span className="text-xs font-medium text-[#6B1E5B]">
          <Users className="w-3 h-3 inline mr-1" />
          {members.length}
        </span>
      </div>
    </div>
  );
}