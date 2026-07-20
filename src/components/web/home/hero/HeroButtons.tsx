"use client";

import { FaArrowRight, FaGlobeAsia } from "react-icons/fa";
import { motion } from "framer-motion";

export default function HeroButtons() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {/* Primary Button */}
      <motion.button
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="
          group
          relative
          overflow-hidden
          rounded-full
          bg-gradient-to-r from-[#4A148C] via-[#6A1B9A] to-[#8E24AA]
          px-8
          py-4
          text-white
          shadow-[0_18px_45px_rgba(74,20,140,.35)]
          transition-all
          duration-300
          hover:shadow-[0_18px_45px_rgba(74,20,140,.5)]
        "
      >
        {/* Shine Effect */}
        <span className="absolute -left-24 top-0 h-full w-20 rotate-12 bg-white/30 blur-md transition-all duration-700 group-hover:left-[120%]" />
        <span className="relative flex items-center gap-3 font-semibold">
          Join Community
          <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </motion.button>

      {/* Secondary Button */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="
          rounded-full
          border
          border-[#DDD6D0]
          bg-white/90
          backdrop-blur-lg
          px-8
          py-4
          font-semibold
          text-[#6B1E5B]
          shadow-lg
          transition-all
          duration-300
          hover:border-[#6B1E5B]
          hover:shadow-xl
        "
      >
        <span className="flex items-center gap-3">
          <FaGlobeAsia />
          Explore Communities
        </span>
      </motion.button>
    </div>
  );
}