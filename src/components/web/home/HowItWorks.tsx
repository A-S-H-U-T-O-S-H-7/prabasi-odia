"use client";

import { motion } from "framer-motion";
import { UserPlus, ShieldCheck, Users, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account and join the Prabasi Odia community.",
    color: "from-[#6B1E5B] to-[#8A2E72]",
    number: "01",
  },
  {
    icon: ShieldCheck,
    title: "Get Verified",
    description: "Complete your profile and verify your identity to build trust.",
    color: "from-[#D9772B] to-[#E6A11C]",
    number: "02",
  },
  {
    icon: Users,
    title: "Connect",
    description: "Join communities, attend events, and connect with Odias near you.",
    color: "from-[#059669] to-[#0EA5E9]",
    number: "03",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-8 md:py-10 px-4 bg-gradient-to-b from-[#FFF9F2] via-[#FDE8D0]/10 to-[#FFF9F2]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-3 md:mt-4">
            Join in <span className="text-[#6B1E5B]">3 Simple Steps</span>
          </h2>
          <p className="text-[#6B5E5A] mt-2 max-w-2xl mx-auto text-sm md:text-base">
            Getting started is quick and easy. Here's how you can become a part of the Prabasi Odia community.
          </p>
        </motion.div>

        {/* ========== DESKTOP VIEW (3 Columns) ========== */}
        <div className="hidden md:block relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-[#059669] -translate-y-1/2" />

          <div className="grid grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step Number */}
                  <div className="text-5xl font-bold text-[#E7D7E8] select-none absolute -top-4 right-8">
                    {step.number}
                  </div>

                  {/* Icon Circle */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg mb-5 relative z-10`}>
                    <Icon className="w-9 h-9 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-[#2A1636]">{step.title}</h3>
                  <p className="text-[#6B5E5A] mt-2 max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========== MOBILE VIEW (Timeline) ========== */}
        <div className="md:hidden relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6B1E5B] via-[#D9772B] to-[#059669] opacity-20" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative flex items-start gap-4 mb-8 last:mb-0"
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-[#FFF9F2] border-2 border-[#E7D7E8] flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-[#6B1E5B]">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7D7E8]/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B5E5A]/60">
                        Step {index + 1}
                      </span>
                      <h3 className="text-base font-bold text-[#2A1636] leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs text-[#6B5E5A] leading-relaxed pl-13">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}