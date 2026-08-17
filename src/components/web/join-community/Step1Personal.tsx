// components/web/join-community/Step1Personal.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Upload, User, Users, Plus, X, Phone, Calendar, Briefcase, AlertCircle, Check, Globe, Loader2, Mail } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { auth } from "@/lib/firebase/config";
import { isIndianCountryCode, OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/mobileVerification";
import { useAuthStore } from "@/lib/store";

interface FamilyMember {
  id: string;
  name: string;
  dob: string;
  relation: string;
}

interface Step1PersonalProps {
  onNext: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
}

const relations = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother", "Uncle", "Aunt", "Nephew", "Niece", "Cousin", "Other"];

// Clean, deduplicated country codes - no duplicates
const countryCodes = [
  { code: "+91", country: "India" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "Australia" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+977", country: "Nepal" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+64", country: "New Zealand" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+39", country: "Italy" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+82", country: "South Korea" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
  { code: "+234", country: "Nigeria" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
  { code: "+90", country: "Turkey" },
  { code: "+30", country: "Greece" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+34", country: "Spain" },
  { code: "+41", country: "Switzerland" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+48", country: "Poland" },
  { code: "+52", country: "Mexico" },
  { code: "+54", country: "Argentina" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+20", country: "Egypt" },
  { code: "+254", country: "Kenya" },
  { code: "+255", country: "Tanzania" },
  { code: "+256", country: "Uganda" },
];

// Calculate age from DOB
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

export default function Step1Personal({ onNext, onBack, isFirstStep = true }: Step1PersonalProps) {
  const { register, watch, getValues, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const { user } = useAuthStore();
  const loginEmail = String(user?.email || getValues("email") || "").trim();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const savedMembers = getValues("familyMembers") as FamilyMember[] | undefined;
    if (savedMembers?.length) {
      const seen = new Set<string>();
      return savedMembers.map((member, index) => {
        let id = member.id || `family-${index}-${Date.now()}`;
        if (seen.has(id)) {
          id = `family-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        }
        seen.add(id);
        return {
          ...member,
          id,
          name: member.name || "",
          dob: member.dob || "",
          relation: member.relation || "",
        };
      });
    }
    return [{ id: `family-0-${Date.now()}`, name: "", dob: "", relation: "" }];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isVerifyingRef = useRef(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [familyAgeErrors, setFamilyAgeErrors] = useState<Record<string, boolean>>({});
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isMobileVerified, setIsMobileVerified] = useState(() => Boolean(getValues("mobileVerified")));
  const [isEmailVerified, setIsEmailVerified] = useState(() => Boolean(getValues("emailVerified")));

  const watchDob = watch("dob");
  const watchMobileNumber = watch("mobileNumber");
  const watchMobileCountryCode = watch("mobileCountryCode");
  const watchPhoto = watch("photo");
  const isIndianNumber = isIndianCountryCode(watchMobileCountryCode);
  const isContactVerified = isIndianNumber ? isMobileVerified : isEmailVerified;

  // Calculate age and validate 18+ when DOB changes
  useEffect(() => {
    if (watchDob) {
      const age = calculateAge(watchDob);
      setCalculatedAge(age);
      if (age < 18) {
        setAgeError("You must be at least 18 years old to join");
        toast.error("You must be at least 18 years old to join");
      } else {
        setAgeError(null);
      }
    } else {
      setCalculatedAge(null);
      setAgeError(null);
    }
  }, [watchDob]);

  useEffect(() => {
    setValue("familyMembers", familyMembers, { shouldDirty: true });
  }, [familyMembers, setValue]);

  const getPhonePayload = () => {
    const countryCode = String(getValues("mobileCountryCode") || "+91").trim();
    const mobileNumber = String(getValues("mobileNumber") || "").trim();
    return `${countryCode}${mobileNumber}`;
  };

  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const resetVerification = () => {
    setOtpSent(false);
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(null);
    setIsMobileVerified(false);
    setIsEmailVerified(false);
    setValue("mobileVerified", false, { shouldDirty: true });
    setValue("verifiedMobileNumber", "", { shouldDirty: true });
    setValue("emailVerified", false, { shouldDirty: true });
    setValue("verifiedEmail", "", { shouldDirty: true });
  };

  useEffect(() => {
    if (loginEmail) {
      setValue("email", loginEmail, { shouldDirty: false });
    }
  }, [loginEmail, setValue]);

  useEffect(() => {
    const currentPhone = `${watchMobileCountryCode || ""}${watchMobileNumber || ""}`;
    const verifiedPhone = String(getValues("verifiedMobileNumber") || "");
    const verifiedEmail = String(getValues("verifiedEmail") || "");

    if (isIndianNumber) {
      if (isMobileVerified && verifiedPhone && currentPhone === verifiedPhone) return;
      if (otpSent || isMobileVerified || isEmailVerified) resetVerification();
      return;
    }

    if (isEmailVerified && verifiedEmail && verifiedEmail === loginEmail.toLowerCase()) return;
    if (otpSent || isEmailVerified || isMobileVerified) resetVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchMobileCountryCode, loginEmail]);

  useEffect(() => {
    if (!isIndianNumber) return;
    const currentPhone = `${watchMobileCountryCode || ""}${watchMobileNumber || ""}`;
    const verifiedPhone = String(getValues("verifiedMobileNumber") || "");
    if (isMobileVerified && verifiedPhone && currentPhone === verifiedPhone) return;
    if (otpSent || isMobileVerified) resetVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchMobileNumber]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (isIndianNumber) {
      const isPhoneValid = await trigger(["mobileNumber", "mobileCountryCode"]);
      if (!isPhoneValid) {
        toast.error("Enter a valid mobile number before requesting OTP");
        return;
      }
    } else if (!loginEmail) {
      toast.error("No email is linked to your account. Please login with email or Google.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers,
        body: JSON.stringify(
          isIndianNumber
            ? { channel: "sms", phone: getPhonePayload() }
            : {
                channel: "email",
                email: loginEmail,
                name: String(getValues("fullName") || user?.displayName || "").trim(),
              }
        ),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send OTP");
      }

      setOtpSent(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      toast.success(data.message || (isIndianNumber ? "OTP sent successfully" : "OTP sent to your email"));
      window.setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send OTP";
      setOtpError(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const otp = (otpValue ?? otpDigits.join("")).trim();
    if (!/^\d{6}$/.test(otp) || isVerifyingRef.current) {
      if (!/^\d{6}$/.test(otp)) setOtpError("Enter the 6-digit OTP");
      return;
    }

    isVerifyingRef.current = true;
    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers,
        body: JSON.stringify(
          isIndianNumber
            ? { channel: "sms", phone: getPhonePayload(), otp }
            : { channel: "email", email: loginEmail, otp }
        ),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      if (isIndianNumber) {
        setIsMobileVerified(true);
        setValue("mobileVerified", true, { shouldDirty: true });
        setValue("verifiedMobileNumber", getPhonePayload(), { shouldDirty: true });
        toast.success(data.message || "Mobile number verified successfully");
      } else {
        setIsEmailVerified(true);
        setValue("emailVerified", true, { shouldDirty: true });
        setValue("verifiedEmail", loginEmail.toLowerCase(), { shouldDirty: true });
        toast.success(data.message || "Email verified successfully");
      }
      setOtpError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to verify OTP";
      if (isIndianNumber) setIsMobileVerified(false);
      else setIsEmailVerified(false);
      setOtpError(message);
      toast.error(message);
    } finally {
      isVerifyingRef.current = false;
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (isContactVerified) return;

    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setOtpError(null);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (nextDigits.every((item) => item.length === 1)) {
      void handleVerifyOtp(nextDigits.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    event.preventDefault();
    const nextDigits = ["", "", "", "", "", ""].map((fallback, index) => pasted[index] || fallback);
    setOtpDigits(nextDigits);
    otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();

    if (pasted.length === 6) {
      void handleVerifyOtp(pasted);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setPhotoError("Please upload a valid image (JPEG, PNG, WEBP)");
        setValue("photo", null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("Image size should be less than 5MB");
        setValue("photo", null);
        return;
      }

      setPhotoError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setValue("photo", file, { shouldValidate: true });
        if (hasAttemptedSubmit || touchedFields.photo) {
          trigger("photo");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: "", dob: "", relation: "" }]);
  };

  const removeFamilyMember = (id: string) => {
    if (familyMembers.length <= 1) return;
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const updateFamilyMember = (id: string, field: string, value: string) => {
    setFamilyMembers(familyMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

    if (field === "dob") {
      const age = calculateAge(value);
      if (age >= 18 && value) {
        setFamilyAgeErrors((prev) => ({ ...prev, [id]: true }));
        toast.error(`Family member is ${age} years old. They need to join separately.`);
      } else {
        setFamilyAgeErrors((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const getFamilyMemberAge = (dob: string): number => calculateAge(dob);

  const handleNext = async () => {
    setHasAttemptedSubmit(true);

    // Check age first
    if (ageError) {
      toast.error("You must be at least 18 years old to join");
      return;
    }

    const adultMembers = familyMembers.filter((m) => {
      const age = getFamilyMemberAge(m.dob);
      return age >= 18 && m.dob && m.name;
    });

    if (adultMembers.length > 0) {
      toast.error(`Family members ${adultMembers.map((m) => m.name).join(", ")} are 18+ and need to join separately.`);
      return;
    }

    const fieldsToValidate = ["fullName", "dob", "gender", "bloodGroup", "mobileNumber", "mobileCountryCode", "photo", "occupation"];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    if (!isContactVerified) {
      const message = !isIndianNumber && !loginEmail
        ? "No email is linked to your account. Please login with email or Google."
        : isIndianNumber
          ? "Please verify your mobile number first"
          : "Please verify the OTP sent to your email first";
      setOtpError(message);
      toast.error(message);
      return;
    }

    onNext();
  };

  const shouldShowError = (fieldName: string) => {
    return Boolean((hasAttemptedSubmit || touchedFields[fieldName]) && errors[fieldName]);
  };

  const FieldHint = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-5 mt-1" aria-live="polite">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  );

  const inputClass = (name: string) => `
    w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2
    ${shouldShowError(name) ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 md:space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">Your Identity & Family</h2>
          <p className="text-sm text-[#6B5E5A]">Tell us about yourself and your family</p>
        </div>
      </div>

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-[#2A1636] mb-2">
          Profile Photo <span className="text-red-400">*</span>
        </label>
        <div className="flex items-start gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-24 h-24 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center bg-gradient-to-br from-white/40 to-[#6B1E5B]/5 hover:from-white/60 hover:to-[#6B1E5B]/10 group flex-shrink-0 ${
              watchPhoto instanceof File
                ? "border-green-500 bg-green-50/30"
                : shouldShowError("photo") || photoError
                ? "border-red-400 bg-red-50/30"
                : "border-[#D4C8C0] hover:border-[#6B1E5B]"
            }`}
          >
            {photoPreview ? (
              <Image src={photoPreview} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="text-center">
                <Upload className="w-6 h-6 text-[#6B5E5A]/40 mx-auto group-hover:text-[#6B1E5B]/60 transition-colors" />
                <p className="text-[10px] text-[#6B5E5A]/40 mt-1">Upload</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </motion.div>

          <div className="flex-1 min-h-24 flex items-center">
            <AnimatePresence mode="wait">
              {(shouldShowError("photo") || photoError) && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-1.5 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{photoError || (errors.photo?.message as string)}</span>
                </motion.div>
              )}
              {watchPhoto instanceof File && !photoError && !errors.photo && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-1.5 text-green-600 text-sm"
                >
                  <Check className="w-4 h-4" /> Photo uploaded
                </motion.div>
              )}
              {!photoPreview && !photoError && !errors.photo && (
                <motion.p key="hint" className="text-xs text-[#6B5E5A]/50">
                  JPEG, PNG or WEBP · up to 5MB
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Row 1: Full Name, Date of Birth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input {...register("fullName")} className={inputClass("fullName")} placeholder="Your full name" />
          <FieldHint>
            {shouldShowError("fullName") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.fullName?.message as string}
              </motion.p>
            )}
          </FieldHint>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input 
              {...register("dob")} 
              type="date" 
              className={`${inputClass("dob")} pl-12`}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
          </div>
          <FieldHint>
            {ageError && (
              <motion.p key="age-error" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {ageError}
              </motion.p>
            )}
            {calculatedAge !== null && !ageError && !shouldShowError("dob") && (
              <motion.p key="age" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-sm text-[#6B5E5A]">
                Age: <span className="font-semibold text-green-600">{calculatedAge} years</span>
              </motion.p>
            )}
            {shouldShowError("dob") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.dob?.message as string}
              </motion.p>
            )}
          </FieldHint>
        </div>
      </div>

      {/* Login Email */}
      <div>
        <label className="block text-sm font-medium text-[#2A1636] mb-2">
          Email ID <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input
              type="email"
              value={loginEmail}
              readOnly
              className={`${inputClass("email")} pl-12 bg-[#F7F3F1]/80 cursor-not-allowed ${isEmailVerified ? "border-green-500" : ""}`}
              placeholder="Login email"
            />
          </div>
          {!isIndianNumber && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendOtp}
              disabled={isSendingOtp || isEmailVerified || resendCooldown > 0 || !loginEmail}
              className={`px-4 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
                isEmailVerified
                  ? "bg-green-600 text-white"
                  : "bg-gradient-to-r from-[#6B1E5B] to-[#8A2E72] text-white shadow-md shadow-[#6B1E5B]/20"
              }`}
            >
              {isSendingOtp ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending
                </span>
              ) : isEmailVerified ? (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Verified
                </span>
              ) : otpSent && resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : otpSent ? (
                "Resend OTP"
              ) : (
                "Send OTP"
              )}
            </motion.button>
          )}
        </div>
        <FieldHint>
          {!loginEmail ? (
            <motion.p key="email-missing" className="text-red-400 text-sm">
              No email is linked to your account. Please login with email or Google.
            </motion.p>
          ) : isEmailVerified ? (
            <motion.div key="email-verified" className="flex items-center gap-1.5 text-green-600 text-sm">
              <Check className="w-3.5 h-3.5" /> Email verified
            </motion.div>
          ) : (
            <motion.p key="email-hint" className="text-xs text-[#6B5E5A]/70">
              {isIndianNumber
                ? "This is the email you logged in with"
                : "OTP will be sent to this email because your number is outside India"}
            </motion.p>
          )}
        </FieldHint>
      </div>

      {/* Row 2: Gender, Country Code, Mobile Number + Send OTP */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.6fr] gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <select {...register("gender")} className={`${inputClass("gender")} appearance-none cursor-pointer`}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <FieldHint>
            {shouldShowError("gender") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.gender?.message as string}
              </motion.p>
            )}
          </FieldHint>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Country Code <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <select
              {...register("mobileCountryCode")}
              className={`${inputClass("mobileCountryCode")} pl-12 appearance-none cursor-pointer`}
            >
              <option value="">Select Country</option>
              {countryCodes.map(({ code, country }) => (
                <option key={code} value={code}>{code} ({country})</option>
              ))}
            </select>
          </div>
          <FieldHint>
            {shouldShowError("mobileCountryCode") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.mobileCountryCode?.message as string}
              </motion.p>
            )}
          </FieldHint>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Mobile Number <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                type="tel"
                value={watchMobileNumber || ""}
                className={`${inputClass("mobileNumber")} pl-12 ${isMobileVerified ? "border-green-500" : ""}`}
                placeholder="Enter mobile number"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                  setValue("mobileNumber", value);
                  if (hasAttemptedSubmit || touchedFields.mobileNumber) {
                    trigger("mobileNumber");
                  }
                }}
              />
            </div>
            {isIndianNumber && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendOtp}
                disabled={isSendingOtp || isMobileVerified || resendCooldown > 0}
                className={`px-4 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${
                  isMobileVerified
                    ? "bg-green-600 text-white"
                    : "bg-gradient-to-r from-[#6B1E5B] to-[#8A2E72] text-white shadow-md shadow-[#6B1E5B]/20"
                }`}
              >
                {isSendingOtp ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending
                  </span>
                ) : isMobileVerified ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Verified
                  </span>
                ) : otpSent && resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : otpSent ? (
                  "Resend OTP"
                ) : (
                  "Send OTP"
                )}
              </motion.button>
            )}
          </div>
          <FieldHint>
            {shouldShowError("mobileNumber") ? (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.mobileNumber?.message as string}
              </motion.p>
            ) : isMobileVerified ? (
              <motion.div key="verified" className="flex items-center gap-1.5 text-green-600 text-sm">
                <Check className="w-3.5 h-3.5" /> Mobile number verified
              </motion.div>
            ) : (
              <motion.div key="hint" className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-[10px] text-amber-600">
                  {isIndianNumber
                    ? "OTP will be sent to this Indian mobile number"
                    : "Outside India numbers are verified by email OTP"}
                </p>
              </motion.div>
            )}
          </FieldHint>
        </div>
      </div>

      <AnimatePresence>
        {otpSent && !isContactVerified && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl border border-[#D4C8C0]/40 bg-white/60 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-1">
                Enter 6-digit OTP <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-[#6B5E5A]">
                {isIndianNumber
                  ? "OTP has been sent to your mobile number"
                  : `OTP has been sent to ${loginEmail}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    otpInputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpDigitChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={handleOtpPaste}
                  className="w-11 h-12 sm:w-12 sm:h-12 text-center text-lg font-semibold rounded-xl border border-[#D4C8C0]/50 bg-white/80 text-[#2A1636] outline-none focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20"
                />
              ))}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerifyOtp()}
                disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                className="px-4 py-3 rounded-xl bg-[#6B1E5B] text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </motion.button>
            </div>
            {otpError && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {otpError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hasAttemptedSubmit && !isContactVerified && !otpSent && (
        <p className="text-red-400 text-sm flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {isIndianNumber
            ? "Please verify your mobile number first"
            : "Please verify the OTP sent to your email first"}
        </p>
      )}

      {/* Row 3: Blood Group, Occupation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Blood Group <span className="text-red-400">*</span>
          </label>
          <select {...register("bloodGroup")} className={`${inputClass("bloodGroup")} appearance-none cursor-pointer`}>
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          <FieldHint>
            {shouldShowError("bloodGroup") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.bloodGroup?.message as string}
              </motion.p>
            )}
          </FieldHint>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Occupation <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input {...register("occupation")} className={`${inputClass("occupation")} pl-12`} placeholder="Your profession / job title" />
          </div>
          <FieldHint>
            {shouldShowError("occupation") && (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.occupation?.message as string}
              </motion.p>
            )}
          </FieldHint>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="pt-4 border-t border-[#D4C8C0]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6B1E5B]/10 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#6B1E5B]" />
            </div>
            <h3 className="text-sm font-semibold text-[#2A1636]">Family Members</h3>
            <span className="text-xs text-[#6B5E5A]">(Optional)</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addFamilyMember}
            className="flex items-center gap-1.5 text-sm text-[#6B1E5B] hover:text-[#531547] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add
          </motion.button>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {familyMembers.map((member, index) => {
              const age = getFamilyMemberAge(member.dob);
              const isAdult = age >= 18 && !!member.dob;
              const memberKey = member.id || `family-fallback-${index}`;

              return (
                <motion.div
                  key={memberKey}
                  layout
                  initial={{ opacity: 0, y: 8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/60 border border-[#D4C8C0]/30 overflow-hidden"
                >
                  <input
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(memberKey, "name", e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                  />
                  <div>
                    <input
                      type="date"
                      placeholder="DOB"
                      value={member.dob}
                      onChange={(e) => updateFamilyMember(memberKey, "dob", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                    />
                    <div className="min-h-4 mt-1">
                      {member.dob && (
                        <p className={`text-[10px] flex items-center gap-1 ${isAdult ? "text-red-500" : "text-green-500"}`}>
                          {isAdult ? (
                            <>
                              <AlertCircle className="w-3 h-3" /> {age} yrs - must join separately
                            </>
                          ) : (
                            `${age} yrs`
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <select
                    value={member.relation}
                    onChange={(e) => updateFamilyMember(memberKey, "relation", e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm appearance-none h-fit"
                  >
                    <option value="">Relation</option>
                    {relations.map((relation) => (
                      <option key={relation} value={relation}>
                        {relation}
                      </option>
                    ))}
                  </select>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(memberKey)}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-[#D4C8C0]/40 text-[#6B5E5A] hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        <p className="text-[10px] text-[#6B5E5A] mt-2">Family members under 18 can be added. Members 18+ need to join separately.</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20 mt-6">
        {!isFirstStep ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer">
            ← Back
          </motion.button>
        ) : (
          <div />
        )}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-medium shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 cursor-pointer">
          Next →
        </motion.button>
      </div>
    </motion.div>
  );
}