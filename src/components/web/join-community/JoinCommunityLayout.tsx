// components/web/join-community/JoinCommunityLayout.tsx
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import StepIndicator from "./StepIndicator";

interface JoinCommunityLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}

export default function JoinCommunityLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
}: JoinCommunityLayoutProps) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#FFF9F2] via-[#F5EDE6] to-[#F0E6DE]">
      {/* Background Images - Desktop */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <Image 
          src="/loginbg3.png" 
          alt="Community Background" 
          fill 
          className="object-cover opacity-30"
          priority
        />
      </div>

      {/* Background Images - Mobile */}
      <div className="absolute inset-0 pointer-events-none md:hidden">
        <Image 
          src="/communitymobbg.png" 
          alt="Community Background" 
          fill 
          className="object-cover opacity-20"
          priority
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Image 
          src="/patterns/mandala-01.png" 
          alt="" 
          width={500} 
          height={500} 
          className="absolute -right-32 -top-32 opacity-[0.04]" 
        />
        <Image 
          src="/patterns/mandala-02.png" 
          alt="" 
          width={300} 
          height={300} 
          className="absolute -bottom-16 -left-16 opacity-[0.05]" 
        />
        
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [Math.random() * 80 - 40, Math.random() * 80 - 40],
              x: [Math.random() * 80 - 40, Math.random() * 80 - 40],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
            className="absolute w-2 h-2 rounded-full bg-[#E8B84C]/20 blur-[1px]"
            style={{ top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%` }}
          />
        ))}

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#6B1E5B]/5 to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2A1636]">{title}</h1>
            <p className="text-[#6B5E5A] mt-2 text-sm sm:text-base">{subtitle}</p>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_20px_60px_rgba(107,30,91,0.08)] p-4 sm:p-6 md:p-8"
          >
            <div className="absolute -right-32 -top-32 w-64 h-64 rounded-full bg-[#6B1E5B]/5 blur-[80px]" />
            <div className="absolute -left-32 bottom-0 w-64 h-64 rounded-full bg-[#D9772B]/5 blur-[80px]" />
            <div className="relative z-10">{children}</div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}