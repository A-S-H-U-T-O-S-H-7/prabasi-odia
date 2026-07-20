"use client";

import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Briefcase, Heart, Users, Droplet, Handshake, Sparkles, GraduationCap, Network, Building } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface Step3InterestsProps {
  onNext: () => void;
  onBack: () => void;
}

const interestOptions = [
  { id: "volunteering", label: "Volunteering", icon: Heart, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "bloodDonation", label: "Blood Donation", icon: Droplet, color: "bg-red-100 text-red-700 border-red-200" },
  { id: "jobHelp", label: "Job Help / Referrals", icon: Briefcase, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "socialAwareness", label: "Social Awareness", icon: Sparkles, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "cleanlinessDrives", label: "Cleanliness Drives", icon: Users, color: "bg-green-100 text-green-700 border-green-200" },
  { id: "culturalEvents", label: "Cultural Events", icon: Handshake, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "mentorship", label: "Mentorship", icon: GraduationCap, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "startupNetworking", label: "Startup Networking", icon: Network, color: "bg-teal-100 text-teal-700 border-teal-200" },
];

export default function Step3Interests({ onNext, onBack }: Step3InterestsProps) {
  const { register, watch, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const selectedInterests = watch("interests") || [];
  const occupation = watch("occupation");
  const organization = watch("organization");

  const shouldShowError = (name: string) =>
    Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const toggleInterest = (id: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(id)
      ? current.filter((i: string) => i !== id)
      : [...current, id];
    setValue("interests", updated, { shouldValidate: true });
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    if (await trigger(["interests", "occupation", "organization"])) {
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
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">💖 Your Passions</h2>
          <p className="text-sm text-[#6B5E5A]">What drives you? Select at least 2 interests</p>
        </div>
      </div>

      {/* Interests */}
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
                onClick={() => toggleInterest(option.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? `${option.color} shadow-md`
                    : 'border-[#D4C8C0]/30 bg-white/40 hover:border-[#6B1E5B]/30 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? 'text-current' : 'text-[#6B5E5A]/40'}`} />
                <span className={`text-xs font-medium text-center ${isSelected ? 'text-current' : 'text-[#6B5E5A]'}`}>
                  {option.label}
                </span>
                {isSelected && (
                  <span className="text-xs text-green-500">✅</span>
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="min-h-6 mt-2" aria-live="polite">
          {shouldShowError("interests") && (
            <p className="text-red-400 text-sm">{errors.interests?.message as string}</p>
          )}
        </div>
        {selectedInterests.length > 0 && (
          <p className={`text-xs mt-2 ${selectedInterests.length >= 2 ? 'text-green-600' : 'text-[#6B5E5A]'}`}>
            {selectedInterests.length} of minimum 2 selected
            {selectedInterests.length >= 2 && ' ✅'}
          </p>
        )}
      </div>

      {/* Occupation & Organization - MANDATORY */}
      <div className="pt-2 border-t border-[#D4C8C0]/20">
        <p className="text-sm font-medium text-[#2A1636] mb-4">💼 Professional Details <span className="text-red-400">*</span></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Occupation <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                {...register("occupation", { required: "Occupation is required" })}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 cursor-pointer ${shouldShowError("occupation") ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}`}
                placeholder="Your profession / job title"
              />
            </div>
            <div className="min-h-6 mt-1" aria-live="polite">
              {shouldShowError("occupation") && <p className="text-red-400 text-sm">{errors.occupation?.message as string}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Organization <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                {...register("organization", { required: "Organization is required" })}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 cursor-pointer ${shouldShowError("organization") ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}`}
                placeholder="Company / Organization name"
              />
            </div>
            <div className="min-h-6 mt-1" aria-live="polite">
              {shouldShowError("organization") && <p className="text-red-400 text-sm">{errors.organization?.message as string}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20">
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer">
          ← Back
        </button>
        <button 
          onClick={handleNext} 
          className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02]"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
}
