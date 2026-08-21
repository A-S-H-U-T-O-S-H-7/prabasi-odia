// components/web/join-community/step1/PersonalDetails.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Calendar, Briefcase, AlertCircle, Check, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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

interface PersonalDetailsProps {
  hasAttemptedSubmit: boolean;
  setHasAttemptedSubmit: (value: boolean) => void;
}

export default function PersonalDetails({ hasAttemptedSubmit, setHasAttemptedSubmit }: PersonalDetailsProps) {
  const { register, watch, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  const watchDob = watch("dob");

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

  const shouldShowError = (fieldName: string) => {
    return Boolean((hasAttemptedSubmit || touchedFields[fieldName]) && errors[fieldName]);
  };

  const inputClass = (name: string) => `
    w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2
    ${shouldShowError(name) ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}
  `;

  const FieldHint = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-5 mt-1" aria-live="polite">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Full Name */}
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

      {/* Date of Birth */}
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

      {/* Gender + Blood Group + Occupation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <select {...register("gender")} className={`${inputClass("gender")} appearance-none cursor-pointer`}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
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
    </div>
  );
}