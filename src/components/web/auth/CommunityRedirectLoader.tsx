"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";

export default function CommunityRedirectLoader() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF9F2] px-5"
      role="status"
      aria-live="polite"
      aria-label="Taking you to the community registration page"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(226,161,58,0.22),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(107,30,91,0.2),transparent_42%)]" />

      <motion.div
        className="absolute h-72 w-72 rounded-full border border-[#D9772B]/15 sm:h-96 sm:w-96"
        animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-56 w-56 rounded-full border border-[#6B1E5B]/15 sm:h-72 sm:w-72"
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <span className="absolute -top-2 left-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#6B1E5B] shadow-lg shadow-[#6B1E5B]/30">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-[32px] border border-white/80 bg-white/75 px-6 py-9 text-center shadow-[0_28px_80px_rgba(107,30,91,0.16)] backdrop-blur-xl sm:px-10 sm:py-11"
      >
        <div className="relative mx-auto mb-6 h-24 w-24">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-r-[#D9772B] border-t-[#6B1E5B]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white shadow-inner">
            <Image src="/logo.png" alt="Prabasi Odia" width={58} height={58} className="h-14 w-14 object-contain" priority />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#D9772B]">
            Welcome to Prabasi Odia
          </p>
          <h1 className="text-2xl font-bold text-[#2A1636] sm:text-3xl">Let&apos;s find your community</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#6B5E5A]">
            Your account is ready. We&apos;re taking you to the final step so you can connect with Odias near you.
          </p>
        </motion.div>

        <div className="mt-7 flex items-center justify-center gap-3 text-[#6B1E5B]">
          <MapPin className="h-4 w-4" />
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-2 w-2 rounded-full bg-[#D9772B]"
                animate={{ y: [0, -6, 0], opacity: [0.45, 1, 0.45] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.14 }}
              />
            ))}
          </div>
          <Users className="h-4 w-4" />
        </div>
      </motion.section>
    </main>
  );
}
