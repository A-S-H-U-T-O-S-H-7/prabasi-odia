// components/web/join-community/Step1Personal.tsx
"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import { isIndianCountryCode } from "@/lib/mobileVerification";

import ProfilePhotoUpload from "./step1/ProfilePhotoUpload";
import PersonalDetails from "./step1/PersonalDetails";
import ContactVerification from "./step1/ContactVerification";
import Step3Interests from "./Step3Interests";

interface Step1PersonalProps {
  onNext: () => void;
}

const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function Step1Personal({ onNext }: Step1PersonalProps) {
  const { getValues, trigger, watch } = useFormContext();
  const { user } = useAuthStore();
  const loginEmail = String(user?.email || getValues("email") || "").trim();

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const mobileVerified = watch("mobileVerified");
  const emailVerified = watch("emailVerified");

  useEffect(() => {
    if (mobileVerified || emailVerified) setVerificationError("");
  }, [mobileVerified, emailVerified]);
  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    setVerificationError("");

    // Check age from DOB
    const dob = getValues("dob");
    if (dob) {
      const age = calculateAge(dob);
      if (age < 18) {
        toast.error("You must be at least 18 years old to join");
        return;
      }
    }

    const fieldsToValidate = ["fullName", "dob", "gender", "bloodGroup", "mobileNumber", "mobileCountryCode", "photo", "occupation"];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const countryCode = String(getValues("mobileCountryCode") || "");
    const indianNumber = isIndianCountryCode(countryCode);
    
    let contactVerified = false;

    if (indianNumber) {
      // ✅ FIX: Normalize both numbers for comparison
      // ContactVerification resets this flag whenever the phone number changes.
      // This avoids showing a stale error after a successfully verified OTP.
      contactVerified = Boolean(getValues("mobileVerified"));
    } else {
      contactVerified = Boolean(getValues("emailVerified")) &&
        String(getValues("verifiedEmail") || "").toLowerCase() === loginEmail.toLowerCase();
    }

    if (!contactVerified) {
      const message = !indianNumber && !loginEmail
        ? "No email is linked to your account. Please login with email or Google."
        : indianNumber
          ? "Please verify your mobile number first"
          : "Please verify the OTP sent to your email first";
      toast.error(message);
      setVerificationError(message);
      return;
    }

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-3 sm:space-y-5 md:space-y-6"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">Personal & Identity Details</h2>
          <p className="text-sm text-[#6B5E5A]">Tell us about yourself and verify your identity</p>
        </div>
      </div>

      <ProfilePhotoUpload hasAttemptedSubmit={hasAttemptedSubmit} />
      <PersonalDetails hasAttemptedSubmit={hasAttemptedSubmit} setHasAttemptedSubmit={setHasAttemptedSubmit} />
      <ContactVerification loginEmail={loginEmail} />
      {verificationError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:px-4 sm:py-3">
          {verificationError}
        </div>
      )}
      <Step3Interests compact onNext={handleNext} />
    </motion.div>
  );
}
