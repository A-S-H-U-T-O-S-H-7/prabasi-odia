// components/web/join-community/Step1Personal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Upload, User, Users, Plus, X, Edit2, Phone } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";

interface FamilyMember {
  id: string;
  name: string;
  age: number | string;
  relation: string;
  occupation: string;
}

interface Step1PersonalProps {
  onNext: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
}

const relations = ["Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother", "Uncle", "Aunt", "Nephew", "Niece", "Cousin", "Other"];

export default function Step1Personal({ onNext, onBack, isFirstStep = true }: Step1PersonalProps) {
  const { register, watch, getValues, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const savedMembers = getValues("familyMembers") as FamilyMember[] | undefined;
    return savedMembers?.length
      ? savedMembers
      : [{ id: "1", name: "", age: "", relation: "", occupation: "" }];
  });
  const [editingId, setEditingId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Watch all fields for real-time validation
  const watchFullName = watch("fullName");
  const watchAge = watch("age");
  const watchGender = watch("gender");
  const watchBloodGroup = watch("bloodGroup");
  const watchMobileNumber = watch("mobileNumber");
  const watchPhoto = watch("photo");

  // The form is updated in one direction only. Reading it back into local state
  // created a render loop when this step was mounted again after going back.
  useEffect(() => {
    setValue("familyMembers", familyMembers, { shouldDirty: true });
  }, [familyMembers, setValue]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setPhotoError('Please upload a valid image (JPEG, PNG, WEBP)');
        setValue("photo", null);
        return;
      }
      
      // Validate file size (max 5MB)
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
        // Only trigger validation if user has attempted submit or field was touched
        if (hasAttemptedSubmit || touchedFields.photo) {
          trigger("photo");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { id: Date.now().toString(), name: "", age: "", relation: "", occupation: "" }]);
  };

  const removeFamilyMember = (id: string) => {
    if (familyMembers.length <= 1) return;
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
  };

  const updateFamilyMember = (id: string, field: string, value: string | number) => {
    setFamilyMembers(familyMembers.map((m) => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    
    // Trigger validation for all fields in step 1
    const isValid = await trigger([
      "fullName",
      "age",
      "gender",
      "bloodGroup",
      "mobileNumber",
      "photo"
    ]);
    
    if (isValid) {
      onNext();
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  // Helper to check if field should show error
  const shouldShowError = (fieldName: string) => {
    // Only show error if:
    // 1. User has attempted submit, OR
    // 2. Field has been touched/edited
    return (hasAttemptedSubmit || touchedFields[fieldName]) && errors[fieldName];
  };

  // Helper to check if field is valid
  const isValidField = (fieldName: string, value: any) => {
    return value && value.length > 0 && !errors[fieldName];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center">
          <User className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">Your Identity & Family</h2>
          <p className="text-sm text-[#6B5E5A]">Tell us about yourself and your family</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Photo */}
        <div className="md:col-span-2 min-h-[144px]">
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
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-1"
              >
                {photoError || (errors.photo?.message as string)}
              </motion.p>
            )}
          </AnimatePresence>
          {watchPhoto instanceof File && !photoError && !errors.photo && (
            <p className="text-green-500 text-sm mt-1">✅ Photo uploaded successfully</p>
          )}
        </div>

        {/* Full Name */}
        <div className="min-h-[104px]">
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("fullName")}
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2 ${
              shouldShowError("fullName")
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : isValidField("fullName", watchFullName)
                ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
            placeholder="Your full name"
            onBlur={() => {
              // Trigger validation on blur if field has value or was touched
              if (watchFullName) {
                trigger("fullName");
              }
            }}
          />
          <AnimatePresence>
            {shouldShowError("fullName") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.fullName?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Age */}
        <div className="min-h-[104px]">
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Age <span className="text-red-400">*</span>
          </label>
          <input
            {...register("age")}
            type="number"
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 bg-white/50 focus:ring-2 ${
              shouldShowError("age")
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : isValidField("age", watchAge)
                ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
            placeholder="Your age"
            onBlur={() => {
              if (watchAge) {
                trigger("age");
              }
            }}
          />
          <AnimatePresence>
            {shouldShowError("age") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.age?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gender, Blood Group, Mobile Number - In one line (3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Gender */}
        <div className="min-h-[104px]">
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <select
            {...register("gender")}
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] appearance-none cursor-pointer bg-white/50 focus:ring-2 ${
              shouldShowError("gender")
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : isValidField("gender", watchGender)
                ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
            onBlur={() => {
              if (watchGender) {
                trigger("gender");
              }
            }}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          <AnimatePresence>
            {shouldShowError("gender") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.gender?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Blood Group */}
        <div className="min-h-[104px]">
          <label className="block text-sm font-medium text-[#2A1636] mb-2">
            Blood Group <span className="text-red-400">*</span>
          </label>
          <select
            {...register("bloodGroup")}
            className={`w-full px-4 py-3 rounded-2xl border transition-all duration-300 outline-none text-[#2A1636] appearance-none cursor-pointer bg-white/50 focus:ring-2 ${
              shouldShowError("bloodGroup")
                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                : isValidField("bloodGroup", watchBloodGroup)
                ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
            }`}
            onBlur={() => {
              if (watchBloodGroup) {
                trigger("bloodGroup");
              }
            }}
          >
            <option value="">Select blood group</option>
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
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.bloodGroup?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Number */}
        <div className="min-h-[104px]">
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
                shouldShowError("mobileNumber")
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                  : isValidField("mobileNumber", watchMobileNumber) && watchMobileNumber.length === 10
                  ? 'border-green-400 focus:border-green-400 focus:ring-green-200'
                  : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
              placeholder="Enter 10-digit number"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setValue("mobileNumber", value);
                  // Only validate if user has interacted or attempted submit
                  if (hasAttemptedSubmit || touchedFields.mobileNumber) {
                    trigger("mobileNumber");
                  }
                }
              }}
              onBlur={() => {
                if (watchMobileNumber) {
                  trigger("mobileNumber");
                }
              }}
            />
          </div>
          <AnimatePresence>
            {shouldShowError("mobileNumber") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.mobileNumber?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden interests field for validation */}
      <input type="hidden" {...register("interests")} />

      {/* Family Members Section with Occupation */}
      <div className="pt-4 border-t border-[#D4C8C0]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#6B1E5B]/10 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#6B1E5B]" />
            </div>
            <h3 className="text-sm font-semibold text-[#2A1636]">Family Members</h3>
            <span className="text-xs text-[#6B5E5A]">({familyMembers.length})</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addFamilyMember}
            className="flex items-center gap-1.5 text-sm text-[#6B1E5B] hover:text-[#531547] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Member
          </motion.button>
        </div>

        <div className="space-y-3">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white/60 border border-[#D4C8C0]/30"
            >
              <input
                placeholder="Name"
                value={member.name}
                onChange={(event) => updateFamilyMember(member.id, "name", event.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
              />
              <input
                placeholder="Age"
                type="number"
                min="0"
                value={member.age}
                onChange={(event) => updateFamilyMember(member.id, "age", event.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
              />
              <select
                value={member.relation}
                onChange={(event) => updateFamilyMember(member.id, "relation", event.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm appearance-none"
              >
                <option value="">Select relation</option>
                {relations.map((relation) => <option key={relation} value={relation}>{relation}</option>)}
              </select>
              <input
                placeholder="Occupation"
                value={member.occupation}
                onChange={(event) => updateFamilyMember(member.id, "occupation", event.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/70 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm"
              />
              {familyMembers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFamilyMember(member.id)}
                  aria-label={`Remove family member ${index + 1}`}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-[#D4C8C0]/40 text-[#6B5E5A] hover:text-red-500 hover:border-red-200 shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {false && <AnimatePresence mode="popLayout">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6B1E5B]/10 to-[#D9772B]/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-[#6B1E5B]/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2A1636] truncate">
                    {member.name || `Family Member ${index + 1}`}
                  </p>
                  <p className="text-xs text-[#6B5E5A]">
                    {member.age || '—'} yrs · {member.relation || 'Select relation'}
                    {member.occupation && ` · 💼 ${member.occupation}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingId(member.id)}
                  className="p-2 rounded-xl text-[#6B5E5A]/40 hover:text-[#6B1E5B] hover:bg-[#6B1E5B]/5 transition-all duration-300 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFamilyMember(member.id)}
                  className="p-2 rounded-xl text-[#6B5E5A]/40 hover:text-red-500 hover:bg-red-50 transition-all duration-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>}

        {/* Edit Form with Occupation */}
        {false && editingId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-white/80 to-[#6B1E5B]/5 border border-[#D4C8C0]/30 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              placeholder="Name"
              value={familyMembers.find(m => m.id === editingId)?.name || ''}
              onChange={(e) => updateFamilyMember(editingId, 'name', e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-300 text-sm"
            />
            <input
              placeholder="Age"
              type="number"
              value={familyMembers.find(m => m.id === editingId)?.age || ''}
              onChange={(e) => updateFamilyMember(editingId, 'age', e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-300 text-sm"
            />
            <select
              value={familyMembers.find(m => m.id === editingId)?.relation || ''}
              onChange={(e) => updateFamilyMember(editingId, 'relation', e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-300 text-sm appearance-none cursor-pointer"
            >
              <option value="">Select relation</option>
              {relations.map((rel) => (<option key={rel} value={rel}>{rel}</option>))}
            </select>
            <input
              placeholder="Occupation"
              value={familyMembers.find(m => m.id === editingId)?.occupation || ''}
              onChange={(e) => updateFamilyMember(editingId, 'occupation', e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/40 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none transition-all duration-300 text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setEditingId("")}
              className="col-span-1 sm:col-span-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] to-[#D9772B] text-white text-sm font-medium hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              Save Member ✓
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20">
        {!isFirstStep ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer"
          >
            ← Back
          </motion.button>
        ) : (
          <div />
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-medium shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 cursor-pointer"
        >
          Next →
        </motion.button>
      </div>
    </motion.div>
  );
}
