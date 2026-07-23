"use client";

import { motion } from "framer-motion";
import {
  HiUsers,
  HiGlobeAlt,
  HiCalendarDays,
  HiBuildingOffice2,
} from "react-icons/hi2";

const stats = [
  { 
    icon: HiUsers, 
    value: "25K+", 
    label: "Members", 
    iconColor: "text-[#6B1E5B]", 
    bgColor: "bg-[#6B1E5B]/10" 
  },
  { 
    icon: HiGlobeAlt, 
    value: "50+", 
    label: "Cities", 
    iconColor: "text-[#7C3AED]", 
    bgColor: "bg-[#7C3AED]/10" 
  },
  { 
    icon: HiCalendarDays, 
    value: "500+", 
    label: "Events", 
    iconColor: "text-[#D9772B]", 
    bgColor: "bg-[#D9772B]/10" 
  },
  { 
    icon: HiBuildingOffice2, 
    value: "200+", 
    label: "Organizations", 
    iconColor: "text-[#0EA5E9]", 
    bgColor: "bg-[#0EA5E9]/10" 
  },
];

export default function Stats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full py-3 sm:py-5"
    >
      <div className="rounded-[16px] sm:rounded-[20px] border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,.06)] p-3 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="group flex items-center gap-2 sm:gap-3 px-1 sm:px-3 py-1.5 sm:py-2"
              >
                <div className={`flex h-9 w-9 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl ${item.bgColor} shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:shadow-lg`}>
                  <Icon className={`${item.iconColor} text-base sm:text-2xl`} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-xl font-extrabold text-[#311530] leading-tight">
                    {item.value}
                  </h2>
                  <p className="text-[8px] sm:text-xs font-medium text-[#6B6B75] leading-tight">
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