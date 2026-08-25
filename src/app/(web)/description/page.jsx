// app/(web)/Description/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Users, Camera, Bell, Heart, Globe } from "lucide-react";

export default function Description() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] via-white to-[#FDE8D0]/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-[#E7D7E8] text-[#6B5E5A] hover:text-[#6B1E5B] hover:border-[#6B1E5B]/30 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl border border-[#E7D7E8] p-8 md:p-12 shadow-sm"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6B1E5B]/10 text-[#6B1E5B] text-sm font-medium mb-4">
              <Globe className="w-4 h-4" />
              Connecting Odias Worldwide
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mb-4">
              About <span className="text-[#6B1E5B]">Prabasi Odia</span>
            </h1>
          </div>

          {/* Description */}
          <div className="text-[#6B5E5A] leading-relaxed space-y-6">
            <p className="text-lg">
              Prabasi Odia brings the Odia diaspora together in one place. Stay connected with fellow community members, 
              discover upcoming cultural events and gatherings, and relive shared memories through photos from past celebrations.
            </p>

            {/* Features */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#2A1636] mb-4">Features</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B5E5A]">Browse and register for community events</span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B5E5A]">Access the member directory to connect with fellow Odias</span>
                </li>
                <li className="flex items-start gap-3">
                  <Camera className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B5E5A]">View and share photos from events and celebrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-[#6B1E5B] mt-0.5 flex-shrink-0" />
                  <span className="text-[#6B5E5A]">Get updates and announcements from the community</span>
                </li>
              </ul>
            </div>

            {/* Community Message */}
            <div className="bg-gradient-to-r from-[#6B1E5B]/5 via-[#D9772B]/5 to-[#6B1E5B]/5 rounded-2xl p-6 border border-[#E7D7E8]/50 text-center mt-8">
              <Heart className="w-8 h-8 text-[#6B1E5B] mx-auto mb-3" />
              <p className="text-[#2A1636] text-base leading-relaxed">
                Whether you're new to the area or a long-time member, Prabasi Odia helps you stay rooted in culture 
                and connected to community — wherever you are.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}