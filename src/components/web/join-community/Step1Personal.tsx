// components/web/join-community/Step1Personal.tsx
"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/lib/store";
import { isResidencyContactVerified, residencyLabels, type JoinResidencyStatus, type ResidencyStatus } from "@/lib/residency";

import ProfilePhotoUpload from "./step1/ProfilePhotoUpload";
import PersonalDetails from "./step1/PersonalDetails";
import ContactVerification from "./step1/ContactVerification";
import Step1IdentitySection from "./Step1IdentitySection";
import { useJoinFormSupport } from "./JoinFormSupport";

interface Step1PersonalProps {
  onNext: () => void;
  onChangeType: () => void;
  accountType: JoinResidencyStatus;
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

export default function Step1Personal({ onNext, onChangeType, accountType }: Step1PersonalProps) {
  const support = useJoinFormSupport();
  const { getValues, setValue, trigger, watch } = useFormContext();
  const { user } = useAuthStore();
  const loginEmail = String(watch("email") || user?.email || "").trim();

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const residencyStatus = accountType;
  const mobileVerified = watch("mobileVerified");
  const emailVerified = watch("emailVerified");

  useEffect(() => {
    if (getValues('residencyStatus') !== accountType) {
      setValue('residencyStatus', accountType, { shouldValidate: true });
    }
  }, [accountType, getValues, setValue]);

  useEffect(() => {
    setVerificationError("");
  }, [mobileVerified, emailVerified, residencyStatus]);
  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    setVerificationError("");

    // Check age from DOB
    const dob = getValues("dob");
    if (dob) {
      const age = calculateAge(dob);
      if (age < 18) {
        toast.error("You must be at least 18 years old to join");
        support.recordNextFailure();
        return;
      }
    }

    const fieldsToValidate = [
      "residencyStatus", "email", "fullName", "dob", "gender", "mobileNumber", "mobileCountryCode", "photo",
      ...(residencyStatus === 'RO' ? [] : ["bloodGroup", "profession", "doctorSpecialization", "otherProfession"]),
    ];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      support.recordNextFailure();
      return;
    }

    const isResidentIndian = accountType === "RI";
    const contactVerified = isResidencyContactVerified({
      ...getValues(),
      residencyStatus: accountType,
    });

    if (!contactVerified) {
      const message = !isResidentIndian && !loginEmail
        ? "Enter your email address before requesting an email OTP"
        : isResidentIndian
          ? "Please verify your mobile number first"
          : "Please verify the OTP sent to your email first";
      toast.error(message);
      setVerificationError(message);
      support.recordNextFailure();
      return;
    }

    support.resetNextFailures();
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
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#6B1E5B]/15 bg-[#6B1E5B]/5 px-3 py-2.5 text-sm sm:px-4">
        <span className="font-semibold text-[#2A1636]">Joining as {residencyLabels[residencyStatus as ResidencyStatus]}</span>
        <button type="button" onClick={onChangeType} className="font-semibold text-[#6B1E5B] underline underline-offset-2">Change</button>
      </div>
      <ProfilePhotoUpload hasAttemptedSubmit={hasAttemptedSubmit} />
      <PersonalDetails hasAttemptedSubmit={hasAttemptedSubmit} setHasAttemptedSubmit={setHasAttemptedSubmit} />
      <ContactVerification loginEmail={loginEmail} verificationChannel={accountType === 'RI' ? 'sms' : 'email'} />
      {verificationError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:px-4 sm:py-3">
          {verificationError}
        </div>
      )}
      <Step1IdentitySection compact onNext={handleNext} />
    </motion.div>
  );
}
