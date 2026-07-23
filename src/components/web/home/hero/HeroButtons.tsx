"use client";

import { FaArrowRight, FaGlobeAsia } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore, useUserStore } from "@/lib/store";

export default function HeroButtons() {
  const { user, isAuthenticated } = useAuthStore();
  const { hasJoinedCommunity } = useUserStore();

  const getJoinLink = () => {
    if (!isAuthenticated) {
      return "/signup";
    }
    if (!hasJoinedCommunity) {
      return "/join-community";
    }
    return "/profile";
  };

  const joinLink = getJoinLink();

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-5">
      {/* Primary Button - Reduced padding on mobile */}
      <Link href={joinLink}>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="
            group
            relative
            overflow-hidden
            rounded-full
            bg-gradient-to-r from-[#4A148C] via-[#6A1B9A] to-[#8E24AA]
            px-3 sm:px-5
            py-2.5 sm:py-4
            text-xs sm:text-base
            text-white
            shadow-[0_18px_45px_rgba(74,20,140,.35)]
            transition-all
            duration-300
            hover:shadow-[0_18px_45px_rgba(74,20,140,.5)]
            w-full sm:w-auto cursor-pointer
          "
        >
          <span className="absolute -left-24 top-0 h-full w-20 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
          <span className="relative flex items-center justify-center gap-1.5 sm:gap-3 font-semibold">
            Join Community
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1 text-xs sm:text-base" />
          </span>
        </motion.button>
      </Link>

      {/* Secondary Button - Reduced padding on mobile */}
      <Link href="/communities">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="
            rounded-full
            border
            border-[#DDD6D0]
            bg-white/90
            backdrop-blur-lg
            px-3 sm:px-5
            py-2.5 sm:py-4
            text-xs sm:text-base
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
          <span className="flex cursor-pointer items-center justify-center gap-1.5 sm:gap-3">
            <FaGlobeAsia className="text-xs sm:text-base" />
            Explore Communities
          </span>
        </motion.button>
      </Link>
    </div>
  );
}