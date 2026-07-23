"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const avatars = [
  "/avatar1.jpeg",
  "/avatar2.jpeg",
  "/avatar3.jpeg",
  "/avatar4.jpeg",
  "/avatar5.jpeg",
];

export default function AvatarGroup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-6 sm:mt-8"
    >
      <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 rounded-2xl border border-white/50 bg-white/95 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3 shadow-[0_15px_40px_rgba(0,0,0,.08)] w-full sm:w-auto">
        {/* Avatar Stack */}
        <div className="flex items-center">
          {avatars.map((avatar, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4, scale: 1.08, zIndex: 20 }}
              className={`relative ${index !== 0 ? "-ml-3 sm:-ml-4" : ""}`}
            >
              <Image
                src={avatar}
                alt="Community member"
                width={36}
                height={36}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover shadow-lg"
              />
            </motion.div>
          ))}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-[#2F1734] truncate">
            <span className="text-[#6B1E5B]">12,500+</span> Odias Joined
          </h3>
          <p className="text-xs sm:text-sm text-[#6C6C74] truncate">
            Noida, Chennai, Bangalore, Kolkata & more.
          </p>
        </div>
      </div>
    </motion.div>
  );
}