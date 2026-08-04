"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Upload, User, Users, Plus, X, Phone, Calendar, Briefcase, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [familyAgeErrors, setFamilyAgeErrors] = useState<Record<string, boolean>>({});

  const watchFullName = watch("fullName");
  const watchDob = watch("dob");
  const watchGender = watch("gender");
  const watchBloodGroup = watch("bloodGroup");
  const watchMobileNumber = watch("mobileNumber");
  const watchPhoto = watch("photo");
  const watchOccupation = watch("occupation");

  // Calculate age when DOB changes
  useEffect(() => {
    if (watchDob) {
      const age = calculateAge(watchDob);
      setCalculatedAge(age);
    } else {
      setCalculatedAge(null);
    }
  }, [watchDob]);

  useEffect(() => {
    setValue("familyMembers", familyMembers, { shouldDirty: true });
  }, [familyMembers, setValue]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setPhotoError('Please upload a valid image (JPEG, PNG, WEBP)');
        setValue("photo", null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Image size should be less than 5MB');
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
    setFamilyMembers(familyMembers.map((m) => m.id === id ? { ...m, [field]: value } : m));
    
    // Check age validation for this member
    if (field === 'dob') {
      const age = calculateAge(value);
      if (age >= 18 && value) {
        setFamilyAgeErrors(prev => ({ ...prev, [id]: true }));
        toast.error(`Family member is ${age} years old. They need to join separately.`);
      } else {
        setFamilyAgeErrors(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const getFamilyMemberAge = (dob: string): number => {
    return calculateAge(dob);
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    
    // Check for family members who are 18+
    const adultMembers = familyMembers.filter(m => {
      const age = getFamilyMemberAge(m.dob);
      return age >= 18 && m.dob && m.name;
    });
    
    if (adultMembers.length > 0) {
      toast.error(`Family members ${adultMembers.map(m => m.name).join(', ')} are 18+ and need to join separately.`);
      return;
    }

    // Validate required fields
    const fieldsToValidate = [
      "fullName",
      "dob",
      "gender",
      "bloodGroup",
      "mobileNumber",
      "photo",
      "occupation"
    ];
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      onNext();
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  const shouldShowError = (fieldName: string) => {
    return (hasAttemptedSubmit || touchedFields[fieldName]) && errors[fieldName];
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Photo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Profile Photo <span className="text-red-400">*</span>
          </label>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-24 h-24 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center bg-gradient-to-br from-white/40 to-[#6B1E5B]/5 hover:from-white/60 hover:to-[#6B1E5B]/10 group ${
              watchPhoto instanceof File 
                ? 'border-green-500 bg-green-50/30' 
                : (shouldShowError("photo") || photoError)
                ? 'border-red-400 bg-red-50/30'
                : 'border-[#D4C8C0] hover:border-[#6B1E5B]'
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
          <AnimatePresence>
            {(shouldShowError("photo") || photoError) && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
                {photoError || (errors.photo?.message as string)}
              </motion.p>
            )}
          </AnimatePresence>
          {watchPhoto instanceof File && !photoError && !errors.photo && (
            <p className="text-green-500 text-sm mt-1">✅ Photo uploaded</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("fullName")}
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2 ${
              shouldShowError("fullName") ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
            placeholder="Your full name"
          />
          <AnimatePresence>
            {shouldShowError("fullName") && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
                {errors.fullName?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
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
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] bg-white/50 focus:ring-2 ${
                shouldShowError("dob") ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
            />
          </div>
          {calculatedAge !== null && (
            <p className="text-sm mt-1 text-[#6B5E5A]">Age: <span className="font-semibold text-[#2A1636]">{calculatedAge} years</span></p>
          )}
          <AnimatePresence>
            {shouldShowError("dob") && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
                {errors.dob?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gender, Blood Group, Mobile Number */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <select
            {...register("gender")}
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] appearance-none cursor-pointer bg-white/50 focus:ring-2 ${
              shouldShowError("gender") ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <AnimatePresence>
            {shouldShowError("gender") && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
                {errors.gender?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Blood Group */}
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Blood Group <span className="text-red-400">*</span>
          </label>
          <select
            {...register("bloodGroup")}
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] appearance-none cursor-pointer bg-white/50 focus:ring-2 ${
              shouldShowError("bloodGroup") ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
          >
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
          <AnimatePresence>
            {shouldShowError("bloodGroup") && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
                {errors.bloodGroup?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Mobile Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input
              {...register("mobileNumber")}
              type="tel"
              maxLength={10}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2 ${
                shouldShowError("mobileNumber") ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
              placeholder="Enter 10-digit number"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setValue("mobileNumber", value);
                  if (hasAttemptedSubmit || touchedFields.mobileNumber) {
                    trigger("mobileNumber");
                  }
                }
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-[10px] text-amber-600">Please ensure your mobile number is correct. We will verify it.</p>
          </div>
          <AnimatePresence>
            {shouldShowError("mobileNumber") && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
                {errors.mobileNumber?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-[#2A1636] mb-2">
          Occupation <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
          <input
            {...register("occupation")}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2 ${
              shouldShowError("occupation") ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
            placeholder="Your profession / job title"
          />
        </div>
        <AnimatePresence>
          {shouldShowError("occupation") && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-400 text-sm mt-1">
              {errors.occupation?.message as string}
            </motion.p>
          )}
        </AnimatePresence>
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
          {familyMembers.map((member, index) => {
            const age = getFamilyMemberAge(member.dob);
            const isAdult = age >= 18 && member.dob;
            const memberKey = member.id || `family-fallback-${index}`;
            
            return (
              <motion.div
                key={memberKey}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/60 border border-[#D4C8C0]/30"
              >
                <input
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => updateFamilyMember(memberKey, "name", e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                />
                <div className="relative">
                  <input
                    type="date"
                    placeholder="DOB"
                    value={member.dob}
                    onChange={(e) => updateFamilyMember(memberKey, "dob", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
                  />
                  {member.dob && (
                    <p className={`text-[10px] mt-1 ${isAdult ? 'text-red-500' : 'text-green-500'}`}>
                      {isAdult ? `⚠️ ${age} yrs - Must join separately` : `${age} yrs`}
                    </p>
                  )}
                  {isAdult && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3" /> They need to join separately
                    </p>
                  )}
                </div>
                <select
                  value={member.relation}
                  onChange={(e) => updateFamilyMember(memberKey, "relation", e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm appearance-none"
                >
                  <option value="">Relation</option>
                  {relations.map((relation) => <option key={relation} value={relation}>{relation}</option>)}
                </select>
                {familyMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(memberKey)}
                    className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-[#D4C8C0]/40 text-[#6B5E5A] hover:text-red-500 hover:border-red-200 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
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