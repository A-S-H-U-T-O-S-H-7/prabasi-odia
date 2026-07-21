"use client";

import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Calendar, 
  Heart, 
  Briefcase, 
  Globe 
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Trustworthy community with verified identity and document authentication.",
    color: "from-[#6B1E5B] to-[#8A2E72]",
  },
  {
    icon: Users,
    title: "City Communities",
    description: "Find and join communities in your city. Connect with Odias near you.",
    color: "from-[#D9772B] to-[#E6A11C]",
  },
  {
    icon: Calendar,
    title: "Events & Festivals",
    description: "Discover cultural events, festivals, and community gatherings.",
    color: "from-[#059669] to-[#0EA5E9]",
  },
  {
    icon: Heart,
    title: "Help Requests",
    description: "Blood donation, volunteering, lost & found — help when it matters.",
    color: "from-[#EC4899] to-[#F59E0B]",
  },
  {
    icon: Briefcase,
    title: "Job Referrals",
    description: "Career opportunities, mentorship, and professional networking.",
    color: "from-[#7C3AED] to-[#14B8A6]",
  },
  {
    icon: Globe,
    title: "Global Connect",
    description: "Connect with Odias across 50+ cities worldwide. One community, limitless connections.",
    color: "from-[#6B1E5B] to-[#D9772B]",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-10 px-4 bg-gradient-to-b from-[#FDE8D0]/20 via-[#FFF9F2] to-[#E7D7E8]/10">
      <div className="max-w-8xl px-5 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
            Everything You Need to <span className="text-[#6B1E5B]">Connect</span>
          </h2>
          <p className="text-[#6B5E5A] mt-2 max-w-2xl mx-auto">
            Prabasi Odia brings together everything you need to stay connected with your community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl border border-[#E7D7E8] p-6 shadow-[0_20px_60px_rgba(107,30,91,0.04)] hover:shadow-[0_20px_60px_rgba(107,30,91,0.12)] transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#2A1636]">{feature.title}</h3>
                <p className="text-sm text-[#6B5E5A] mt-2 leading-relaxed">
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