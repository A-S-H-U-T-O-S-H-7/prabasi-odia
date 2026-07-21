"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#FDE8D0]/20 via-[#FFF9F2] to-[#6B1E5B]/5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3" />
          
          {/* Floating Sparkles */}
          <div className="absolute top-4 left-8 opacity-20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-8 right-12 opacity-20">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4"
            >
              <span className="text-xs font-medium">🌟 Join 25,000+ Odias</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-serif font-bold"
            >
              Ready to <span className="text-[#E6A11C]">Connect</span>?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-white/80 mt-4 max-w-2xl mx-auto text-lg"
            >
              Join thousands of Odias already building meaningful connections. 
              Your community is waiting.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              <Link
                href="/join-community"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#6B1E5B] font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                Join the Community
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/communities"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-white/30 text-white font-medium hover:bg-white/10 transition-all"
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