"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, Users } from "lucide-react";

interface CommunityHeroProps {
  totalCommunities: number;
  totalMembers: number;
}

export default function CommunityHero({ totalCommunities, totalMembers }: CommunityHeroProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12">
      {/* Banner Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile ? "/communitymob.png" : "/communitybg2.png"}
          alt="Communities Banner"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1636]/70 via-[#2A1636]/50 to-[#2A1636]/30" />
      </div>

      {/* Content - Increased height */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center py-16 md:py-24 lg:py-28 px-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
          Find Your <span className="text-[#E6A11C]">Community</span>
        </h1>
        <p className="text-sm md:text-lg text-white/80 mt-3 md:mt-4 max-w-2xl mx-auto px-2">
          Connect with Odias in your city and beyond. Join communities that match your interests.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-6 md:mt-8">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
            <Building2 className="w-4 h-4 md:w-5 md:h-5 text-[#E6A11C]" />
            <span className="text-xs md:text-sm text-white/80">
              <span className="font-bold text-white">{totalCommunities}</span> Communities
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-[#E6A11C]" />
            <span className="text-xs md:text-sm text-white/80">
              <span className="font-bold text-white">{totalMembers}</span> Members
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}