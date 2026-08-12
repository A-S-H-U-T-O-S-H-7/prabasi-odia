"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { 
  Heart, Users, Droplet, Handshake, Sparkles, GraduationCap, 
  Network, AlertCircle, Check, Shield, Loader2, XCircle, 
  Upload, Camera, FileText, Image as ImageIcon, X
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { FaPassport } from "react-icons/fa";
import Image from "next/image";

interface Step3InterestsProps {
  onNext: () => void;
  onBack: () => void;
}

const interestOptions = [
  { id: "volunteering", label: "Volunteering", icon: Heart, color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "bloodDonation", label: "Blood Donation", icon: Droplet, color: "bg-red-100 text-red-700 border-red-200" },
  { id: "jobHelp", label: "Job Help / Referrals", icon: Handshake, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "socialAwareness", label: "Social Awareness", icon: Sparkles, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { id: "cleanlinessDrives", label: "Cleanliness Drives", icon: Users, color: "bg-green-100 text-green-700 border-green-200" },
  { id: "culturalEvents", label: "Cultural Events", icon: Sparkles, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "mentorship", label: "Mentorship", icon: GraduationCap, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { id: "startupNetworking", label: "Startup Networking", icon: Network, color: "bg-teal-100 text-teal-700 border-teal-200" },
];

// ✅ Document upload component - OPTIONAL
function DocumentUpload({
  label,
  name,
  accept = "image/*",
  required = false,
  onUpload,
}: {
  label: string;
  name: string;
  accept?: string;
  required?: boolean;
  onUpload?: (file: File) => void;
}) {
  const { setValue, watch, trigger, formState: { errors, touchedFields } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const file = watch(name);
  const error = errors[name];
  const touched = touchedFields[name];
  const showError = (touched || false) && error;

  const handleFileUpload = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid file (JPEG, PNG, WEBP, PDF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setValue(name, file, { shouldValidate: true });
      trigger(name);
      if (onUpload) onUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const removeFile = () => {
    setPreview(null);
    setValue(name, null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
    trigger(name);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
        {!required && <span className="text-[#6B5E5A] text-xs ml-1">(Optional)</span>}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
          preview 
            ? 'border-green-500 bg-green-50/30'
            : isDragging
              ? 'border-[#6B1E5B] bg-[#6B1E5B]/10'
              : showError
                ? 'border-red-400 bg-red-50/30'
                : 'border-[#D4C8C0]/50 bg-white/40 hover:border-[#6B1E5B] hover:bg-white/60'
        }`}
      >
        {preview ? (
          <div className="relative w-full h-28">
            <Image src={preview} alt={label} fill className="object-cover rounded-xl" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
              ✅ Uploaded
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="w-10 h-10 rounded-full bg-[#6B1E5B]/10 flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-[#6B1E5B]/60" />
            </div>
            <p className="text-sm font-medium text-[#2A1636]">Click or drag to upload</p>
            <p className="text-xs text-[#6B5E5A]/60 mt-0.5">PNG, JPG, WEBP, PDF (Max 5MB)</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      </div>

      {showError && (
        <p className="text-red-400 text-xs mt-1">{error?.message as string}</p>
      )}
    </div>
  );
}

export default function Step3Interests({ onNext, onBack }: Step3InterestsProps) {
  const { watch, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [hasAadhar, setHasAadhar] = useState<"yes" | "no" | null>(null);
  
  const selectedInterests = watch("interests") || [];
  const aadharNumber = watch("aadharNumber") || "";
  const passportNumber = watch("passportNumber") || "";

  const shouldShowError = (name: string) => Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const toggleInterest = (id: string) => {
    const current = selectedInterests || [];
    const updated = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
    setValue("interests", updated, { shouldValidate: true });
  };

  const handleHasAadhar = (value: "yes" | "no") => {
    setHasAadhar(value);
    // Clear the other field when switching
    if (value === "yes") {
      setValue("passportNumber", "");
      setValue("passportFile", null);
    } else {
      setValue("aadharNumber", "");
      setValue("aadharFront", null);
      setValue("aadharBack", null);
    }
  };

  const handleNext = async () => {
    setHasAttemptedSubmit(true);

    // ✅ 1. Check if at least 2 interests are selected
    if ((selectedInterests || []).length < 2) {
      toast.error("Please select at least 2 interests");
      return;
    }

    // ✅ 2. Check if Aadhar/Passport selection is made
    if (!hasAadhar) {
      toast.error("Please select whether you have Aadhar or Passport");
      return;
    }

    // ✅ 3. Validate based on selection
    if (hasAadhar === "yes") {
      // Validate Aadhar number - MANDATORY
      if (!aadharNumber || aadharNumber.length < 12) {
        toast.error("Please enter a valid 12-digit Aadhar number");
        return;
      }
      
      // ✅ Document uploads are OPTIONAL - no validation needed
      // Just trigger the fields so they get marked as touched
      trigger("aadharFront");
      trigger("aadharBack");
      
    } else {
      // Validate Passport number - MANDATORY
      if (!passportNumber || passportNumber.length < 6) {
        toast.error("Please enter a valid passport number (6-9 characters)");
        return;
      }
      
      // ✅ Document upload is OPTIONAL - no validation needed
      trigger("passportFile");
    }

    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 md:space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">💖 Your Passions & Identity</h2>
          <p className="text-sm text-[#6B5E5A]">What drives you? Select at least 2 interests</p>
        </div>
      </div>

      {/* Interests Grid */}
      <div>
        <label className="block text-sm font-medium text-[#2A1636] mb-3">
          I'm interested in... <span className="text-red-400">* (Min 2)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {interestOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedInterests?.includes(option.id) || false;

            return (
              <motion.button
                key={option.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleInterest(option.id)}
                className={`relative flex flex-col items-center justify-center gap-2 h-[92px] md:h-[104px] p-3 rounded-2xl border-2 transition-colors duration-300 cursor-pointer ${
                  isSelected ? `${option.color} shadow-md` : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#6B1E5B]/30 hover:bg-white/60"
                }`}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? "text-current" : "text-[#6B5E5A]/40"}`} />
                <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isSelected ? "text-current" : "text-[#6B5E5A]"}`}>
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="min-h-6 mt-2">
          <AnimatePresence mode="wait">
            {shouldShowError("interests") ? (
              <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-red-400 text-sm">
                {errors.interests?.message as string}
              </motion.p>
            ) : selectedInterests.length > 0 ? (
              <motion.p
                key="count"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`text-xs ${selectedInterests.length >= 2 ? "text-green-600" : "text-red-500 font-medium"}`}
              >
                {selectedInterests.length} of minimum 2 selected
                {selectedInterests.length >= 2 ? " ✅" : " ❌ Please select 2 interests"}
              </motion.p>
            ) : (
              <motion.p key="empty" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-medium">
                Please select at least 2 interests
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Do you have Aadhar? Section */}
      <div className="pt-2 border-t border-[#D4C8C0]/20">
        <label className="block text-sm font-medium text-[#2A1636] mb-3">
          Do you have Aadhar? <span className="text-red-400">*</span>
        </label>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleHasAadhar("yes")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
              hasAadhar === "yes"
                ? "border-[#6B1E5B] bg-[#6B1E5B]/5 shadow-md"
                : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#6B1E5B]/30"
            }`}
          >
            <Shield className={`w-5 h-5 ${hasAadhar === "yes" ? "text-[#6B1E5B]" : "text-[#6B5E5A]"}`} />
            <span className={`font-semibold ${hasAadhar === "yes" ? "text-[#6B1E5B]" : "text-[#2A1636]"}`}>Yes</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleHasAadhar("no")}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
              hasAadhar === "no"
                ? "border-[#D9772B] bg-[#D9772B]/5 shadow-md"
                : "border-[#D4C8C0]/30 bg-white/40 hover:border-[#D9772B]/30"
            }`}
          >
            <FaPassport className={`w-5 h-5 ${hasAadhar === "no" ? "text-[#D9772B]" : "text-[#6B5E5A]"}`} />
            <span className={`font-semibold ${hasAadhar === "no" ? "text-[#D9772B]" : "text-[#2A1636]"}`}>No (Passport)</span>
          </motion.button>
        </div>

        {hasAttemptedSubmit && !hasAadhar && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Please select whether you have Aadhar or Passport
          </p>
        )}
      </div>

      {/* ID Number & Document Upload */}
      <AnimatePresence mode="wait">
        {hasAadhar === "yes" ? (
          <motion.div
            key="aadhar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Aadhar Number - MANDATORY */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-2">
                Aadhar Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  value={aadharNumber}
                  placeholder="Enter 12-digit Aadhar number"
                  className={`w-full px-4 py-3 pl-12 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 ${
                    shouldShowError("aadharNumber")
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : aadharNumber.length === 12
                      ? "border-green-400 focus:border-green-400 focus:ring-green-200"
                      : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"
                  }`}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                    setValue("aadharNumber", value);
                    if (hasAttemptedSubmit || touchedFields.aadharNumber) {
                      trigger("aadharNumber");
                    }
                  }}
                />
                {aadharNumber.length === 12 && !shouldShowError("aadharNumber") && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold">✅</span>
                )}
              </div>
              {shouldShowError("aadharNumber") && (
                <p className="text-red-400 text-sm mt-1">{errors.aadharNumber?.message as string}</p>
              )}
              {!shouldShowError("aadharNumber") && aadharNumber.length > 0 && aadharNumber.length < 12 && (
                <p className="text-xs text-amber-600 mt-1">12 digits required</p>
              )}
              {hasAttemptedSubmit && !aadharNumber && (
                <p className="text-red-400 text-sm mt-1">Aadhar number is required</p>
              )}
            </div>

            {/* Aadhar Front Upload - OPTIONAL */}
            <DocumentUpload
              label="Aadhar Front"
              name="aadharFront"
              required={false}
            />

            {/* Aadhar Back Upload - OPTIONAL */}
            <DocumentUpload
              label="Aadhar Back"
              name="aadharBack"
              required={false}
            />

            {/* Optional note */}
            <p className="text-xs text-[#6B5E5A]/60 italic">
              📎 Uploading Aadhar documents is optional but helps with faster verification.
            </p>
          </motion.div>
        ) : hasAadhar === "no" ? (
          <motion.div
            key="passport"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Passport Number - MANDATORY */}
            <div>
              <label className="block text-sm font-medium text-[#2A1636] mb-2">
                Passport Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FaPassport className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
                <input
                  type="text"
                  value={passportNumber}
                  placeholder="Enter passport number (6-9 characters)"
                  className={`w-full px-4 py-3 pl-12 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 uppercase ${
                    shouldShowError("passportNumber")
                      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                      : passportNumber.length >= 6
                      ? "border-green-400 focus:border-green-400 focus:ring-green-200"
                      : "border-[#D4C8C0]/50 focus:border-[#D9772B] focus:ring-[#D9772B]/20"
                  }`}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
                    setValue("passportNumber", value);
                    if (hasAttemptedSubmit || touchedFields.passportNumber) {
                      trigger("passportNumber");
                    }
                  }}
                />
                {passportNumber.length >= 6 && !shouldShowError("passportNumber") && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-bold">✅</span>
                )}
              </div>
              {shouldShowError("passportNumber") && (
                <p className="text-red-400 text-sm mt-1">{errors.passportNumber?.message as string}</p>
              )}
              {!shouldShowError("passportNumber") && passportNumber.length > 0 && passportNumber.length < 6 && (
                <p className="text-xs text-amber-600 mt-1">Minimum 6 characters required</p>
              )}
              {hasAttemptedSubmit && !passportNumber && (
                <p className="text-red-400 text-sm mt-1">Passport number is required</p>
              )}
            </div>

            {/* Passport Page Upload - OPTIONAL */}
            <DocumentUpload
              label="Passport Document (First Page)"
              name="passportFile"
              required={false}
            />

            {/* Optional note */}
            <p className="text-xs text-[#6B5E5A]/60 italic">
              📎 Uploading passport document is optional but helps with faster verification.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20 mt-6">
        <button 
          onClick={onBack} 
          className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer"
        >
          ← Back
        </button>
        <button 
          onClick={handleNext}
          className="px-6 py-2.5 rounded-xl font-medium transition-all duration-300 cursor-pointer bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 hover:scale-[1.02] flex items-center gap-2"
        >
          Next →
        </button>
      </div>
    </motion.div>
  );
}