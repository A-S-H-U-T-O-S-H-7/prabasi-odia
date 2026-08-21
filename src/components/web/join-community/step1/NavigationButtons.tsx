// components/web/join-community/step1/NavigationButtons.tsx
"use client";

import { motion } from "framer-motion";

interface NavigationButtonsProps {
  isFirstStep: boolean;
  onBack?: () => void;
  onNext: () => void;
}

export default function NavigationButtons({ isFirstStep, onBack, onNext }: NavigationButtonsProps) {
  return (
    <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20 mt-6">
      {!isFirstStep ? (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer">
          ← Back
        </motion.button>
      ) : (
        <div />
      )}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onNext} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-medium shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 cursor-pointer">
        Next →
      </motion.button>
    </div>
  );
}