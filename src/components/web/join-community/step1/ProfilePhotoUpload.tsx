// components/web/join-community/step1/ProfilePhotoUpload.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Upload, AlertCircle, Check } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ProfilePhotoUploadProps {
  hasAttemptedSubmit: boolean;
}

export default function ProfilePhotoUpload({ hasAttemptedSubmit }: ProfilePhotoUploadProps) {
  const { setValue, watch, trigger, formState: { errors, touchedFields } } = useFormContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const watchPhoto = watch("photo");

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

  const shouldShowError = () => {
    return Boolean((hasAttemptedSubmit || touchedFields.photo) && errors.photo);
  };

  return (
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
              : shouldShowError() || photoError
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
            {(shouldShowError() || photoError) && (
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
  );
}