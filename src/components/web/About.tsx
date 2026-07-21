"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Users, 
  Globe, 
  Calendar, 
  Shield, 
  Handshake, 
  Sparkles, 
  ArrowRight,
  MapPin,
  Building2,
  GraduationCap,
  TreePalm,
  Coffee
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] overflow-hidden">
      
      {/* ========== HERO BANNER ========== */}
      <section className="relative min-h-[65vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/about2.png"
            alt="Prabasi Odia - Connecting Odias Worldwide"
            fill
            className="object-cover"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A1636]/80 via-[#2A1636]/50 to-transparent" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#E6A11C]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#6B1E5B]/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20">
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6"
            >
              <span className="text-xs font-medium text-white/80">🌏 Connecting Odias Worldwide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.1]"
            >
              Our Story
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg md:text-xl text-white/80 mt-4 max-w-lg"
            >
              Prabasi Odia was born from a simple idea — to bring Odias together, 
              no matter where they are in the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <Link
                href="/join-community"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6B1E5B] to-[#8A2E72] text-white font-medium hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Join Our Journey
              </Link>
              <Link
                href="/communities"
                className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium hover:bg-white/20 transition-all"
              >
                Explore Communities
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== MISSION & VISION ========== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              Our Purpose
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
              Why We Exist
            </h2>
            <p className="text-[#6B5E5A] mt-2 max-w-2xl mx-auto">
              We believe every Odia deserves a community that feels like home.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#E7D7E8] p-8 shadow-[0_20px_60px_rgba(107,30,91,0.06)] hover:shadow-[0_20px_60px_rgba(107,30,91,0.12)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#6B1E5B]/10 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-[#6B1E5B]" />
              </div>
              <h3 className="text-xl font-bold text-[#2A1636]">Our Mission</h3>
              <p className="text-[#6B5E5A] mt-2 leading-relaxed">
                To connect Odias across the globe, fostering a sense of belonging, 
                preserving our rich culture, and creating opportunities for growth 
                and collaboration.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#6B1E5B]/5 to-[#D9772B]/5 backdrop-blur-sm rounded-3xl border border-[#E7D7E8] p-8 shadow-[0_20px_60px_rgba(107,30,91,0.06)] hover:shadow-[0_20px_60px_rgba(107,30,91,0.12)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#D9772B]/10 flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-[#D9772B]" />
              </div>
              <h3 className="text-xl font-bold text-[#2A1636]">Our Vision</h3>
              <p className="text-[#6B5E5A] mt-2 leading-relaxed">
                A world where every Odia, regardless of where they live, feels 
                connected to their roots, supported by their community, and 
                empowered to thrive.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== OUR STORY TIMELINE ========== */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#FFF9F2] to-[#FDE8D0]/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              Our Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
              How It All Began
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E7D7E8] hidden md:block" />

            {/* Timeline Items */}
            <div className="space-y-12 md:space-y-0">
              {/* Item 1 */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
              >
                <div className="md:w-1/2 md:text-right">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-6 shadow-sm hover:shadow-md transition-all">
                    <span className="text-xs font-bold text-[#6B1E5B] bg-[#6B1E5B]/10 px-3 py-1 rounded-full">2026</span>
                    <h4 className="text-lg font-bold text-[#2A1636] mt-3">The Vision Takes Shape</h4>
                    <p className="text-[#6B5E5A] text-sm mt-1">
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
                className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
              >
                <div className="md:w-1/2" />
                <div className="hidden md:block w-4 h-4 rounded-full bg-[#D9772B] ring-4 ring-[#D9772B]/20 z-10" />
                <div className="md:w-1/2 md:text-left">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-6 shadow-sm hover:shadow-md transition-all">
                    <span className="text-xs font-bold text-[#D9772B] bg-[#D9772B]/10 px-3 py-1 rounded-full">2026</span>
                    <h4 className="text-lg font-bold text-[#2A1636] mt-3">Building the Foundation</h4>
                    <p className="text-[#6B5E5A] text-sm mt-1">
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
                className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
              >
                <div className="md:w-1/2 md:text-right">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#E7D7E8] p-6 shadow-sm hover:shadow-md transition-all">
                    <span className="text-xs font-bold text-[#E6A11C] bg-[#E6A11C]/10 px-3 py-1 rounded-full">2026 & Beyond</span>
                    <h4 className="text-lg font-bold text-[#2A1636] mt-3">A Journey Begins</h4>
                    <p className="text-[#6B5E5A] text-sm mt-1">
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

      {/* ========== CORE VALUES ========== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, label: "Community First", desc: "We prioritize the well-being and growth of our community" },
              { icon: Shield, label: "Trust & Safety", desc: "Verified members and secure connections" },
              { icon: Handshake, label: "Cultural Pride", desc: "Celebrating and preserving Odia heritage" },
              { icon: Sparkles, label: "Empowerment", desc: "Creating opportunities for every member" },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#E7D7E8] p-6 text-center shadow-[0_20px_60px_rgba(107,30,91,0.06)] hover:shadow-[0_20px_60px_rgba(107,30,91,0.12)] transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B1E5B]/10 to-[#D9772B]/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-[#6B1E5B]" />
                </div>
                <h4 className="text-lg font-bold text-[#2A1636]">{value.label}</h4>
                <p className="text-sm text-[#6B5E5A] mt-2">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#6B1E5B] to-[#8A2E72] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold">
              Be Part of the Journey
            </h2>
            <p className="text-white/80 mt-3 max-w-2xl mx-auto">
              This is just the beginning. Join us in building a community that 
              connects Odias across the globe — today, tomorrow, and always.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Link
                href="/join-community"
                className="px-6 py-3 rounded-2xl bg-white text-[#6B1E5B] font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Join the Community
              </Link>
              <Link
                href="/communities"
                className="px-6 py-3 rounded-2xl border border-white/30 text-white font-medium hover:bg-white/10 transition-all"
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