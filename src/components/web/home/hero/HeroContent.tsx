"use client";

import { motion } from "framer-motion";
import HeroButtons from "./HeroButtons";
import AvatarGroup from "./AvatarGroup";
import Stats from "./Stats";

export default function HeroContent() {
  return (
    <div className="max-w-3xl py-4 sm:py-0">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex mt-2 sm:mt-5 items-center gap-2 rounded-full border border-[#F4D3BE] bg-white/80 px-3 sm:px-5 py-1.5 sm:py-2 shadow-lg backdrop-blur-md"
      >
        <span className="h-2 w-2 sm:h-3 sm:w-2.5 rounded-full bg-gradient-to-r from-[#6B1E5B] to-[#D9772B]" />
        <span className="text-[12px] sm:text-sm font-semibold tracking-wide text-[#6B1E5B]">
          Connecting Odias Worldwide
        </span>
      </motion.div>

      {/* Heading - Reduced for mobile */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="
          mt-3 sm:mt-4
          font-serif
          font-bold
          tracking-[-1px] sm:tracking-[-2px]
          leading-[0.95]
          text-[40px]      /* Mobile */
          sm:text-[48px]   /* Tablet */
          lg:text-[66px]   /* Desktop */
          xl:text-[76px]   /* Large Desktop */
        "
      >
        <span className="bg-gradient-to-r from-[#4A148C] via-[#6A1B9A] to-[#8E24AA] bg-clip-text text-transparent">
          One Community.
        </span>
        <br />
        <span className="whitespace-normal sm:whitespace-nowrap bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-[#E6A11C] bg-clip-text text-transparent">
          Limitless Connections.
        </span>
      </motion.h1>

      {/* Description - Reduced for mobile */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="
          mt-4 sm:mt-6
          text-[14px]      /* Mobile */
          sm:text-[16px]   /* Desktop */
          leading-[1.6] sm:leading-8
          text-[#5C5C66]
          max-w-2xl
        "
      >
        Prabasi Odia is a global platform connecting Odias across
        the world through culture, community, professional
        networking, events, volunteering, and meaningful
        relationships. Together we preserve our heritage while
        creating opportunities for future generations.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-6 sm:mt-8"
      >
        <HeroButtons />
      </motion.div>

      {/* Avatar Group */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <AvatarGroup />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 sm:mt-10"
      >
        <Stats />
      </motion.div>
    </div>
  );
}