// components/web/join-community/step1/ContactVerification.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, Globe, Check, Loader2, AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useFormContext } from "react-hook-form";
import { auth } from "@/lib/firebase/config";
import { 
  isIndianCountryCode,
  normalizeIndianPhone,
  OTP_RESEND_COOLDOWN_SECONDS 
} from "@/lib/mobileVerification";

interface ContactVerificationProps {
  loginEmail: string;
}

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

export default function ContactVerification({ loginEmail }: ContactVerificationProps) {
  const { register, watch, getValues, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isMobileVerified, setIsMobileVerified] = useState(() => Boolean(getValues("mobileVerified")));
  const [isEmailVerified, setIsEmailVerified] = useState(() => Boolean(getValues("emailVerified")));
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const isVerifyingRef = useRef(false);

  const watchMobileNumber = watch("mobileNumber");
  const watchMobileCountryCode = watch("mobileCountryCode");
  const isIndianNumber = isIndianCountryCode(watchMobileCountryCode);
  const isContactVerified = isIndianNumber ? isMobileVerified : isEmailVerified;

  // Reset verification when mobile number changes
  useEffect(() => {
    if (!isIndianNumber) return;
    const currentPhone = `${watchMobileCountryCode || ""}${watchMobileNumber || ""}`;
    const verifiedPhone = String(getValues("verifiedMobileNumber") || "");
    if (isMobileVerified && verifiedPhone && currentPhone === verifiedPhone) return;
    if (otpSent || isMobileVerified) resetVerification();
  }, [watchMobileNumber]);

  // Reset verification when country code changes
  useEffect(() => {
    if (isIndianNumber) {
      const currentPhone = `${watchMobileCountryCode || ""}${watchMobileNumber || ""}`;
      const verifiedPhone = String(getValues("verifiedMobileNumber") || "");
      if (isMobileVerified && verifiedPhone && currentPhone === verifiedPhone) return;
      if (otpSent || isMobileVerified || isEmailVerified) resetVerification();
      return;
    }
    if (isEmailVerified && getValues("verifiedEmail") === loginEmail.toLowerCase()) return;
    if (otpSent || isEmailVerified || isMobileVerified) resetVerification();
  }, [watchMobileCountryCode]);

  // Timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

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

  const getPhonePayload = () => {
    const countryCode = String(getValues("mobileCountryCode") || "+91").trim();
    const mobileNumber = String(getValues("mobileNumber") || "").trim();
    return `${countryCode}${mobileNumber}`;
  };

  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("Please sign in again before requesting an OTP");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const requestOtp = async (channel: "sms" | "email") => {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/otp/send", {
      method: "POST",
      headers,
      body: JSON.stringify(
        channel === "sms"
          ? { channel: "sms", phone: getPhonePayload() }
          : {
              channel: "email",
              name: String(getValues("fullName") || "").trim(),
            }
      ),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Unable to send OTP");
    }
    return data;
  };

  const verifyOtp = async (channel: "sms" | "email", otp: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/otp/verify", {
      method: "POST",
      headers,
      body: JSON.stringify(
        channel === "sms"
          ? { channel: "sms", phone: getPhonePayload(), otp }
          : { channel: "email", otp }
      ),
    });
    const data = await response.json().catch(() => null);
    return {
      success: Boolean(response.ok && data?.success),
      message: String(data?.message || ""),
    };
  };

  // ✅ SEND OTP - Handles both SMS and Email
  const handleSendOtp = async () => {
    // Validate based on channel
    if (isIndianNumber) {
      const isPhoneValid = await trigger(["mobileNumber", "mobileCountryCode"]);
      if (!isPhoneValid || !normalizeIndianPhone(getPhonePayload())) {
        toast.error("Enter a valid 10-digit Indian mobile number before requesting OTP");
        return;
      }
    } else if (!loginEmail) {
      toast.error("No email is linked to your account. Please login with email or Google.");
      return;
    }

    setIsSendingOtp(true);
    setOtpError(null);

    try {
      if (isIndianNumber) {
        const data = await requestOtp("sms");
        toast.success(data.message || "OTP sent to your mobile number");
      } else {
        const data = await requestOtp("email");
        toast.success(data.message || "OTP sent to your email");
      }

      setOtpSent(true);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send OTP";
      setOtpError(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ✅ VERIFY OTP - Handles both SMS and Email
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
      const result = isIndianNumber
        ? await verifyOtp("sms", otp)
        : await verifyOtp("email", otp);

      if (!result.success) {
        throw new Error(result.message || "Invalid OTP");
      }

      if (isIndianNumber) {
        setIsMobileVerified(true);
        setValue("mobileVerified", true, { shouldDirty: true, shouldValidate: true });
        setValue("verifiedMobileNumber", getPhonePayload(), { shouldDirty: true });
        toast.success(result.message || "Mobile number verified successfully");
      } else {
        setIsEmailVerified(true);
        setValue("emailVerified", true, { shouldDirty: true, shouldValidate: true });
        setValue("verifiedEmail", loginEmail.toLowerCase(), { shouldDirty: true });
        toast.success(result.message || "Email verified successfully");
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

    // Auto-verify when all 6 digits are entered
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

  const shouldShowError = (name: string) => {
    return Boolean((touchedFields[name]) && errors[name]);
  };

  const inputClass = (name: string) => `
    w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2
    ${shouldShowError(name) ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}
  `;

  return (
    <div className="space-y-4">
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
          {/* ✅ Email OTP Send Button - Only for non-Indian numbers */}
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
        <div className="min-h-5 mt-1">
          {!loginEmail ? (
            <p className="text-red-400 text-sm">No email is linked to your account. Please login with email or Google.</p>
          ) : isEmailVerified ? (
            <div className="flex items-center gap-1.5 text-green-600 text-sm">
              <Check className="w-3.5 h-3.5" /> Email verified
            </div>
          ) : (
            <p className="text-xs text-[#6B5E5A]/70">
              {isIndianNumber
                ? "This is the email you logged in with"
                : "OTP will be sent to this email because your number is outside India"}
            </p>
          )}
        </div>
      </div>

      {/* Country Code + Mobile Number */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-4">
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
          <div className="min-h-5 mt-1">
            {shouldShowError("mobileCountryCode") && (
              <p className="text-red-400 text-sm">{errors.mobileCountryCode?.message as string}</p>
            )}
          </div>
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
                  setValue("mobileNumber", value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            {/* ✅ SMS OTP Send Button - Only for Indian numbers */}
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
          <div className="min-h-5 mt-1">
            {shouldShowError("mobileNumber") ? (
              <p className="text-red-400 text-sm">{errors.mobileNumber?.message as string}</p>
            ) : isMobileVerified ? (
              <div className="flex items-center gap-1.5 text-green-600 text-sm">
                <Check className="w-3.5 h-3.5" /> Mobile number verified
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-[10px] text-amber-600">
                  {isIndianNumber
                    ? "OTP will be sent to this Indian mobile number"
                    : "Outside India numbers are verified by email OTP"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OTP Input Section */}
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

      {touchedFields.mobileNumber && !isContactVerified && !otpSent && (
        <p className="text-red-400 text-sm flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {isIndianNumber
            ? "Please verify your mobile number first"
            : "Please verify the OTP sent to your email first"}
        </p>
      )}
    </div>
  );
}