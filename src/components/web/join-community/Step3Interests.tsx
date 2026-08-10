// components/web/join-community/Step3Interests.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Heart, Users, Droplet, Handshake, Sparkles, GraduationCap, Network, AlertCircle, Check, Shield, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaPassport } from "react-icons/fa";

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

export default function Step3Interests({ onNext, onBack }: Step3InterestsProps) {
  const { watch, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [idType, setIdType] = useState<"aadhar" | "passport">(() => watch("idType") || "aadhar");
  
  const selectedInterests = watch("interests") || [];
  const aadharNumber = watch("aadharNumber") || "";
  const passportNumber = watch("passportNumber") || "";

  const shouldShowError = (name: string) => Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const toggleInterest = (id: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
    setValue("interests", updated, { shouldValidate: true });
    setVerificationError(null);
  };

  const handleIdTypeChange = (type: "aadhar" | "passport") => {
    setIdType(type);
    setValue("idType", type);
    setVerificationError(null);
    if (type === "aadhar") {
      setValue("passportNumber", "");
    } else {
      setValue("aadharNumber", "");
    }
    if (touchedFields.aadharNumber) {
      trigger("aadharNumber");
    }
    if (touchedFields.passportNumber) {
      trigger("passportNumber");
    }
  };

  const verifyAadhar = async (aadhar: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/aadhar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadharno: aadhar }),
      });
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Aadhar verification error:', error);
      return false;
    }
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    setVerificationError(null);

    if ((selectedInterests || []).length < 2) {
      toast.error("Please select at least 2 interests");
      return;
    }

    if (idType === "aadhar") {
      const aadharValid = await trigger("aadharNumber");
      if (!aadharValid) {
        toast.error("Please enter a valid 12-digit Aadhar number");
        return;
      }
      
      setIsVerifying(true);
      try {
        const verified = await verifyAadhar(aadharNumber);
        if (!verified) {
          setVerificationError("Aadhar verification failed. Please check your number.");
          toast.error("Aadhar verification failed. Please check your number.");
          return;
        }
        toast.success("Aadhar verified successfully!");
      } catch (error) {
        setVerificationError("Aadhar verification service unavailable. Please try again.");
        toast.error("Aadhar verification service unavailable. Please try again.");
        return;
      } finally {
        setIsVerifying(false);
      }
    } else {
      const passportValid = await trigger("passportNumber");
      if (!passportValid) {
        toast.error("Please enter a valid passport number (6-9 characters)");
        return;
      }
      toast.success("Passport number validated!");
    }

    onNext();
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

      {/* ID Type Tabs - Removed the underline bar */}
      <div className="pt-2 border-t border-[#D4C8C0]/20">
        <label className="block text-sm font-medium text-[#2A1636] mb-3">
          Select ID Type <span className="text-red-400">*</span>
        </label>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleIdTypeChange("aadhar")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 ${
              idType === "aadhar"
                ? "border-[#6B1E5B] bg-[#6B1E5B]/5 shadow-md"
                : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#6B1E5B]/30"
            }`}
          >
            <div className={`p-2 rounded-xl ${idType === "aadhar" ? "bg-[#6B1E5B]/20" : "bg-[#D4C8C0]/20"}`}>
              <Shield className={`w-5 h-5 ${idType === "aadhar" ? "text-[#6B1E5B]" : "text-[#6B5E5A]"}`} />
            </div>
            <div className="text-left">
              <p className={`font-semibold ${idType === "aadhar" ? "text-[#6B1E5B]" : "text-[#2A1636]"}`}>Aadhar</p>
              <p className="text-xs text-[#6B5E5A]">12-digit number</p>
            </div>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleIdTypeChange("passport")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 ${
              idType === "passport"
                ? "border-[#D9772B] bg-[#D9772B]/5 shadow-md"
                : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#D9772B]/30"
            }`}
          >
            <div className={`p-2 rounded-xl ${idType === "passport" ? "bg-[#D9772B]/20" : "bg-[#D4C8C0]/20"}`}>
              <FaPassport className={`w-5 h-5 ${idType === "passport" ? "text-[#D9772B]" : "text-[#6B5E5A]"}`} />
            </div>
            <div className="text-left">
              <p className={`font-semibold ${idType === "passport" ? "text-[#D9772B]" : "text-[#2A1636]"}`}>Passport</p>
              <p className="text-xs text-[#6B5E5A]">6-9 characters</p>
            </div>
          </motion.button>
        </div>

        {/* ID Number Input with fixed height container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {idType === "aadhar" ? (
              <motion.div
                key="aadhar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-[#2A1636] mb-2">
                  Aadhar Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    value={aadharNumber}
                    placeholder="Enter 12-digit Aadhar number"
                    className={`w-full px-4 py-3 pl-12 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 ${
                      verificationError
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : shouldShowError("aadharNumber")
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : aadharNumber.length === 12
                        ? "border-green-400 focus:border-green-400 focus:ring-green-200"
                        : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"
                    }`}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                      setValue("aadharNumber", value);
                      setVerificationError(null);
                      if (hasAttemptedSubmit || touchedFields.aadharNumber) {
                        trigger("aadharNumber");
                      }
                    }}
                  />
                  <AnimatePresence>
                    {isVerifying && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <Loader2 className="w-5 h-5 text-[#6B1E5B] animate-spin" />
                      </motion.div>
                    )}
                    {!isVerifying && aadharNumber.length === 12 && !verificationError && !shouldShowError("aadharNumber") && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold"
                      >
                        ✅
                      </motion.span>
                    )}
                    {verificationError && !isVerifying && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm font-bold"
                      >
                        ✕
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-12 mt-2">
                  <AnimatePresence mode="wait">
                    {verificationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-start gap-1.5 text-red-500 text-sm"
                      >
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{verificationError}</span>
                      </motion.div>
                    )}
                    {shouldShowError("aadharNumber") && !verificationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-start gap-1.5 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{errors.aadharNumber?.message as string}</span>
                      </motion.div>
                    )}
                    {!verificationError && !shouldShowError("aadharNumber") && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-600">
                          <span className="font-semibold">Important:</span> 12 digits, can't start with 0 or 1. Will be verified.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="passport"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-[#2A1636] mb-2">
                  Passport Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FaPassport className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                  <input
                    type="text"
                    value={passportNumber}
                    placeholder="Enter passport number"
                    className={`w-full px-4 py-3 pl-12 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 uppercase ${
                      shouldShowError("passportNumber")
                        ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                        : passportNumber.length >= 6
                        ? "border-green-400 focus:border-green-400 focus:ring-green-200"
                        : "border-[#D4C8C0]/50 focus:border-[#D9772B] focus:ring-[#D9772B]/20"
                    }`}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
                      setValue("passportNumber", value);
                      if (hasAttemptedSubmit || touchedFields.passportNumber) {
                        trigger("passportNumber");
                      }
                    }}
                  />
                  <AnimatePresence>
                    {passportNumber.length >= 6 && !shouldShowError("passportNumber") && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold"
                      >
                        ✅
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-12 mt-2">
                  <AnimatePresence mode="wait">
                    {shouldShowError("passportNumber") ? (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="flex items-start gap-1.5 text-red-400 text-sm"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{errors.passportNumber?.message as string}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-600">
                          <span className="font-semibold">Note:</span> Passport number should be 6-9 characters. Will be verified.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20 mt-6">
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer"
        >
          ← Back
        </button>
        <button 
          onClick={handleNext} 
          disabled={isVerifying}
          className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Next →'
          )}
        </button>
      </div>
    </motion.div>
  );
}