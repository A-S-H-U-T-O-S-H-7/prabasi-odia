"use client";

import { FaArrowRight, FaGlobeAsia } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore, useUserStore } from "@/lib/store";

export default function HeroButtons() {
  const { user, isAuthenticated } = useAuthStore();
  const { hasJoinedCommunity } = useUserStore();

  // Determine where the "Join Community" button should go
  const getJoinLink = () => {
    if (!isAuthenticated) {
      return "/signup"; // Not logged in → Signup
    }
    if (!hasJoinedCommunity) {
      return "/join-community"; // Logged in but not joined → Join Community form
    }
    return "/profile"; // Logged in and joined → Profile
  };

  const joinLink = getJoinLink();

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-5">
      {/* Primary Button */}
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
            px-5 sm:px-8
            py-3 sm:py-4
            text-sm sm:text-base
            text-white
            shadow-[0_18px_45px_rgba(74,20,140,.35)]
            transition-all
            duration-300
            hover:shadow-[0_18px_45px_rgba(74,20,140,.5)]
            w-full sm:w-auto
          "
        >
          {/* Shine Effect */}
          <span className="absolute -left-24 top-0 h-full w-20 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
          <span className="relative flex items-center justify-center gap-2 sm:gap-3 font-semibold">
            Join Community
            <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1 text-sm sm:text-base" />
          </span>
        </motion.button>
      </Link>

      {/* Secondary Button */}
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
            px-5 sm:px-8
            py-3 sm:py-4
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
          "
        >
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <FaGlobeAsia className="text-sm sm:text-base" />
            Explore Communities
          </span>
        </motion.button>
      </Link>
    </div>
  );
}