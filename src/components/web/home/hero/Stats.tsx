"use client";

import { motion } from "framer-motion";
import {
  HiUsers,
  HiGlobeAlt,
  HiCalendarDays,
  HiHeart,
  HiBuildingOffice2,
} from "react-icons/hi2";

const stats = [
  { icon: HiUsers, value: "25K+", label: "Members" },
  { icon: HiGlobeAlt, value: "50+", label: "Cities" },
  { icon: HiCalendarDays, value: "500+", label: "Events" },
  { icon: HiHeart, value: "1K+", label: "Volunteers" },
  { icon: HiBuildingOffice2, value: "200+", label: "Organizations" },
];

export default function Stats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full py-5"
    >
      <div className="rounded-[20px] border border-white/60  bg-white/80 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,.06)] p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="group flex items-center gap-3 px-3 py-2"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#6B1E5B] text-white shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:shadow-lg">
                  <Icon size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#311530] leading-tight">
                    {item.value}
                  </h2>
                  <p className="text-xs font-medium text-[#6B6B75] leading-tight">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}