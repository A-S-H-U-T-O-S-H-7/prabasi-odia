"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Heart, Users, Droplet, Handshake, Sparkles, GraduationCap, Network, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Step3InterestsProps {
  onNext: () => void;
  onBack: () => void;
}

const interestOptions = [
  { id: "volunteering", label: "Volunteering", icon: Heart, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "bloodDonation", label: "Blood Donation", icon: Droplet, color: "bg-red-100 text-red-700 border-red-200" },
  { id: "jobHelp", label: "Job Help / Referrals", icon: Handshake, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "socialAwareness", label: "Social Awareness", icon: Sparkles, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "cleanlinessDrives", label: "Cleanliness Drives", icon: Users, color: "bg-green-100 text-green-700 border-green-200" },
  { id: "culturalEvents", label: "Cultural Events", icon: Sparkles, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "mentorship", label: "Mentorship", icon: GraduationCap, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "startupNetworking", label: "Startup Networking", icon: Network, color: "bg-teal-100 text-teal-700 border-teal-200" },
];

// Aadhar numbers never start with 0 or 1
const sanitizeAadhar = (raw: string, previous: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (digits.length === 0) return "";
  if (/^[01]/.test(digits)) return previous;
  return digits;
};

export default function Step3Interests({ onNext, onBack }: Step3InterestsProps) {
  const { register, watch, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const selectedInterests = watch("interests") || [];
  const aadharNumber = watch("aadharNumber") || "";

  const shouldShowError = (name: string) => Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const toggleInterest = (id: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
    setValue("interests", updated, { shouldValidate: true });
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAadhar(e.target.value, aadharNumber);
    setValue("aadharNumber", sanitized, { shouldValidate: true });
    if (hasAttemptedSubmit || touchedFields.aadharNumber) {
      trigger("aadharNumber");
    }
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    if (await trigger(["interests", "aadharNumber"])) {
      onNext();
    } else {
      toast.error("Please complete all required fields correctly");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 md:space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">💖 Your Passions & Identity</h2>
          <p className="text-sm text-[#6B5E5A]">What drives you? Select at least 2 interests</p>
        </div>
      </div>

      {/* Interests Grid */}
      <div>
        <label className="block text-sm font-medium text-[#2A1636] mb-3">
          I'm interested in... <span className="text-red-400">* (Min 2)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {interestOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedInterests?.includes(option.id) || false;

            return (
              <motion.button
                key={option.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleInterest(option.id)}
                // Fixed height every state - the checkmark is an absolutely
                // positioned overlay so selecting never changes card height.
                className={`relative flex flex-col items-center justify-center gap-2 h-[92px] md:h-[104px] p-3 rounded-2xl border-2 transition-colors duration-300 cursor-pointer ${
                  isSelected ? `${option.color} shadow-md` : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#6B1E5B]/30 hover:bg-white/60"
                }`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? "text-current" : "text-[#6B5E5A]/40"}`} />
                <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isSelected ? "text-current" : "text-[#6B5E5A]"}`}>
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="min-h-6 mt-2">
          <AnimatePresence mode="wait">
            {shouldShowError("interests") ? (
              <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-400 text-sm">
                {errors.interests?.message as string}
              </motion.p>
            ) : selectedInterests.length > 0 ? (
              <motion.p
                key="count"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`text-xs ${selectedInterests.length >= 2 ? "text-green-600" : "text-[#6B5E5A]"}`}
              >
                {selectedInterests.length} of minimum 2 selected
                {selectedInterests.length >= 2 && " ✅"}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Aadhar Number */}
      <div className="pt-2 border-t border-[#D4C8C0]/20">
        <label className="block text-sm font-medium text-[#2A1636] mb-2">
          Aadhar Number <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            value={aadharNumber}
            placeholder="Enter 12-digit Aadhar number"
            className={`w-full px-4 py-3 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 ${
              shouldShowError("aadharNumber")
                ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                : aadharNumber.length === 12
                ? "border-green-400 focus:border-green-400 focus:ring-green-200"
                : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"
            }`}
            onChange={handleAadharChange}
          />
          <AnimatePresence>
            {aadharNumber.length === 12 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm"
              >
                ✅
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-start gap-1.5 mt-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600">
            <span className="font-semibold">Important:</span> 12 digits, and can&apos;t start with 0 or 1. This will be verified by our team.
          </p>
        </div>

        <div className="min-h-5 mt-1">
          <AnimatePresence mode="wait">
            {shouldShowError("aadharNumber") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.aadharNumber?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20 mt-6">
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer">
          ← Back
        </button>
        <button onClick={handleNext} className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02]">
          Next →
        </button>
      </div>
    </motion.div>
  );
}