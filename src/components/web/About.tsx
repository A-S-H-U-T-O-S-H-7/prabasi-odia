"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Shield, 
  Handshake, 
  Sparkles, 
  ArrowRight,
} from "lucide-react";
import { useAuthStore, useUserStore } from "@/lib/store";

export default function AboutPage() {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { hasJoinedCommunity } = useUserStore();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // CTA Button Logic
  const getJoinLink = () => {
    if (!isAuthenticated) return "/signup";
    if (!hasJoinedCommunity) return "/join-community";
    return "/profile";
  };

  const getButtonText = () => {
    if (!isAuthenticated) return "Join the Community";
    if (!hasJoinedCommunity) return "Complete Your Profile";
    return "Go to Profile";
  };

  // Core Values Data with Different Colors
  const coreValues = [
    { 
      icon: Heart, 
      label: "Community First", 
      desc: "We prioritize the well-being of our community",
      color: "text-[#6B1E5B]",
      bgColor: "bg-[#6B1E5B]/10",
      shadowColor: "shadow-[#6B1E5B]/10"
    },
    { 
      icon: Shield, 
      label: "Trust & Safety", 
      desc: "Verified members and secure connections",
      color: "text-[#D9772B]",
      bgColor: "bg-[#D9772B]/10",
      shadowColor: "shadow-[#D9772B]/10"
    },
    { 
      icon: Handshake, 
      label: "Cultural Pride", 
      desc: "Celebrating and preserving Odia heritage",
      color: "text-[#059669]",
      bgColor: "bg-[#059669]/10",
      shadowColor: "shadow-[#059669]/10"
    },
    { 
      icon: Sparkles, 
      label: "Empowerment", 
      desc: "Creating opportunities for every member",
      color: "text-[#7C3AED]",
      bgColor: "bg-[#7C3AED]/10",
      shadowColor: "shadow-[#7C3AED]/10"
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F2] overflow-hidden">
      
      {/* ========== HERO BANNER ========== */}
      <section className="relative min-h-[55vh] md:min-h-[65vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={isMobile ? "/aboutmob.png" : "/about2.png"}
            alt="Prabasi Odia - Connecting Odias Worldwide"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1636]/80 via-[#2A1636]/50 to-transparent" />
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-48 md:w-64 h-48 md:h-64 bg-[#E6A11C]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-60 md:w-80 h-60 md:h-80 bg-[#6B1E5B]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 md:mb-6"
            >
              <span className="text-[10px] md:text-xs font-medium text-white/80">🌏 Connecting Odias Worldwide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1]"
            >
              Our Story
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm md:text-lg lg:text-xl text-white/80 mt-2 md:mt-4 max-w-lg"
            >
              Prabasi Odia was born from a simple idea — to bring Odias together, 
              no matter where they are in the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3 md:gap-4 mt-6 md:mt-8"
            >
              <Link
                href={getJoinLink()}
                className="px-5 md:px-6 py-2.5 md:py-3 rounded-2xl bg-gradient-to-r from-[#6B1E5B] to-[#8A2E72] text-white text-sm md:text-base font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                {getButtonText()}
              </Link>
              <Link
                href="/communities"
                className="px-5 md:px-6 py-2.5 md:py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm md:text-base font-medium hover:bg-white/20 transition-all"
              >
                Explore Communities
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== MISSION & VISION ========== */}
      <section className="py-8 md:py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              Our Purpose
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2A1636] mt-3 md:mt-4">
              Why We Exist
            </h2>
            <p className="text-sm md:text-base text-[#6B5E5A] mt-2 max-w-2xl mx-auto">
              We believe every Odia deserves a community that feels like home.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-[#E7D7E8] p-6 md:p-8 shadow-[0_20px_60px_rgba(107,30,91,0.06)] hover:shadow-[0_20px_60px_rgba(107,30,91,0.12)] transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#6B1E5B]/10 flex items-center justify-center mb-3 md:mb-4">
                <Heart className="w-6 h-6 md:w-7 md:h-7 text-[#6B1E5B]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#2A1636]">Our Mission</h3>
              <p className="text-sm md:text-base text-[#6B5E5A] mt-1 md:mt-2 leading-relaxed">
                To connect Odias across the globe, fostering a sense of belonging, 
                preserving our rich culture, and creating opportunities for growth 
                and collaboration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-[#E7D7E8] p-6 md:p-8 shadow-[0_20px_60px_rgba(107,30,91,0.06)] hover:shadow-[0_20px_60px_rgba(107,30,91,0.12)] transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#D9772B]/10 flex items-center justify-center mb-3 md:mb-4">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#D9772B]" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-[#2A1636]">Our Vision</h3>
              <p className="text-sm md:text-base text-[#6B5E5A] mt-1 md:mt-2 leading-relaxed">
                A world where every Odia, regardless of where they live, feels 
                connected to their roots, supported by their community, and 
                empowered to thrive.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== OUR STORY TIMELINE ========== */}
      <section className="py-8 md:py-10 px-4 bg-gradient-to-b from-[#F5EDF5] via-[#FFF9F2] to-[#FDE8D0]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              Our Journey
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2A1636] mt-3 md:mt-4">
              How It All Began
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E7D7E8] hidden md:block" />

            <div className="space-y-10 md:space-y-0">
              {/* Item 1 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
              >
                <div className="md:w-1/2 md:text-right">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-[#E7D7E8] p-5 md:p-6 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] md:text-xs font-bold text-[#6B1E5B] bg-[#6B1E5B]/10 px-3 py-1 rounded-full">2026</span>
                    <h4 className="text-base md:text-lg font-bold text-[#2A1636] mt-2 md:mt-3">The Vision Takes Shape</h4>
                    <p className="text-xs md:text-sm text-[#6B5E5A] mt-1">
                      A group of passionate Odias came together with a vision to create 
                      a digital home for the diaspora — a place where every Odia belongs.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-4 h-4 rounded-full bg-[#6B1E5B] ring-4 ring-[#6B1E5B]/20 z-10" />
                <div className="md:w-1/2" />
              </motion.div>

              {/* Item 2 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
              >
                <div className="md:w-1/2" />
                <div className="hidden md:block w-4 h-4 rounded-full bg-[#D9772B] ring-4 ring-[#D9772B]/20 z-10" />
                <div className="md:w-1/2 md:text-left">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-[#E7D7E8] p-5 md:p-6 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] md:text-xs font-bold text-[#D9772B] bg-[#D9772B]/10 px-3 py-1 rounded-full">2026</span>
                    <h4 className="text-base md:text-lg font-bold text-[#2A1636] mt-2 md:mt-3">Building the Foundation</h4>
                    <p className="text-xs md:text-sm text-[#6B5E5A] mt-1">
                      The platform was built with love and care — designed to connect 
                      Odias across cities, cultures, and generations with authenticity 
                      and trust.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Item 3 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
              >
                <div className="md:w-1/2 md:text-right">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl border border-[#E7D7E8] p-5 md:p-6 shadow-sm hover:shadow-md transition-all">
                    <span className="text-[10px] md:text-xs font-bold text-[#E6A11C] bg-[#E6A11C]/10 px-3 py-1 rounded-full">2026 & Beyond</span>
                    <h4 className="text-base md:text-lg font-bold text-[#2A1636] mt-2 md:mt-3">A Journey Begins</h4>
                    <p className="text-xs md:text-sm text-[#6B5E5A] mt-1">
                      Today marks the beginning of an incredible journey — connecting 
                      Odias worldwide, celebrating our culture, and building a community 
                      that will grow for generations to come.
                    </p>
                  </div>
                </div>
                <div className="hidden md:block w-4 h-4 rounded-full bg-[#E6A11C] ring-4 ring-[#E6A11C]/20 z-10" />
                <div className="md:w-1/2" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CORE VALUES — CLAYMORPHISM WITH DIFFERENT COLORS ========== */}
      <section className="py-8 md:py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-12"
          >
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              What We Stand For
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2A1636] mt-3 md:mt-4">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60  backdrop-blur-sm rounded-2xl p-4 md:p-6 text-center shadow-[8px_8px_30px_rgba(107,30,91,0.08),-8px_-8px_30px_rgba(255,255,255,0.8)] border border-gray-300 hover:shadow-[12px_12px_40px_rgba(107,30,91,0.12),-12px_-12px_40px_rgba(255,255,255,0.9)] transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${value.bgColor} flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-[inset_2px_2px_8px_rgba(107,30,91,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.8)]`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${value.color}`} />
                  </div>
                  <h4 className="text-sm md:text-base font-bold text-[#2A1636]">{value.label}</h4>
                  <p className="text-[9px] md:text-xs text-[#6B5E5A] mt-1 leading-tight">
                    {value.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-8 md:py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] rounded-2xl md:rounded-3xl p-6 md:p-12 text-center text-white shadow-xl"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold">
              Be Part of the Journey
            </h2>
            <p className="text-white/80 mt-2 md:mt-3 max-w-2xl mx-auto text-sm md:text-base">
              This is just the beginning. Join us in building a community that 
              connects Odias across the globe — today, tomorrow, and always.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-5 md:mt-6">
              <Link
                href={getJoinLink()}
                className="px-5 md:px-6 py-2.5 md:py-3 rounded-2xl bg-white text-[#6B1E5B] text-sm md:text-base font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                {getButtonText()}
              </Link>
              <Link
                href="/communities"
                className="px-5 md:px-6 py-2.5 md:py-3 rounded-2xl border border-white/30 text-white text-sm md:text-base font-medium hover:bg-white/10 transition-all"
              >
                Explore Communities
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}