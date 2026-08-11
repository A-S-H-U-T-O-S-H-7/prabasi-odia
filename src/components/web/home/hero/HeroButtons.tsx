"use client";

import { FaArrowRight, FaGlobeAsia, FaUserPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore, useUserStore } from "@/lib/store";

export default function HeroButtons() {
  const { user, isAuthenticated } = useAuthStore();
  const { hasJoinedCommunity } = useUserStore();

  const getJoinLink = () => {
    if (!isAuthenticated) return "/signup";
    if (!hasJoinedCommunity) return "/join-community";
    return "/profile";
  };

  const getButtonText = () => {
    if (!isAuthenticated) return "Register Now";
    if (!hasJoinedCommunity) return "Join Community";
    return "My Profile";
  };

  const showNewBadge = !isAuthenticated;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
      {/* Primary Button with optional badge */}
      <div className="relative">
        {showNewBadge && (
          <span className="absolute -top-2 -right-2 z-10 px-2 py-0.5 text-[9px] font-bold text-white bg-gradient-to-r from-[#D9772B] to-[#E6A11C] rounded-full shadow-lg animate-pulse">
            NEW
          </span>
        )}
        <Link href={getJoinLink()}>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="
              group
              relative
              overflow-hidden
              rounded-full
              bg-gradient-to-r from-[#4A148C] via-[#6A1B9A] to-[#8E24AA]
              px-6 sm:px-10
              py-3.5 sm:py-5
              text-sm sm:text-lg
              text-white
              font-bold
              shadow-[0_18px_45px_rgba(74,20,140,.35)]
              transition-all
              duration-300
              hover:shadow-[0_18px_45px_rgba(74,20,140,.5)]
              w-full sm:w-auto
              cursor-pointer
              tracking-wide
              flex items-center gap-2
            "
          >
            <span className="absolute -left-24 top-0 h-full w-20 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
            <span className="relative flex items-center gap-2">
              <FaUserPlus className="text-base sm:text-xl" />
              {getButtonText()}
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1 text-xs sm:text-base" />
            </span>
          </motion.button>
        </Link>
      </div>

      {/* Secondary Button */}
      <Link href="/communities">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="
            rounded-full
            border-2
            border-[#DDD6D0]
            bg-white/90
            backdrop-blur-lg
            px-6 sm:px-10
            py-3.5 sm:py-5
            text-sm sm:text-base
            font-semibold
            text-[#6B1E5B]
            shadow-lg
            transition-all
            duration-300
            hover:border-[#6B1E5B]
            hover:shadow-xl
            w-full sm:w-auto
            text-center
            cursor-pointer
          "
        >
          <span className="flex cursor-pointer items-center justify-center gap-2">
            <FaGlobeAsia className="text-sm sm:text-base" />
            Explore Communities
          </span>
        </motion.button>
      </Link>
    </div>
  );
}