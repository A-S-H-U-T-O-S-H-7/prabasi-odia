"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Heart, Users, Droplet, Handshake, Sparkles, GraduationCap, Network, AlertCircle, Check, Shield, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FaPassport } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

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
  const [hasAadhar, setHasAadhar] = useState<"yes" | "no" | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  
  const selectedInterests = watch("interests") || [];
  const aadharNumber = watch("aadharNumber") || "";
  const passportNumber = watch("passportNumber") || "";
  const mobileNumber = watch("mobileNumber") || "";
  const email = watch("email") || "";

  const shouldShowError = (name: string) => Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const checkDuplicate = async (field: string, value: string): Promise<boolean> => {
    if (!value || value.length === 0) return false;
    
    try {
      const q = query(collection(db, 'users'), where(field, '==', value));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error(`Error checking duplicate ${field}:`, error);
      return false;
    }
  };

  const toggleInterest = (id: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
    setValue("interests", updated, { shouldValidate: true });
    setVerificationError(null);
  };

  const handleHasAadhar = (value: "yes" | "no") => {
    setHasAadhar(value);
    if (value === "yes") {
      setValue("passportNumber", "");
    } else {
      setValue("aadharNumber", "");
    }
    setVerificationError(null);
    // Clear any existing errors for the other field
    if (value === "yes") {
      setValue("passportNumber", "");
    } else {
      setValue("aadharNumber", "");
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

    // ✅ 1. Check if at least 2 interests are selected
    if ((selectedInterests || []).length < 2) {
      setValue("interests", selectedInterests, { shouldValidate: true });
      toast.error("Please select at least 2 interests");
      return;
    }

    // ✅ 2. Check if Aadhar/Passport selection is made
    if (!hasAadhar) {
      toast.error("Please select whether you have Aadhar or Passport");
      return;
    }

    // ✅ 3. Validate Aadhar or Passport number is not empty
    if (hasAadhar === "yes") {
      if (!aadharNumber || aadharNumber.length < 12) {
        toast.error("Please enter a valid 12-digit Aadhar number");
        return;
      }
    } else {
      if (!passportNumber || passportNumber.length < 6) {
        toast.error("Please enter a valid passport number (6-9 characters)");
        return;
      }
    }

    // ✅ 4. Check for duplicates
    setIsCheckingDuplicate(true);
    try {
      if (mobileNumber) {
        const mobileExists = await checkDuplicate('phoneNumber', mobileNumber);
        if (mobileExists) {
          toast.error("This mobile number is already registered with another account");
          setIsCheckingDuplicate(false);
          return;
        }
      }

      if (email) {
        const emailExists = await checkDuplicate('email', email);
        if (emailExists) {
          toast.error("This email is already registered");
          setIsCheckingDuplicate(false);
          return;
        }
      }
    } catch (error) {
      console.error("Duplicate check error:", error);
    }
    setIsCheckingDuplicate(false);

    // ✅ 5. Verify Aadhar or validate Passport
    if (hasAadhar === "yes") {
      // Check duplicate Aadhar
      const aadharExists = await checkDuplicate('aadharNumber', aadharNumber);
      if (aadharExists) {
        toast.error("This Aadhar number is already registered with another account");
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
      // Check duplicate Passport
      const passportExists = await checkDuplicate('passportNumber', passportNumber);
      if (passportExists) {
        toast.error("This passport number is already registered with another account");
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
                className={`text-xs ${selectedInterests.length >= 2 ? "text-green-600" : "text-red-500 font-medium"}`}
              >
                {selectedInterests.length} of minimum 2 selected
                {selectedInterests.length >= 2 ? " ✅" : " ❌ Please select 2 interests"}
              </motion.p>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-medium">
                Please select at least 2 interests
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Do you have Aadhar? Section */}
      <div className="pt-2 border-t border-[#D4C8C0]/20">
        <label className="block text-sm font-medium text-[#2A1636] mb-3">
          Do you have Aadhar? <span className="text-red-400">*</span>
        </label>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleHasAadhar("yes")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
              hasAadhar === "yes"
                ? "border-[#6B1E5B] bg-[#6B1E5B]/5 shadow-md"
                : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#6B1E5B]/30"
            }`}
          >
            <Shield className={`w-5 h-5 ${hasAadhar === "yes" ? "text-[#6B1E5B]" : "text-[#6B5E5A]"}`} />
            <span className={`font-semibold ${hasAadhar === "yes" ? "text-[#6B1E5B]" : "text-[#2A1636]"}`}>Yes</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleHasAadhar("no")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
              hasAadhar === "no"
                ? "border-[#D9772B] bg-[#D9772B]/5 shadow-md"
                : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#D9772B]/30"
            }`}
          >
            <FaPassport className={`w-5 h-5 ${hasAadhar === "no" ? "text-[#D9772B]" : "text-[#6B5E5A]"}`} />
            <span className={`font-semibold ${hasAadhar === "no" ? "text-[#D9772B]" : "text-[#2A1636]"}`}>No</span>
          </motion.button>
        </div>

        {/* Error if no selection */}
        {hasAttemptedSubmit && !hasAadhar && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Please select whether you have Aadhar or Passport
          </p>
        )}
      </div>

      {/* ID Number Input */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {hasAadhar === "yes" ? (
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
                  {/* ✅ Fixed: Show error when Aadhar is required but empty */}
                  {hasAttemptedSubmit && hasAadhar === "yes" && !aadharNumber && !verificationError && !shouldShowError("aadharNumber") && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-start gap-1.5 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Aadhar number is required</span>
                    </motion.div>
                  )}
                  {!verificationError && !shouldShowError("aadharNumber") && aadharNumber.length > 0 && aadharNumber.length < 12 && (
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
                  {!verificationError && !shouldShowError("aadharNumber") && aadharNumber.length === 12 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-1.5"
                    >
                      <p className="text-xs text-green-600">✅ Aadhar number format is valid. Click Next to verify.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : hasAadhar === "no" ? (
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
                    <>
                      {/* ✅ Fixed: Show error when Passport is required but empty */}
                      {hasAttemptedSubmit && hasAadhar === "no" && !passportNumber && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex items-start gap-1.5 text-red-400 text-sm"
                        >
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>Passport number is required</span>
                        </motion.div>
                      )}
                      {!shouldShowError("passportNumber") && passportNumber.length > 0 && passportNumber.length < 6 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-1.5"
                        >
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-600">
                            <span className="font-semibold">Note:</span> Passport number should be 6-9 characters.
                          </p>
                        </motion.div>
                      )}
                      {!shouldShowError("passportNumber") && passportNumber.length >= 6 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-1.5"
                        >
                          <p className="text-xs text-green-600">✅ Passport number format is valid.</p>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
          disabled={isVerifying || isCheckingDuplicate}
          className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isVerifying || isCheckingDuplicate ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isCheckingDuplicate ? "Checking..." : "Verifying..."}
            </>
          ) : (
            'Next →'
          )}
        </button>
      </div>
    </motion.div>
  );
}