"use client";

import { Heart, Users, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DonationBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl mb-8 md:mb-12 bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] p-6 md:p-10 shadow-xl"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full" />
        <div className="absolute top-10 right-10 w-40 h-40 bg-white rounded-full" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-white rounded-full" />
      </div>

      {/* Decorative Blurs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#F3C97A]/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#6B1E5B]/30 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4 md:mb-6"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-4">
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-white" fill="currentColor" />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-3 md:mb-4"
        >
          Make a Difference Today
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base md:text-lg lg:text-xl text-white/90 font-light max-w-2xl mx-auto"
        >
          Your contribution creates lasting impact in communities across Odisha and beyond
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4 md:mt-6"
        >
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-5 md:py-2 border border-white/20">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
            <span className="text-xs md:text-sm text-white/90">1000+ Lives Impacted</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-5 md:py-2 border border-white/20">
            <Globe className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
            <span className="text-xs md:text-sm text-white/90">50+ Communities</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 md:px-5 md:py-2 border border-white/20">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white/80" />
            <span className="text-xs md:text-sm text-white/90">80G Tax Exemption</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}