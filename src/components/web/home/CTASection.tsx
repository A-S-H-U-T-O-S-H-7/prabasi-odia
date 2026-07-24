"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore, useUserStore } from "@/lib/store";

export default function CTASection() {
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

  // Get button text based on state
  const getButtonText = () => {
    if (!isAuthenticated) {
      return "Join the Community";
    }
    if (!hasJoinedCommunity) {
      return "Complete Your Profile";
    }
    return "Go to Profile";
  };

  const joinLink = getJoinLink();
  const buttonText = getButtonText();

  return (
    <section className="py-8 md:py-10 px-2 md:px-4 bg-gradient-to-b from-[#FDE8D0]/20 via-[#FFF9F2] to-[#6B1E5B]/5">
      <div className="max-w-5xl px-2 md:px-5 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] rounded-2xl md:rounded-3xl p-6 md:p-12 text-center text-white shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />
          
          {/* Floating Sparkles */}
          <div className="absolute top-3 left-4 md:top-4 md:left-8 opacity-20">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="absolute bottom-6 right-6 md:bottom-8 md:right-12 opacity-20">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-3 md:mb-4"
            >
              <span className="text-[10px] md:text-xs font-medium">🌟 Join 25,000+ Odias</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold"
            >
              Ready to <span className="text-[#E6A11C]">Connect</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-white/70 md:text-white/80 mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-lg px-2"
            >
              Join thousands of Odias already building meaningful connections. 
              Your community is waiting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8"
            >
              <Link
                href={joinLink}
                className="inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-2xl bg-white text-[#6B1E5B] font-semibold hover:shadow-lg transition-all hover:scale-[1.02] text-sm md:text-base"
              >
                {buttonText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/communities"
                className="inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-2xl border border-white/30 text-white font-medium hover:bg-white/10 transition-all text-sm md:text-base"
              >
                Explore Communities
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}