"use client";

import { motion } from "framer-motion";
import { UserPlus, ShieldCheck, Users } from "lucide-react";

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
    <section className="py-10 px-4 bg-[#FFF9F2]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-[#6B1E5B] bg-[#6B1E5B]/10 px-4 py-1.5 rounded-full">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2A1636] mt-4">
            Join in <span className="text-[#6B1E5B]">3 Simple Steps</span>
          </h2>
          <p className="text-[#6B5E5A] mt-2 max-w-2xl mx-auto">
            Getting started is quick and easy. Here's how you can become a part of the Prabasi Odia community.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#6B1E5B] via-[#D9772B] to-[#059669] -translate-y-1/2" />

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
                <div className={`text-5xl font-bold text-[#E7D7E8] select-none absolute -top-4 right-4 md:right-8`}>
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
    </section>
  );
}