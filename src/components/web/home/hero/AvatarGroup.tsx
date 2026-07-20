"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const avatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
  "/avatars/5.jpg",
];

export default function AvatarGroup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <div className="inline-flex flex-wrap items-center gap-4 rounded-2xl border border-white/50 bg-white/75 px-4 py-3 shadow-[0_15px_40px_rgba(0,0,0,.08)] backdrop-blur-xl">
        {/* Avatar Stack */}
        <div className="flex items-center">
          {avatars.map((avatar, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4, scale: 1.08, zIndex: 20 }}
              className={`relative ${index !== 0 ? "-ml-4" : ""}`}
            >
              <Image
                src={avatar}
                alt="Community member"
                width={40}
                height={40}
                className="rounded-full border-[2px] border-white object-cover shadow-lg"
              />
            </motion.div>
          ))}
        </div>

        {/* Text */}
        <div>
          <h3 className="text-base font-bold text-[#2F1734]">
            <span className="text-[#6B1E5B]">12,500+</span> Odias Joined
          </h3>
          <p className="text-sm text-[#6C6C74]">
            Noida, Chennai, Bangalore, Kolkata & more.
          </p>
        </div>
      </div>
    </motion.div>
  );
}