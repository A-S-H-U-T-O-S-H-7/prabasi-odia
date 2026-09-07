// components/web/join-community/step1/PersonalDetails.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const [year, month, day] = dob.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
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
  const { register, watch, setValue, formState: { errors, touchedFields } } = useFormContext();
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);

  const watchDob = watch("dob");
  const [savedYear = '', savedMonth = '', savedDay = ''] = String(watchDob || '').split('-');
  const dobYear = String(watch('dobYear') ?? savedYear);
  const dobMonth = String(watch('dobMonth') ?? savedMonth);
  const dobDay = String(watch('dobDay') ?? savedDay);
  const latestYear = new Date().getFullYear() - 18;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = dobMonth ? new Date(Number(dobYear) || 2000, Number(dobMonth), 0).getDate() : 31;

  const changeDob = (part: 'day' | 'month' | 'year', value: string) => {
    const year = part === 'year' ? value : dobYear;
    const month = part === 'month' ? value : dobMonth;
    let day = part === 'day' ? value : dobDay;
    // Reset an invalid day instead of rolling February 31 into March.
    const maxDay = month ? new Date(Number(year) || 2000, Number(month), 0).getDate() : 31;
    if (Number(day) > maxDay) day = '';
    setValue('dobYear', year, { shouldDirty: true });
    setValue('dobMonth', month, { shouldDirty: true });
    setValue('dobDay', day, { shouldDirty: true });
    setValue('dob', year && month && day ? `${year}-${month}-${day}` : '', { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

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
    w-full px-3 py-2.5 rounded-xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2 sm:px-4 sm:py-3 sm:rounded-2xl
    ${shouldShowError(name) ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}
  `;

  const FieldHint = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-5 mt-1" aria-live="polite">
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Full Name and Date of Birth */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-2">
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

      <div className="col-span-2 lg:col-span-1">
        <fieldset>
        <legend className="block text-sm font-medium text-[#2A1636] mb-2">
          Date of Birth <span className="text-red-400">*</span>
        </legend>
        <input type="hidden" {...register('dob')} />
        <div className="grid grid-cols-[0.8fr_1.3fr_1fr] gap-2">
          <select aria-label="Birth day" aria-required="true" aria-invalid={shouldShowError('dob')} value={dobDay} onChange={(event) => changeDob('day', event.target.value)} className={`${inputClass('dob')} min-w-0 cursor-pointer`}>
            <option value="">Day</option>
            {Array.from({ length: daysInMonth }, (_, index) => String(index + 1).padStart(2, '0')).map((day) => <option key={day} value={day}>{Number(day)}</option>)}
          </select>
          <select aria-label="Birth month" aria-required="true" aria-invalid={shouldShowError('dob')} value={dobMonth} onChange={(event) => changeDob('month', event.target.value)} className={`${inputClass('dob')} min-w-0 cursor-pointer`}>
            <option value="">Month</option>
            {months.map((month, index) => <option key={month} value={String(index + 1).padStart(2, '0')}>{month}</option>)}
          </select>
          <select aria-label="Birth year" aria-required="true" aria-invalid={shouldShowError('dob')} value={dobYear} onChange={(event) => changeDob('year', event.target.value)} className={`${inputClass('dob')} min-w-0 cursor-pointer`}>
            <option value="">Year</option>
            {Array.from({ length: latestYear - 1900 + 1 }, (_, index) => latestYear - index).map((year) => <option key={year} value={String(year)}>{year}</option>)}
          </select>
        </div>
        </fieldset>
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

      <div className="col-span-2 lg:col-span-1">
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

      </div>

      {/* Blood Group + Occupation */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
            <Briefcase className="absolute left-4 top-1/2 hidden -translate-y-1/2 h-4 w-4 text-[#6B5E5A]/40 sm:block" />
            <input {...register("occupation")} className={`${inputClass("occupation")} sm:pl-12`} placeholder="Your profession / job title" />
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
