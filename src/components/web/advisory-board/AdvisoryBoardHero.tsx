"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Star, Award } from "lucide-react";

interface AdvisoryBoardHeroProps {
  totalMembers: number;
  featuredCount: number;
}

export default function AdvisoryBoardHero({
  totalMembers,
  featuredCount,
}: AdvisoryBoardHeroProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12">
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile ? "/aboutmob.png" : "/about2.png"}
          alt="Advisory Board Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1636]/75 via-[#2A1636]/55 to-[#2A1636]/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center py-16 md:py-24 lg:py-28 px-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
          Advisory <span className="text-[#E6A11C]">Board</span>
        </h1>
        <p className="text-sm md:text-lg text-white/80 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
          Meet the leaders guiding Prabasi Odia with wisdom, experience, and
          cultural pride.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-[#E6A11C]" />
            <span className="text-xs md:text-sm text-white/80">
              <span className="font-bold text-white">{totalMembers}</span> Members
            </span>
          </div>
          {featuredCount > 0 && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-[#E6A11C]" />
              <span className="text-xs md:text-sm text-white/80">
                <span className="font-bold text-white">{featuredCount}</span>{" "}
                Featured
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-[#E6A11C]" />
            <span className="text-xs md:text-sm text-white/80">
              Guiding Our Community
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
