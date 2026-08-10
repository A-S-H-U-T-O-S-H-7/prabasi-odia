// components/web/join-community/Step1Personal.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Upload, User, Users, Plus, X, Phone, Calendar, Briefcase, AlertCircle, Check, Globe } from "lucide-react";
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
  const [ageError, setAgeError] = useState<string | null>(null);
  const [familyAgeErrors, setFamilyAgeErrors] = useState<Record<string, boolean>>({});

  const watchDob = watch("dob");
  const watchMobileNumber = watch("mobileNumber");
  const watchMobileCountryCode = watch("mobileCountryCode");
  const watchPhoto = watch("photo");

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

    if (isValid) {
      onNext();
    } else {
      toast.error("Please fill all required fields correctly");
    }
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

      {/* Row 2: Gender, Mobile Number with Country Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input
              type="tel"
              value={watchMobileNumber || ""}
              className={`${inputClass("mobileNumber")} pl-12`}
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
          <FieldHint>
            {shouldShowError("mobileNumber") ? (
              <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
                {errors.mobileNumber?.message as string}
              </motion.p>
            ) : (
              <motion.div key="hint" className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-[10px] text-amber-600">Include country code if outside India</p>
              </motion.div>
            )}
          </FieldHint>
        </div>
      </div>

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