// components/web/join-community/StepIndicator.tsx
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  // Step labels for better UX
  const stepLabels = [
    "Personal",
    "Address", 
    "Passions",
    "Documents",
    "Review"
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isInactive = step > currentStep;

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.2 : 1 }}
                className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-500 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] shadow-lg shadow-[#6B1E5B]/30' 
                    : isCompleted 
                      ? 'bg-[#6B1E5B]/20 border-2 border-[#6B1E5B]' 
                      : 'bg-white/40 border-2 border-[#D4C8C0] hover:border-[#6B1E5B]/40'
                }`}
                onClick={() => {}} // Will be implemented with navigation
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-[#6B1E5B]" strokeWidth={3} />
                ) : (
                  <span className={`text-sm font-semibold ${
                    isActive ? 'text-white' : isInactive ? 'text-[#6B5E5A]/40' : 'text-[#6B1E5B]'
                  }`}>
                    {step}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="active-glow"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] blur-xl opacity-40 -z-10"
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>
              
              {/* Step Label - Show on larger screens */}
              <span className={`text-[10px] font-medium hidden sm:block ${
                isActive ? 'text-[#6B1E5B]' : isCompleted ? 'text-[#6B5E5A]' : 'text-[#6B5E5A]/40'
              }`}>
                {stepLabels[index] || `Step ${step}`}
              </span>
            </div>
            
            {index < totalSteps - 1 && (
              <motion.div
                initial={false}
                animate={{
                  width: '24px',
                  backgroundColor: isCompleted ? '#6B1E5B' : '#D4C8C0',
                }}
                className="h-0.5 rounded-full transition-all duration-500 sm:w-8"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}