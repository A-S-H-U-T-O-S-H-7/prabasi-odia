// components/web/join-community/Step4Documents.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Upload, Shield, AlertCircle, FileText, Camera, X, CheckCircle } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface Step4DocumentsProps {
  onNext: () => void;
  onBack: () => void;
}

interface DocumentUploadProps {
  label: string;
  name: string;
  icon?: any;
  accept?: string;
  required?: boolean;
  description?: string;
  onUpload?: () => void;
  showErrors?: boolean;
}

function DocumentUpload({ 
  label, 
  name, 
  icon: Icon = FileText,
  accept = "image/*", 
  required = false,
  description = "Upload file",
  onUpload,
  showErrors = false,
}: DocumentUploadProps) {
  const { setValue, watch, trigger, formState: { errors, touchedFields } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const file = watch(name);
  const error = errors[name];
  
  // Check if field should show error
  const shouldShowError = () => {
    return (showErrors || touchedFields[name] || false) && error;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid file (JPEG, PNG, WEBP, PDF)');
        setValue(name, null, { shouldValidate: true });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size should be less than 5MB');
        setValue(name, null, { shouldValidate: true });
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setValue(name, file, { shouldValidate: true });
        trigger(name);
        if (onUpload) onUpload();
      };
      reader.readAsDataURL(file);
    }
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
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid file (JPEG, PNG, WEBP, PDF)');
        setValue(name, null, { shouldValidate: true });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size should be less than 5MB');
        setValue(name, null, { shouldValidate: true });
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setValue(name, file, { shouldValidate: true });
        trigger(name);
        if (onUpload) onUpload();
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setValue(name, null, { shouldValidate: true });
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    trigger(name);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#2A1636] mb-2">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#6B1E5B]" />}
          {label} {required && <span className="text-red-400">*</span>}
        </span>
      </label>
      
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
          preview 
            ? 'border-green-500 bg-gradient-to-br from-green-50/30 to-[#D9772B]/5'
            : isDragging
              ? 'border-[#6B1E5B] bg-[#6B1E5B]/10'
              : shouldShowError() || uploadError
                ? 'border-red-400 bg-red-50/30'
                : 'border-[#D4C8C0] hover:border-[#6B1E5B] bg-white/40 hover:bg-white/60'
        }`}
      >
        {preview ? (
          <div className="relative w-full h-32">
            <Image 
              src={preview} 
              alt={label} 
              fill 
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeFile}
                className="p-2 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-green-500/90 text-white text-xs font-medium flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Uploaded
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 px-4">
            <div className="w-10 h-10 rounded-full bg-[#6B1E5B]/10 flex items-center justify-center mb-2">
              <Upload className="w-5 h-5 text-[#6B1E5B]/60" />
            </div>
            <p className="text-xs font-medium text-[#2A1636]">Click or drag to upload</p>
            <p className="text-[10px] text-[#6B5E5A]/60 mt-0.5">{description}</p>
          </div>
        )}
        
        <input 
          ref={fileInputRef} 
          type="file" 
          accept={accept} 
          className="hidden" 
          onChange={handleFileUpload}
        />
      </motion.div>
      
      <div className="min-h-6 mt-1" aria-live="polite">
        <AnimatePresence>
          {(shouldShowError() || uploadError) && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 text-sm"
            >
              {uploadError || (error?.message as string)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Step4Documents({ onNext, onBack }: Step4DocumentsProps) {
  const { register, watch, setValue, trigger, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const consent = watch("consent") || false;
  const consentRegistration = register("consent");

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    
    // Trigger validation for all fields in step 4
    const isValid = await trigger([
      "aadharFront",
      "aadharBack",
      "voterId",
      "consent"
    ]);
    
    if (isValid) {
      onNext();
    } else {
      toast.error("Please upload all required documents and agree to consent");
    }
  };

  // Helper to check if field should show error
  const shouldShowError = (fieldName: string) => {
    return (hasAttemptedSubmit || touchedFields[fieldName]) && errors[fieldName];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6B1E5B]/20 to-[#D9772B]/20 flex items-center justify-center">
          <Shield className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">Verify Your Identity</h2>
          <p className="text-sm text-[#6B5E5A]">Upload your documents for community verification</p>
        </div>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">🔒 Your documents are secure</p>
          <p className="text-xs text-amber-700/70 mt-0.5">
            Your documents are encrypted and only visible to admins for verification purposes.
          </p>
        </div>
      </motion.div>

      {/* Three Document Uploads in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DocumentUpload 
          label="Aadhar Front" 
          name="aadharFront" 
          icon={Camera}
          description="Front side"
          required 
          showErrors={hasAttemptedSubmit}
        />
        <DocumentUpload 
          label="Aadhar Back" 
          name="aadharBack" 
          icon={Camera}
          description="Back side"
          required 
          showErrors={hasAttemptedSubmit}
        />
        <DocumentUpload 
          label="Voter ID" 
          name="voterId" 
          icon={FileText}
          description="Voter ID card"
          required 
          showErrors={hasAttemptedSubmit}
        />
      </div>

      {/* Consent Checkbox */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2"
      >
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              {...consentRegistration}
              className={`w-5 h-5 rounded border-2 transition-all duration-200 cursor-pointer ${
                shouldShowError("consent") 
                  ? 'border-red-400 focus:ring-red-200' 
                  : consent 
                    ? 'border-green-500 bg-green-500' 
                    : 'border-[#D4C8C0]'
              }`}
              onChange={(event) => {
                setValue("consent", event.target.checked, { shouldTouch: true, shouldValidate: true });
              }}
            />
            {/* {consent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )} */}
          </div>
          <div>
            <span className={`text-sm transition-colors ${
              shouldShowError("consent") 
                ? 'text-red-500' 
                : 'text-[#2A1636] group-hover:text-[#6B1E5B]'
            }`}>
              I confirm that the documents uploaded are genuine and belong to me.
            </span>
            <p className={`text-xs mt-0.5 ${
              shouldShowError("consent") 
                ? 'text-red-400' 
                : 'text-[#6B5E5A]/70'
            }`}>
              I consent to Prabasi Odia storing and verifying these documents.
              <span className="text-red-400 ml-1">*</span>
            </p>
          </div>
        </label>
        <div className="min-h-7 mt-2" aria-live="polite">
          <AnimatePresence>
            {shouldShowError("consent") && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400 text-sm"
              >
                {errors.consent?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer"
        >
          ← Back
        </motion.button>
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
