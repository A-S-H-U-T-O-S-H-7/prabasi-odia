"use client";

import { useState, forwardRef, ReactNode, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FieldError } from "react-hook-form";
import { Check, Eye, EyeOff, User, Mail, Loader2 } from "lucide-react";

// ============================================
// AUTH INPUT COMPONENT
// ============================================
interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: FieldError | string;
  touched?: boolean;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon, error, touched, className = "", onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="relative w-full">
        <div className={`relative w-full transition-all duration-300 rounded-2xl border ${error && touched ? 'border-red-400/70 bg-red-900/20' : isFocused ? 'border-[#E8B84C]/80 bg-white/15' : 'border-white/20 bg-white/10'} shadow-sm`}>
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E8B84C] z-10">{icon}</div>}
          <input
            ref={ref}
            {...props}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            className={`w-full bg-transparent text-white font-medium outline-none placeholder:text-white/50 pt-6 pb-2 px-4 ${icon ? 'pl-12' : 'pl-4'} ${className}`}
            placeholder={label}
          />
          {error && touched && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
        </div>
        {error && touched && <p className="text-red-300/90 text-sm font-medium pl-1 mt-1">{errorMessage}</p>}
      </div>
    );
  }
);
AuthInput.displayName = 'AuthInput';

// ============================================
// PASSWORD INPUT COMPONENT
// ============================================
interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  label?: string;
  error?: FieldError | string;
  touched?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label = "Password", error, touched, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative w-full">
        <AuthInput
          ref={ref}
          type={showPassword ? "text" : "password"}
          label={label}
          icon={<span className="text-sm">🔒</span>}
          error={error}
          touched={touched}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors p-1 z-10 cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';

// ============================================
// CHECKBOX COMPONENT
// ============================================
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string | ReactNode;
}

const Checkbox = ({ checked, onChange, label }: CheckboxProps) => {
  return (
    <div className="flex items-start gap-3">
      <button type="button" onClick={() => onChange(!checked)} className="relative flex-shrink-0 mt-0.5 cursor-pointer">
        <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${checked ? 'bg-[#E8B84C] border-[#E8B84C]' : 'border-white/50 bg-white/10 hover:border-white/70'}`}>
          {checked && <Check className="w-3.5 h-3.5 text-[#2A1636]" />}
        </div>
      </button>
      {label && <div onClick={() => onChange(!checked)} className="text-sm text-white/90 cursor-pointer hover:text-white transition-colors select-none">{label}</div>}
    </div>
  );
};

// ============================================
// DIVIDER COMPONENT
// ============================================
const Divider = ({ text = "or" }: { text?: string }) => (
  <div className="relative flex items-center gap-4 py-1">
    <div className="flex-1 h-px bg-white/25" />
    <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{text}</span>
    <div className="flex-1 h-px bg-white/25" />
  </div>
);

// ============================================
// GOOGLE BUTTON COMPONENT
// ============================================
interface GoogleButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const GoogleButton = ({ onClick, isLoading = false }: GoogleButtonProps) => (
  <motion.button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="relative w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl text-white font-medium transition-all duration-300 border border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer"
  >
    <div className="absolute inset-0 rounded-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full hover:translate-x-full transition-transform duration-1000" />
    </div>
    {isLoading ? (
      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        <Image src="/google.png" alt="Google" width={20} height={20} className="w-5 h-5 object-contain" />
        <span className="text-white/90">Continue with Google</span>
      </>
    )}
  </motion.button>
);

// ============================================
// GRADIENT BUTTON COMPONENT
// ============================================
interface GradientButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  isLoading?: boolean;
  className?: string;
}

const GradientButton = ({ children, type = "button", isLoading = false, className = "" }: GradientButtonProps) => (
  <motion.button
    type={type}
    disabled={isLoading}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={`relative overflow-hidden w-full px-8 py-4 rounded-2xl font-semibold text-white text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_10px_30px_rgba(107,30,91,0.45)] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] rounded-2xl" />
    <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-[#D89C35]/40 via-white/20 to-[#D89C35]/40 pointer-events-none" />
    <span className="relative z-10 flex items-center justify-center gap-2">
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </span>
  </motion.button>
);

// ============================================
// STRENGTH METER COMPONENT
// ============================================
interface StrengthMeterProps {
  password: string;
  show?: boolean;
}

const StrengthMeter = ({ password, show = false }: StrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback("");
      return;
    }

    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    const strengthMap: Record<number, { label: string }> = {
      0: { label: "Very Weak" },
      1: { label: "Very Weak" },
      2: { label: "Weak" },
      3: { label: "Fair" },
      4: { label: "Good" },
      5: { label: "Strong" },
    };

    setStrength(score);
    setFeedback(strengthMap[score]?.label || "Very Weak");
  }, [password]);

  if (!show || !password) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${level <= strength ? strength <= 2 ? 'bg-red-400' : strength <= 3 ? 'bg-yellow-400' : strength <= 4 ? 'bg-blue-400' : 'bg-green-400' : 'bg-white/20'}`} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-white/70 font-medium">Password Strength: <span className={strength <= 2 ? 'text-red-400' : strength === 3 ? 'text-yellow-400' : strength === 4 ? 'text-blue-400' : strength >= 5 ? 'text-green-400' : ''}>{feedback}</span></p>
        <p className="text-xs text-white/50">{password.length}/8+</p>
      </div>
    </motion.div>
  );
};

// ============================================
// AUTH CARD COMPONENT
// FIX: reduced horizontal padding on mobile
// (p-4 instead of p-6) so the card doesn't feel
// cramped on small screens; scales back up at
// sm/lg breakpoints.
// ============================================
interface AuthCardProps {
  children: ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-[28px] w-full sm:rounded-[36px]"
    >
      <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#F3C97A]/25 blur-[120px]" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-[#6B1E5B]/30 blur-[140px]" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-br from-[#3D1030]/90 via-[#5A1A4C]/88 to-[#2A1636]/92 backdrop-blur-[30px] shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:rounded-[36px]">
        <div className="absolute inset-0 rounded-[28px] p-[1px] bg-gradient-to-br from-[#E8B84C]/30 via-white/10 to-[#D89C35]/30 pointer-events-none sm:rounded-[36px]" />

        <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute right-16 top-12 h-2 w-2 rounded-full bg-[#F2C86A] blur-[1px]" />
        <motion.div animate={{ y: [12, -12, 12] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="absolute left-12 bottom-20 h-3 w-3 rounded-full bg-[#D89C35] blur-[2px]" />
        <motion.div animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute right-28 bottom-12 h-1.5 w-1.5 rounded-full bg-white" />

        <div className="relative z-20 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </motion.div>
  );
};

// ============================================
// MAIN SIGNUP FORM - EXPORT DEFAULT
// ============================================
interface SignupFormProps {
  register: any;
  handleSubmit: any;
  errors: any;
  touchedFields: any;
  password: string;
  agreeTerms: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  onSubmit: (data: any) => void;
  onGoogleSignup: () => void;
}

export default function SignupForm({
  register,
  handleSubmit,
  errors,
  touchedFields,
  password,
  agreeTerms,
  isLoading,
  isGoogleLoading,
  onSubmit,
  onGoogleSignup,
}: SignupFormProps) {
  return (
    <AuthCard>
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-sm text-white/70">Join the global Odia community</p>
        </div>

        <GoogleButton onClick={onGoogleSignup} isLoading={isGoogleLoading} />
        <Divider text="or sign up with email" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput label="Full Name" icon={<User className="w-4 h-4" />} error={errors.name} touched={touchedFields.name} {...register("name")} />
          <AuthInput label="Email Address" icon={<Mail className="w-4 h-4" />} type="email" error={errors.email} touched={touchedFields.email} {...register("email")} />

          {/* Password & Confirm Password: stacked on very small screens, side-by-side from sm up */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PasswordInput label="Password" error={errors.password} touched={touchedFields.password} {...register("password")} />
            <PasswordInput label="Confirm" error={errors.confirmPassword} touched={touchedFields.confirmPassword} {...register("confirmPassword")} />
          </div>

          <StrengthMeter password={password || ""} show={!!password} />

          <div className="pt-1">
            <Checkbox
              checked={agreeTerms}
              onChange={(checked) => {
                register("agreeTerms").onChange({
                  target: { name: "agreeTerms", value: checked },
                });
              }}
              label={
                <span className="text-white/90">
                  I agree to the <Link href="/terms" className="text-[#E8B84C] hover:text-[#F3C97A] transition-colors">Terms of Service</Link> and <Link href="/privacy" className="text-[#E8B84C] hover:text-[#F3C97A] transition-colors">Privacy Policy</Link>
                </span>
              }
            />
            {errors.agreeTerms && <p className="text-red-400/90 text-sm mt-1">{errors.agreeTerms.message}</p>}
          </div>

          <GradientButton type="submit" isLoading={isLoading} className="mt-1">
            Create Account →
          </GradientButton>
        </form>

        <p className="text-center text-sm text-white/70">
          Already have an account? <Link href="/login" className="text-[#E8B84C] hover:text-[#F3C97A] transition-colors font-medium">Sign In</Link>
        </p>
      </div>
    </AuthCard>
  );
}