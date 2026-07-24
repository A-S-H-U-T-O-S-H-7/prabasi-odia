"use client";

import { motion } from "framer-motion";
import {
  HiUsers,
  HiMapPin,
  HiHeart,
  HiChartBar,
  HiSparkles,
  HiGlobeAlt,
} from "react-icons/hi2";

const features = [
  {
    icon: HiUsers,
    title: "Connect",
    description: "Find & connect with Odias near you",
    color: "text-[#6B1E5B]",
    bgColor: "bg-gradient-to-br from-[#6B1E5B]/20 to-[#6B1E5B]/5",
  },
  {
    icon: HiMapPin,
    title: "Discover",
    description: "Explore events & cultural festivals",
    color: "text-[#D9772B]",
    bgColor: "bg-gradient-to-br from-[#D9772B]/20 to-[#D9772B]/5",
  },
  {
    icon: HiHeart,
    title: "Give & Get Help",
    description: "Blood donation, volunteering & support",
    color: "text-[#EC4899]",
    bgColor: "bg-gradient-to-br from-[#EC4899]/20 to-[#EC4899]/5",
  },
  {
    icon: HiChartBar,
    title: "Grow Together",
    description: "Career opportunities & networking",
    color: "text-[#059669]",
    bgColor: "bg-gradient-to-br from-[#059669]/20 to-[#059669]/5",
  },
  {
    icon: HiSparkles,
    title: "Celebrate",
    description: "Preserve & celebrate Odia culture",
    color: "text-[#7C3AED]",
    bgColor: "bg-gradient-to-br from-[#7C3AED]/20 to-[#7C3AED]/5",
  },
  {
    icon: HiGlobeAlt,
    title: "Global Reach",
    description: "Connected across 50+ cities worldwide",
    color: "text-[#0EA5E9]",
    bgColor: "bg-gradient-to-br from-[#0EA5E9]/20 to-[#0EA5E9]/5",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-8 md:py-12 px-2 md:px-4 bg-gradient-to-b from-[#F5EDF5] via-[#FFF9F2] to-[#FDF0E8]">
      <div className="max-w-8xl px-2 md:px-5 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-10"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            Why Prabasi Odia
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#2A1636] mt-2">
            More Than Just a <span className="text-[#6B1E5B]">Community</span>
          </h2>
        </motion.div>

        {/* Features - 3 columns on mobile, 6 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center text-center p-3 md:p-4 lg:p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-[0_4px_16px_rgba(107,30,91,0.06)] hover:shadow-[0_8px_30px_rgba(107,30,91,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/80"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-2 md:mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-[0_4px_12px_rgba(0,0,0,0.06)]`}>
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${feature.color}`} />
                </div>

                <h3 className="text-xs md:text-sm font-bold text-[#2A1636]">
                  {feature.title}
                </h3>

                <p className="text-[9px] md:text-[10px] text-[#6B5E5A] mt-0.5 leading-tight">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}